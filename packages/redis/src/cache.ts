import { createClient, type RedisClientType } from "redis";
import {
  ARRAY_INDEX_NOT_FOUND,
  COMPOUND_KEY_SEPARATOR,
  DEFAULT_REDIS_DB,
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_TTL_SECONDS,
  HIT_RATE_PRECISION,
  INITIAL_HITS,
  INITIAL_MEMORY_USAGE,
  INITIAL_MISSES,
  INITIAL_TOTAL_KEYS,
  MAX_COMMANDS_QUEUE_LENGTH,
  PERCENTAGE_MULTIPLIER,
  REDIS_EXISTS,
  REDIS_SUCCESS,
} from "./consts";
import {
  type CacheClosure,
  CacheConnectionError,
  CacheError,
  type CacheEvent,
  type CacheEventListener,
  type CacheExpiration,
  type CacheKey,
  type CacheOptions,
  CacheSerializationError,
  type CacheStats,
  type CacheValue,
  type RedisCacheStore,
  type RedisConnectionInfo,
  type TaggedCacheStore,
} from "./types";

// TODO: Use superjson for better serialization
const json = {
  serialize: (value: CacheValue): string => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new CacheSerializationError(
        `Failed to serialize value: ${error instanceof Error ? error.message : "Unknown error"}`,
        value,
      );
    }
  },
  deserialize: <T>(value: string | null): T | null => {
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new CacheSerializationError(
        `Failed to deserialize value: ${error instanceof Error ? error.message : "Unknown error"}`,
        value,
      );
    }
  },
};

