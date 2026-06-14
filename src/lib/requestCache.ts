// Request deduplication and caching utility
// Follows SWR pattern: Stale-While-Revalidate

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  staleAt: number;
  promise?: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const sortedParams = params
    ? Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join('&')
    : '';
  return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
}

export function getCachedData<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  
  // Check if cache has expired
  if (Date.now() > entry.timestamp + DEFAULT_CACHE_TIME) {
    cache.delete(key);
    return undefined;
  }
  
  return entry.data;
}

export function isStale(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return true;
  return Date.now() > entry.staleAt;
}

export function setCachedData<T>(key: string, data: T, staleTime = DEFAULT_STALE_TIME): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    staleAt: Date.now() + staleTime,
  } as CacheEntry<T>);
}

export function getPendingRequest<T>(key: string): Promise<T> | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  return entry?.promise;
}

export function setPendingRequest<T>(key: string, promise: Promise<T>): void {
  const existing = cache.get(key);
  cache.set(key, {
    ...existing,
    promise,
    timestamp: existing?.timestamp ?? Date.now(),
    staleAt: existing?.staleAt ?? Date.now() + DEFAULT_STALE_TIME,
  } as CacheEntry<T>);
}

export function clearPendingRequest(key: string): void {
  const entry = cache.get(key);
  if (entry) {
    delete (entry as CacheEntry<unknown>).promise;
  }
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Main fetch function with deduplication and SWR
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    backgroundRefresh?: boolean;
  } = {}
): Promise<T> {
  const { staleTime = DEFAULT_STALE_TIME, backgroundRefresh = true } = options;
  
  // Check for pending request (deduplication)
  const pending = getPendingRequest<T>(key);
  if (pending) {
    return pending;
  }
  
  // Check cache
  const cached = getCachedData<T>(key);
  const stale = isStale(key);
  
  // If we have fresh cache, return it
  if (cached && !stale) {
    return cached;
  }
  
  // If stale and background refresh is enabled, return stale data and refresh
  if (cached && stale && backgroundRefresh) {
    // Trigger background refresh
    const refreshPromise = fetcher()
      .then(data => {
        setCachedData(key, data, staleTime);
        return data;
      })
      .catch(() => cached) // On error, keep stale data
      .finally(() => clearPendingRequest(key));
    
    setPendingRequest(key, refreshPromise);
    return cached;
  }
  
  // No cache or forced refresh - make the request
  const promise = fetcher()
    .then(data => {
      setCachedData(key, data, staleTime);
      return data;
    })
    .finally(() => clearPendingRequest(key));
  
  setPendingRequest(key, promise);
  return promise;
}
