# Redis Cache Package

A Redis-based cache implementation following Laravel's cache design patterns, built with TypeScript and modern Redis client.

## Features

- **Laravel-style API**: Familiar cache methods like `get`, `put`, `remember`, `forget`
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Event System**: Built-in event system for cache operations
- **Statistics**: Cache hit/miss statistics and performance metrics
- **Error Handling**: Proper error handling with custom error types
- **Flexible Keys**: Support for both string and compound array keys
- **TTL Management**: Automatic TTL handling with default values

## Installation

```bash
npm install @raypx/redis
```

## Basic Usage

### Creating a Cache Instance

```typescript
import { cache } from '@raypx/redis'

// Basic usage
const cacheInstance = cache('redis://localhost:6379')

// With options
const cacheInstance = cache('redis://localhost:6379', {
  prefix: 'app:',
  ttl: 3600, // 1 hour default
  db: 1
})
```

### Basic Operations

```typescript
// Store a value
await cacheInstance.put('user:123', { name: 'John', email: 'john@example.com' }, 3600)

// Retrieve a value
const user = await cacheInstance.get('user:123')
// Returns: { name: 'John', email: 'john@example.com' }

// Check if key exists
const exists = await cacheInstance.has('user:123')
// Returns: true

// Delete a key
await cacheInstance.delete('user:123')

// Store forever (no expiration)
await cacheInstance.put('config:app', { version: '1.0.0' }, null)
```

### Advanced Operations

```typescript
// Remember pattern - get from cache or compute and store
const user = await cacheInstance.remember('user:123', 3600, async () => {
  // This function only runs if the key doesn't exist in cache
  return await fetchUserFromDatabase(123)
})

// Remember forever
const config = await cacheInstance.rememberForever('config:app', async () => {
  return await loadAppConfig()
})

// Pull - get and delete
const tempData = await cacheInstance.pull('temp:session:abc')

// Increment/Decrement
await cacheInstance.increment('visits:page:home')
await cacheInstance.decrement('stock:product:123', 5)
```

### Multiple Operations

```typescript
// Store multiple values
await cacheInstance.putMany({
  'user:1': { name: 'Alice' },
  'user:2': { name: 'Bob' },
  'user:3': { name: 'Charlie' }
}, 3600)

// Get multiple values
const users = await cacheInstance.many(['user:1', 'user:2', 'user:3'])

// Delete multiple keys
await cacheInstance.deleteMultiple(['user:1', 'user:2', 'user:3'])
```

### Event System

```typescript
// Listen to cache events
cacheInstance.addEventListener((event) => {
  switch (event.type) {
    case 'hit':
      console.log(`Cache hit for key: ${event.key}`)
      break
    case 'miss':
      console.log(`Cache miss for key: ${event.key}`)
      break
    case 'set':
      console.log(`Value set for key: ${event.key}`)
      break
    case 'delete':
      console.log(`Key deleted: ${event.key}`)
      break
    case 'error':
      console.error(`Cache error: ${event.error?.message}`)
      break
  }
})
```

### Statistics

```typescript
// Get cache statistics
const stats = cacheInstance.getStats()
console.log(`Hit rate: ${stats.hitRate}%`)
console.log(`Total hits: ${stats.hits}`)
console.log(`Total misses: ${stats.misses}`)
```

### Compound Keys

```typescript
// Use array keys for compound keys
await cacheInstance.put(['users', 'profile', 123], userProfile)
await cacheInstance.put(['products', 'category', 'electronics'], products)

// Retrieve with compound keys
const profile = await cacheInstance.get(['users', 'profile', 123])
const electronics = await cacheInstance.get(['products', 'category', 'electronics'])
```

### Custom Serialization

```typescript
import { cache, type SerializationOptions } from '@raypx/redis'

const customSerialization: SerializationOptions = {
  serialize: (value) => {
    // Custom serialization logic
    return JSON.stringify(value, null, 2)
  },
  deserialize: <T>(value: string) => {
    // Custom deserialization logic
    return JSON.parse(value) as T
  }
}

const cacheInstance = cache('redis://localhost:6379', {
  serialization: customSerialization
})
```

## API Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `get<T>(key, defaultValue?)` | Retrieve a value from cache | `Promise<T \| null>` |
| `put(key, value, ttl?)` | Store a value in cache | `Promise<boolean>` |
| `add(key, value, ttl?)` | Store value only if key doesn't exist | `Promise<boolean>` |
| `has(key)` | Check if key exists | `Promise<boolean>` |
| `missing(key)` | Check if key is missing | `Promise<boolean>` |
| `delete(key)` | Remove a key | `Promise<boolean>` |
| `flush()` | Remove all keys | `Promise<boolean>` |

