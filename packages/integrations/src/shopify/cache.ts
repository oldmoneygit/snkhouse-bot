/**
 * Shopify API Cache Layer
 * Simple in-memory cache with TTL to reduce API calls
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ShopifyCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private static instance: ShopifyCache;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): ShopifyCache {
    if (!ShopifyCache.instance) {
      ShopifyCache.instance = new ShopifyCache();
    }
    return ShopifyCache.instance;
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete specific key from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache stats
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    for (const entry of Array.from(this.cache.values())) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      validEntries: validCount,
    };
  }
}

// =====================================================
// Cache TTL Constants (in milliseconds)
// =====================================================

export const CACHE_TTL = {
  // Products change less frequently
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  PRODUCT_DETAILS: 10 * 60 * 1000, // 10 minutes

  // Orders can change more frequently
  ORDERS: 2 * 60 * 1000, // 2 minutes
  ORDER_DETAILS: 5 * 60 * 1000, // 5 minutes

  // Customers change less frequently
  CUSTOMERS: 10 * 60 * 1000, // 10 minutes
  CUSTOMER_DETAILS: 15 * 60 * 1000, // 15 minutes

  // Inventory can change frequently
  INVENTORY: 1 * 60 * 1000, // 1 minute

  // Search results
  SEARCH: 5 * 60 * 1000, // 5 minutes
} as const;

// =====================================================
// Cache Key Builders
// =====================================================

export function buildCacheKey(
  resource: string,
  params: Record<string, unknown>,
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `shopify:${resource}:${sortedParams}`;
}

// =====================================================
// Singleton instance
// =====================================================

export const shopifyCache = ShopifyCache.getInstance();
