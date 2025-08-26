"use client"

type CacheEntry<T> = {
  data: T | null
  timestamp: number
  isRefetching: boolean
  lastAccessed: number
}

type CacheOptions = {
  maxSize: number
  defaultTTL: number
}

class AuthDataCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private listeners = new Map<string, Set<() => void>>()
  private inFlightRequests = new Map<string, Promise<unknown>>()
  private readonly options: CacheOptions
  private cleanupInterval?: NodeJS.Timeout

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      maxSize: options.maxSize ?? 100,
      defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 5 minutes
    }

    // Start cleanup interval only in browser environment
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpiredEntries()
      }, 60000) // Clean up every minute
    }
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (entry) {
      // Check if entry is expired
      const now = Date.now()
      if (now - entry.timestamp > this.options.defaultTTL) {
        this.cache.delete(key)
        this.inFlightRequests.delete(key)
        return undefined
      }
      // Update last accessed time for LRU
      entry.lastAccessed = now
    }
    return entry
  }

  set<T>(key: string, data: T | null) {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      lastAccessed: now,
      isRefetching: false,
    }

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, entry)
    this.notify(key)
  }

  setRefetching(key: string, isRefetching: boolean) {
    const entry = this.cache.get(key)
    if (entry) {
      entry.isRefetching = isRefetching
      this.notify(key)
    }
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key)
      this.inFlightRequests.delete(key)
      this.notify(key)
    } else {
      this.cache.clear()
      this.inFlightRequests.clear()
      const keys = Array.from(this.listeners.keys())
      for (const key of keys) {
        this.notify(key)
      }
    }
  }

  private evictLRU() {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.inFlightRequests.delete(oldestKey)
      this.notify(oldestKey)
    }
  }

  private cleanupExpiredEntries() {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.options.defaultTTL) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
      this.inFlightRequests.delete(key)
      this.notify(key)
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
    this.cache.clear()
    this.inFlightRequests.clear()
    this.listeners.clear()
  }

  getInFlightRequest<T>(key: string): Promise<T> | undefined {
    return this.inFlightRequests.get(key) as Promise<T> | undefined
  }

  setInFlightRequest<T>(key: string, promise: Promise<T>) {
    this.inFlightRequests.set(key, promise)
  }

  removeInFlightRequest(key: string) {
    this.inFlightRequests.delete(key)
  }

  subscribe(key: string, callback: () => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)?.add(callback)

    return () => {
      const callbacks = this.listeners.get(key)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  private notify(key: string) {
    const callbacks = this.listeners.get(key)
    if (callbacks) {
      const callbackArray = Array.from(callbacks)
      for (const callback of callbackArray) {
        callback()
      }
    }
  }
}

// Global singleton instance
export const authDataCache = new AuthDataCache()

// Clean up on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    authDataCache.destroy()
  })
}