### Advanced Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `remember(key, ttl, closure)` | Get from cache or compute and store | `Promise<T>` |
| `rememberForever(key, closure)` | Get from cache or compute and store forever | `Promise<T>` |
| `pull(key)` | Get and delete a value | `Promise<T \| null>` |
| `increment(key, value?)` | Increment numeric value | `Promise<number>` |
| `decrement(key, value?)` | Decrement numeric value | `Promise<number>` |

### Multiple Operations

| Method | Description | Returns |
|--------|-------------|---------|
| `many(keys)` | Get multiple values | `Promise<Record<string, CacheValue \| null>>` |
| `putMany(values, ttl?)` | Store multiple values | `Promise<boolean>` |
| `deleteMultiple(keys)` | Delete multiple keys | `Promise<boolean>` |

### Utility Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getPrefix()` | Get current key prefix | `string` |
| `setPrefix(prefix)` | Set key prefix | `void` |
| `getTtl(key)` | Get key TTL | `Promise<number \| null>` |
| `getStats()` | Get cache statistics | `CacheStats` |
| `addEventListener(listener)` | Add event listener | `void` |
| `removeEventListener(listener)` | Remove event listener | `void` |

## Error Handling

The package provides custom error types for better error handling:

```typescript
import { CacheError, CacheConnectionError, CacheSerializationError } from '@raypx/redis'

try {
  await cacheInstance.put('key', 'value')
} catch (error) {
  if (error instanceof CacheError) {
    console.error(`Cache operation failed: ${error.message}`)
    console.error(`Key: ${error.key}`)
    console.error(`Operation: ${error.operation}`)
  }
}
```

## Migration from Legacy API

The package maintains backward compatibility with legacy method names:

| Legacy Method | New Method | Status |
|---------------|------------|---------|
| `set()` | `put()` | Deprecated |
| `getMultiple()` | `many()` | Deprecated |
| `forget()` | `delete()` | Deprecated |
| `clear()` | `flush()` | Deprecated |
| `forever()` | `put(key, value, null)` | Deprecated |
| `ttl()` | `getTtl()` | Deprecated |

## Configuration Options

```typescript
interface CacheOptions {
  prefix?: string        // Key prefix for all operations
  db?: number          // Redis database number
  ttl?: number         // Default TTL in seconds
  atomic?: boolean     // Whether to use atomic operations
  serialization?: SerializationOptions
  compression?: CompressionOptions
}
```

## Best Practices

1. **Use meaningful key names**: `user:profile:123` instead of `up123`
2. **Set appropriate TTL**: Don't cache data that changes frequently for too long
3. **Handle cache misses gracefully**: Always provide fallback logic
4. **Monitor cache performance**: Use the built-in statistics and events
5. **Use compound keys**: Group related data with array keys
6. **Implement cache warming**: Pre-populate cache with frequently accessed data

## Examples

### User Session Management

```typescript
class UserSessionManager {
  constructor(private cache: Cache) {}

  async getUserSession(sessionId: string) {
    return await this.cache.remember(
      ['sessions', sessionId],
      1800, // 30 minutes
      async () => {
        return await this.loadSessionFromDatabase(sessionId)
      }
    )
  }

  async updateUserSession(sessionId: string, data: any) {
    await this.cache.put(['sessions', sessionId], data, 1800)
  }

  async invalidateSession(sessionId: string) {
    await this.cache.delete(['sessions', sessionId])
  }
}
```

### Product Catalog Caching

```typescript
class ProductCatalog {
  constructor(private cache: Cache) {}

  async getProductsByCategory(category: string) {
    return await this.cache.remember(
      ['products', 'category', category],
      3600, // 1 hour
      async () => {
        return await this.fetchProductsFromAPI(category)
      }
    )
  }

  async invalidateCategoryCache(category: string) {
    await this.cache.delete(['products', 'category', category])
  }

  async warmCache() {
    const categories = ['electronics', 'clothing', 'books']
    for (const category of categories) {
      await this.getProductsByCategory(category)
    }
  }
}
```

## Contributing

This package follows the TypeScript guidelines and Laravel cache patterns. When contributing:

1. Follow the established type patterns
2. Maintain backward compatibility
3. Add proper error handling
4. Include comprehensive tests
5. Update documentation

## License

MIT License - see LICENSE file for details.
