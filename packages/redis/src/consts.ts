// Redis client configuration
export const MAX_COMMANDS_QUEUE_LENGTH = 1000

// Redis response constants
export const REDIS_SUCCESS = "OK"
export const REDIS_EXISTS = 1
export const REDIS_NOT_EXISTS = 0

// Time constants
export const DEFAULT_TTL_SECONDS = 3600 // 1 hour
export const PERCENTAGE_MULTIPLIER = 100
export const HIT_RATE_PRECISION = 100

// Network constants
export const DEFAULT_REDIS_HOST = "localhost"
export const DEFAULT_REDIS_PORT = 6379
export const DEFAULT_REDIS_DB = 0

// Statistics constants
export const INITIAL_HITS = 0
export const INITIAL_MISSES = 0
export const INITIAL_TOTAL_KEYS = 0
export const INITIAL_MEMORY_USAGE = 0

// Cache key constants
export const COMPOUND_KEY_SEPARATOR = ":"
export const ARRAY_INDEX_NOT_FOUND = -1