export class Cache implements RedisCacheStore {
  #prefix = "";
  #ttl: number;
  #connection: string;
  #stats = {
    hits: INITIAL_HITS,
    misses: INITIAL_MISSES,
    totalKeys: INITIAL_TOTAL_KEYS,
    memoryUsage: INITIAL_MEMORY_USAGE,
  };
  #eventListeners: CacheEventListener[] = [];
  protected readonly redis: RedisClientType;

  constructor(connection: string, opts: CacheOptions = {}) {
    this.#connection = connection;
    this.redis = createClient({
      url: connection,
      commandsQueueMaxLength: MAX_COMMANDS_QUEUE_LENGTH,
    });
    this.#prefix = opts.prefix ?? "";
    this.#ttl = opts.ttl ?? DEFAULT_TTL_SECONDS;
  }

  // ============================================================================
  // Basic Cache Operations
  // ============================================================================

  async get<T = CacheValue>(key: CacheKey, defaultValue?: T): Promise<T | null> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const start = Date.now();

      const value = await this.redis.get(cacheKey);
      const end = Date.now();

      if (value !== null) {
        this.#stats.hits++;
        this.emitEvent("hit", cacheKey, { timing: end - start });
        return this.deserialize<T>(value);
      }

      this.#stats.misses++;
      this.emitEvent("miss", cacheKey, { timing: end - start });
      return defaultValue ?? null;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("get", cacheKey, error);
      this.emitEvent("error", key, { error: error as Error });
      throw new CacheError(errorMessage, key, "get");
    }
  }

  async put(key: CacheKey, value: CacheValue, ttl?: CacheExpiration): Promise<boolean> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const expiration = this.normalizeTtl(ttl);

      const serializedValue = this.serialize(value);
      const result = await this.redis.set(cacheKey, serializedValue);

      if (expiration) {
        await this.redis.expire(cacheKey, expiration);
      }

      this.emitEvent("set", cacheKey, { value, ttl: expiration });
      return result === REDIS_SUCCESS;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("put", cacheKey, error, {
        value,
        ttl,
      });
      this.emitEvent("error", key, { error: error as Error });
      throw new CacheError(errorMessage, key, "put");
    }
  }

  async add(key: CacheKey, value: CacheValue, ttl?: CacheExpiration): Promise<boolean> {
    try {
      const exists = await this.has(key);
      if (exists) return false;
      return await this.put(key, value, ttl);
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("add", cacheKey, error, {
        value,
        ttl,
      });
      throw new CacheError(errorMessage, key, "add");
    }
  }

  async has(key: CacheKey): Promise<boolean> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const exists = await this.redis.exists(cacheKey);
      return exists === REDIS_EXISTS;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("has", cacheKey, error);
      throw new CacheError(errorMessage, key, "has");
    }
  }

  async missing(key: CacheKey): Promise<boolean> {
    try {
      return !(await this.has(key));
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("missing", cacheKey, error);
      throw new CacheError(errorMessage, key, "missing");
    }
  }

  async delete(key: CacheKey): Promise<boolean> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const result = await this.redis.del(cacheKey);
      this.emitEvent("delete", cacheKey);
      return result === REDIS_EXISTS;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("delete", cacheKey, error);
      throw new CacheError(errorMessage, key, "delete");
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.redis.flushDb();
      this.emitEvent("flush");
      return result === REDIS_SUCCESS;
    } catch (error) {
      const errorMessage = this.formatErrorMessage("flush", "ALL_KEYS", error);
      throw new CacheError(errorMessage, undefined, "flush");
    }
  }

  // ============================================================================
  // Advanced Cache Operations
  // ============================================================================

  async remember<T = CacheValue>(
    key: CacheKey,
    ttl: CacheExpiration,
    closure: CacheClosure<T>,
  ): Promise<T> {
    try {
      const value = await this.get<T>(key);
      if (value !== null) {
        return value;
      }

      const computedValue = await closure();
      await this.put(key, computedValue as CacheValue, ttl);
      return computedValue;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("remember", cacheKey, error, { ttl });
      throw new CacheError(errorMessage, key, "remember");
    }
  }

  async rememberForever<T = CacheValue>(key: CacheKey, closure: CacheClosure<T>): Promise<T> {
    return this.remember(key, null, closure);
  }

  async pull<T = CacheValue>(key: CacheKey): Promise<T | null> {
    try {
      const value = await this.get<T>(key);
      if (value !== null) {
        await this.delete(key);
      }
      return value;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("pull", cacheKey, error);
      throw new CacheError(errorMessage, key, "pull");
    }
  }

  // ============================================================================
  // Increment/Decrement Operations
  // ============================================================================

  async increment(key: CacheKey, value = 1): Promise<number> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const result = await this.redis.incrBy(cacheKey, value);
      return result;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("increment", cacheKey, error, {
        incrementBy: value,
      });
      throw new CacheError(errorMessage, key, "increment");
    }
  }

  async decrement(key: CacheKey, value = 1): Promise<number> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const result = await this.redis.decrBy(cacheKey, value);
      return result;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("decrement", cacheKey, error, {
        decrementBy: value,
      });
      throw new CacheError(errorMessage, key, "decrement");
    }
  }

  // ============================================================================
  // Multiple Operations
  // ============================================================================

  async many(keys: CacheKey[]): Promise<Record<string, CacheValue | null>> {
    try {
      await this.connect();
      const cacheKeys = keys.map((key) => this.buildKey(key));
      const values = await this.redis.mGet(cacheKeys);

      return keys.reduce<Record<string, CacheValue | null>>((results, key, index) => {
        const cacheKey = this.buildKey(key);
        const value = values[index];
        results[cacheKey] = value ? this.deserialize(value) : null;
        return results;
      }, {});
    } catch (error) {
      const errorMessage = this.formatErrorMessage("many", "MULTIPLE_KEYS", error, {
        keyCount: keys.length,
        keys: keys.map((k) => this.buildKey(k)),
      });
      throw new CacheError(errorMessage, undefined, "many");
    }
  }

  async putMany(values: Record<string, CacheValue>, ttl?: CacheExpiration): Promise<boolean> {
    try {
      const results = await Promise.all(
        Object.entries(values).map(([key, value]) => this.put(key, value, ttl)),
      );
      return results.every(Boolean);
    } catch (error) {
      const errorMessage = this.formatErrorMessage("putMany", "MULTIPLE_KEYS", error, {
        valueCount: Object.keys(values).length,
        ttl,
      });
      throw new CacheError(errorMessage, undefined, "putMany");
    }
  }

  async deleteMultiple(keys: CacheKey[]): Promise<boolean> {
    try {
      const results = await Promise.all(keys.map((key) => this.delete(key)));
      return results.every(Boolean);
    } catch (error) {
      const errorMessage = this.formatErrorMessage("deleteMultiple", "MULTIPLE_KEYS", error, {
        keyCount: keys.length,
        keys: keys.map((k) => this.buildKey(k)),
      });
      this.emitEvent("error", undefined, { error: error as Error });
      throw new CacheError(errorMessage, undefined, "deleteMultiple");
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  tags(names: string[]): TaggedCacheStore {
    throw new Error(
      `Tags are not supported in this Redis cache implementation. Attempted to use tags: [${names.join(", ")}]`,
    );
  }

  getPrefix(): string {
    return this.#prefix;
  }

  setPrefix(prefix: string): void {
    this.#prefix = prefix;
  }

  async getTtl(key: CacheKey): Promise<number | null> {
    try {
      await this.connect();
      const cacheKey = this.buildKey(key);
      const ttl = await this.redis.ttl(cacheKey);
      return ttl > 0 ? ttl : null;
    } catch (error) {
      const cacheKey = this.buildKey(key);
      const errorMessage = this.formatErrorMessage("getTtl", cacheKey, error);
      this.emitEvent("error", key, { error: error as Error });
      throw new CacheError(errorMessage, key, "getTtl");
    }
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  async connect(): Promise<void> {
    try {
      if (!this.redis.isOpen) {
        await this.redis.connect();
      }
    } catch (error) {
      const errorMessage = this.formatErrorMessage("connect", "REDIS_CONNECTION", error, {
        connectionUrl: this.#connection,
      });
      throw new CacheConnectionError(errorMessage, this.#connection);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.redis.isOpen) {
        await this.redis.disconnect();
      }
    } catch (error) {
      const errorMessage = this.formatErrorMessage("disconnect", "REDIS_CONNECTION", error, {
        connectionUrl: this.#connection,
      });
      throw new CacheConnectionError(errorMessage, this.#connection);
    }
  }

  isConnected(): boolean {
    return this.redis.isOpen;
  }

  // ============================================================================
  // Redis Specific Methods
  // ============================================================================

  getRedis(): RedisClientType {
    return this.redis;
  }

  getConnectionInfo(): RedisConnectionInfo {
    return {
      host: DEFAULT_REDIS_HOST,
      port: DEFAULT_REDIS_PORT,
      db: DEFAULT_REDIS_DB,
      status: this.redis.isOpen ? "connected" : "disconnected",
    };
  }

  async executeCommand<T>(command: string, ...args: unknown[]): Promise<T> {
    try {
      await this.connect();
      return await (this.redis as any)[command](...args);
    } catch (error) {
      const errorMessage = this.formatErrorMessage("executeCommand", "REDIS_COMMAND", error, {
        command,
        args: args.length > 0 ? args : undefined,
      });
      this.emitEvent("error", undefined, { error: error as Error });
      throw new CacheError(errorMessage, undefined, "executeCommand");
    }
  }

  // ============================================================================
  // Event System
  // ============================================================================

  addEventListener(listener: CacheEventListener): void {
    this.#eventListeners.push(listener);
  }

  removeEventListener(listener: CacheEventListener): void {
    const index = this.#eventListeners.indexOf(listener);
    if (index > ARRAY_INDEX_NOT_FOUND) {
      this.#eventListeners.splice(index, 1);
    }
  }

  private emitEvent(
    type: CacheEvent["type"],
    key?: CacheKey,
    data?: Record<string, unknown>,
  ): void {
    const event: CacheEvent = {
      type,
      key: key || "",
      timestamp: Date.now(),
      data: data?.value as unknown as CacheValue,
      error: data?.error as Error,
      metadata: data,
    };

    this.#eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in cache event listener:", error);
      }
    });
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  getStats(): CacheStats {
    const hitRate =
      this.#stats.hits + this.#stats.misses > 0
        ? (this.#stats.hits / (this.#stats.hits + this.#stats.misses)) * PERCENTAGE_MULTIPLIER
        : 0;

    return {
      ...this.#stats,
      hitRate: Math.round(hitRate * PERCENTAGE_MULTIPLIER) / HIT_RATE_PRECISION,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private buildKey(key: CacheKey): string {
    if (Array.isArray(key)) {
      return this.#prefix + key.join(COMPOUND_KEY_SEPARATOR);
    }
    return this.#prefix + key;
  }

  private serialize(value: CacheValue): string {
    return json.serialize(value);
  }

  private deserialize<T>(value: string): T {
    return json.deserialize<T>(value) as T;
  }

  private normalizeTtl(ttl?: CacheExpiration): number | undefined {
    if (ttl === null) return undefined;
    if (ttl === undefined) return this.#ttl;
    return Math.max(0, ttl);
  }

  private formatErrorMessage(
    operation: string,
    key: string,
    error: unknown,
    context?: Record<string, unknown>,
  ): string {
    const baseMessage = `Cache operation '${operation}' failed for key '${key}'`;

    let errorDetails = "";
    if (error instanceof Error) {
      errorDetails = `: ${error.message}`;
      if (error.name !== "Error") {
        errorDetails = ` (${error.name})${errorDetails}`;
      }
    } else if (typeof error === "string") {
      errorDetails = `: ${error}`;
    } else {
      errorDetails = ": Unknown error occurred";
    }

    let contextDetails = "";
    if (context && Object.keys(context).length > 0) {
      const contextStr = Object.entries(context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(", ");
      if (contextStr) {
        contextDetails = ` [Context: ${contextStr}]`;
      }
    }

    return `${baseMessage}${errorDetails}${contextDetails}`;
  }

  // ============================================================================
  // Legacy Methods (for backward compatibility)
  // ============================================================================

  async set(key: CacheKey, value: CacheValue, seconds?: number): Promise<boolean> {
    return this.put(key, value, seconds || undefined);
  }

  async getMultiple<T, R = Record<string, T | null>>(
    keys: string[],
    defaultVal: T | null = null,
  ): Promise<R> {
    const values = await this.many(keys);
    return Object.entries(values).reduce<R>(
      (results, [key, value]) => {
        (results as Record<string, T | null>)[key] = (value as T) ?? defaultVal;
        return results;
      },
      {} as unknown as R,
    );
  }

  async forget(key: CacheKey): Promise<boolean> {
    return this.delete(key);
  }

  async clear(): Promise<boolean> {
    return this.flush();
  }

  async forever(key: CacheKey, value: CacheValue): Promise<boolean> {
    return this.put(key, value, null);
  }

  async ttl(key: CacheKey): Promise<number | null> {
    return this.getTtl(key);
  }
}

export function cache(connection: string, opts: CacheOptions = {}): Cache {
  return new Cache(connection, opts);
}

export default cache;
