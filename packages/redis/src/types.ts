import type { RedisClientType } from "redis"

// ============================================================================
// Core Types
// ============================================================================

export type Promiseable<T> = T | Promise<T>

export type CacheClosure<T> = () => Promiseable<T>

export type CacheKey = string | (string | number)[]

export type CacheValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | object
  | Array<unknown>

export type CacheExpiration = number | null

export type CacheTags = string[]

// ============================================================================
// Cache Options
// ============================================================================

export interface CacheOptions {
  prefix?: string
  ttl?: number
}

// ============================================================================
// Cache Store Interface
// ============================================================================

export interface CacheStore {
  // Basic Operations
  get<T = CacheValue>(key: CacheKey, defaultValue?: T): Promise<T | null>
  put(key: CacheKey, value: CacheValue, ttl?: CacheExpiration): Promise<boolean>
  add(key: CacheKey, value: CacheValue, ttl?: CacheExpiration): Promise<boolean>
  has(key: CacheKey): Promise<boolean>
  missing(key: CacheKey): Promise<boolean>
  delete(key: CacheKey): Promise<boolean>
  flush(): Promise<boolean>

  // Advanced Operations
  remember<T = CacheValue>(
    key: CacheKey,
    ttl: CacheExpiration,
    closure: CacheClosure<T>,
  ): Promise<T>
  rememberForever<T = CacheValue>(
    key: CacheKey,
    closure: CacheClosure<T>,
  ): Promise<T>
  pull<T = CacheValue>(key: CacheKey): Promise<T | null>

  // Increment/Decrement
  increment(key: CacheKey, value?: number): Promise<number>
  decrement(key: CacheKey, value?: number): Promise<number>

  // Multiple Operations
  many(keys: CacheKey[]): Promise<Record<string, CacheValue | null>>
  putMany(
    values: Record<string, CacheValue>,
    ttl?: CacheExpiration,
  ): Promise<boolean>
  deleteMultiple(keys: CacheKey[]): Promise<boolean>

  // Utility Methods
  tags(names: CacheTags): TaggedCacheStore
  getPrefix(): string
  setPrefix(prefix: string): void
  getTtl(key: CacheKey): Promise<number | null>

  // Connection Management
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
}

export interface TaggedCacheStore {
  getTags(): CacheTags
}

// ============================================================================
// Cache Statistics
// ============================================================================

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
  memoryUsage: number
}

// ============================================================================
// Redis Specific Types
// ============================================================================

export interface RedisCacheStore extends CacheStore {
  getRedis(): RedisClientType
  getConnectionInfo(): RedisConnectionInfo
  executeCommand<T>(command: string, ...args: unknown[]): Promise<T>
}

export interface RedisConnectionInfo {
  host: string
  port: number
  db: number
  status: "connected" | "disconnected" | "connecting" | "error"
  lastError?: Error
}

// ============================================================================
// Cache Events
// ============================================================================

export type CacheEventType =
  | "hit"
  | "miss"
  | "set"
  | "delete"
  | "flush"
  | "error"

export interface CacheEvent<T = CacheValue> {
  type: CacheEventType
  key: CacheKey
  timestamp: number
  data?: T
  error?: Error
  metadata?: Record<string, unknown>
}

export type CacheEventListener<T = CacheValue> = (event: CacheEvent<T>) => void

// ============================================================================
// Error Types
// ============================================================================

export class CacheError extends Error {
  constructor(
    message: string,
    public key?: CacheKey,
    public operation?: string,
  ) {
    super(message)
    this.name = "CacheError"
  }
}

export class CacheConnectionError extends CacheError {
  constructor(
    message: string,
    public connection: string,
  ) {
    super(message)
    this.name = "CacheConnectionError"
  }
}

export class CacheSerializationError extends CacheError {
  constructor(
    message: string,
    public value: unknown,
  ) {
    super(message)
    this.name = "CacheSerializationError"
  }
}
