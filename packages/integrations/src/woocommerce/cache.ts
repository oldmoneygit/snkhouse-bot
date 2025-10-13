// =====================================================
// CACHE SYSTEM PARA WOOCOMMERCE
// =====================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class WooCommerceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 30 * 60 * 1000; // 30 minutos

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
    console.log(`💾 [Cache] Salvo: ${key} (TTL: ${entry.ttl / 1000}s)`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`❌ [Cache] Miss: ${key}`);
      return null;
    }

    const age = Date.now() - entry.timestamp;

    if (age > entry.ttl) {
      console.log(`⏰ [Cache] Expirado: ${key} (idade: ${age / 1000}s)`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ [Cache] Hit: ${key} (idade: ${age / 1000}s)`);
    return entry.data as T;
  }

  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`🗑️  [Cache] Invalidado: ${key}`);
    }
  }

  invalidatePattern(pattern: string): void {
    let count = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(
      `🗑️  [Cache] Invalidados ${count} itens com padrão: ${pattern}`,
    );
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  [Cache] Limpo: ${size} itens removidos`);
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const wooCache = new WooCommerceCache();
