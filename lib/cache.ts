interface CacheEntry<T> {
  data: T
  timestamp: number
}

class StellarCache {
  private store = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl = 30000): void {
    this.store.set(key, { data, timestamp: Date.now() })
    setTimeout(() => this.store.delete(key), ttl)
  }

  get<T>(key: string, ttl = 30000): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > ttl) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }
}

export const cache = new StellarCache()

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key, ttl)
  if (cached !== null) return cached
  const data = await fetcher()
  cache.set(key, data, ttl)
  return data
}
