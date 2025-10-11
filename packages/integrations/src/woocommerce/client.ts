import axios, { AxiosInstance } from 'axios';
import {
  WooCommerceConfig,
  WooCommerceProduct,
  WooCommerceOrder,
  WooCommerceCategory,
  WooCommerceCustomer,
  ProductSearchParams,
  OrderSearchParams,
} from './types';
import { wooCache } from './cache';

/**
 * Sanitiza email para logs (LGPD compliance)
 */
function sanitizeEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***@***';
  const domainParts = domain.split('.');
  const tld = domainParts.length > 0 ? domainParts[domainParts.length - 1] : '***';
  return `${user[0]}***@***${tld}`;
}

export class WooCommerceClient {
  private client: AxiosInstance;
  private config: WooCommerceConfig;

  constructor(config: WooCommerceConfig) {
    this.config = {
      version: 'wc/v3',
      ...config,
    };

    console.log('🛒 [WooCommerce] Inicializando cliente...');
    console.log('📍 [WooCommerce] URL:', this.config.url);

    this.client = axios.create({
      baseURL: `${this.config.url}/wp-json/${this.config.version}`,
      params: {
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ [WooCommerce] Cliente configurado');
  }

  // =====================================================
  // PRODUTOS
  // =====================================================

  async getProduct(productId: number, useCache = true): Promise<WooCommerceProduct | null> {
    const cacheKey = `product:${productId}`;

    if (useCache) {
      const cached = wooCache.get<WooCommerceProduct>(cacheKey);
      if (cached) return cached;
    }

    console.log(`🔍 [WooCommerce] Buscando produto ID: ${productId}`);

    try {
      const response = await this.client.get<WooCommerceProduct>(`/products/${productId}`);
      
      console.log(`✅ [WooCommerce] Produto encontrado: ${response.data.name}`);
      
      wooCache.set(cacheKey, response.data);
      return response.data;

    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`❌ [WooCommerce] Produto não encontrado: ${productId}`);
        return null;
      }
      console.error(`❌ [WooCommerce] Erro ao buscar produto:`, error.message);
      throw error;
    }
  }

  /**
   * Generic GET method for raw API access
   * Use specific methods (getProduct, getProducts) when available
   */
  async get<T = any>(endpoint: string, params?: any): Promise<{ data: T }> {
    console.log(`🔍 [WooCommerce] Generic GET: ${endpoint}`);
    try {
      const response = await this.client.get<T>(endpoint, { params });
      console.log(`✅ [WooCommerce] GET ${endpoint} successful`);
      return response;
    } catch (error: any) {
      console.error(`❌ [WooCommerce] GET ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Generic POST method for raw API access
   */
  async post<T = any>(endpoint: string, data?: any): Promise<{ data: T }> {
    console.log(`📝 [WooCommerce] Generic POST: ${endpoint}`);
    try {
      const response = await this.client.post<T>(endpoint, data);
      console.log(`✅ [WooCommerce] POST ${endpoint} successful`);
      return response;
    } catch (error: any) {
      console.error(`❌ [WooCommerce] POST ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Generic PUT method for raw API access
   */
  async put<T = any>(endpoint: string, data?: any): Promise<{ data: T }> {
    console.log(`✏️ [WooCommerce] Generic PUT: ${endpoint}`);
    try {
      const response = await this.client.put<T>(endpoint, data);
      console.log(`✅ [WooCommerce] PUT ${endpoint} successful`);
      return response;
    } catch (error: any) {
      console.error(`❌ [WooCommerce] PUT ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  async getProducts(params: ProductSearchParams = {}, useCache = true): Promise<WooCommerceProduct[]> {
    const cacheKey = `products:${JSON.stringify(params)}`;

    if (useCache) {
      const cached = wooCache.get<WooCommerceProduct[]>(cacheKey);
      if (cached) return cached;
    }

    console.log('🔍 [WooCommerce] Listando produtos:', params);

    try {
      const response = await this.client.get<WooCommerceProduct[]>('/products', { params });
      
      console.log(`✅ [WooCommerce] ${response.data.length} produtos encontrados`);
      
      wooCache.set(cacheKey, response.data, 15 * 60 * 1000); // 15 minutos para listas
      return response.data;

    } catch (error: any) {
      console.error(`❌ [WooCommerce] Erro ao listar produtos:`, error.message);
      throw error;
    }
  }

  async searchProducts(searchTerm: string, limit = 10): Promise<WooCommerceProduct[]> {
    console.log(`🔍 [WooCommerce] Pesquisando: "${searchTerm}"`);

    return this.getProducts({
      search: searchTerm,
      per_page: limit,
      status: 'publish',
    });
  }

  async getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
    console.log(`🔍 [WooCommerce] Buscando produto por slug: ${slug}`);

    const products = await this.getProducts({ slug } as any);
    
    if (products.length === 0) {
      console.log(`❌ [WooCommerce] Produto não encontrado: ${slug}`);
      return null;
    }

    return products[0];
  }

  // =====================================================
  // PEDIDOS
  // =====================================================

  async getOrder(orderId: number, useCache = true): Promise<WooCommerceOrder | null> {
    const cacheKey = `order:${orderId}`;

    if (useCache) {
      const cached = wooCache.get<WooCommerceOrder>(cacheKey);
      if (cached) return cached;
    }

    console.log(`🔍 [WooCommerce] Buscando pedido ID: ${orderId}`);

    try {
      const response = await this.client.get<WooCommerceOrder>(`/orders/${orderId}`);
      
      console.log(`✅ [WooCommerce] Pedido encontrado: #${response.data.number}`);
      
      wooCache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutos para pedidos
      return response.data;

    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`❌ [WooCommerce] Pedido não encontrado: ${orderId}`);
        return null;
      }
      console.error(`❌ [WooCommerce] Erro ao buscar pedido:`, error.message);
      throw error;
    }
  }

  async getOrders(params: OrderSearchParams = {}): Promise<WooCommerceOrder[]> {
    console.log('🔍 [WooCommerce] Listando pedidos:', params);

    try {
      const response = await this.client.get<WooCommerceOrder[]>('/orders', { params });
      
      console.log(`✅ [WooCommerce] ${response.data.length} pedidos encontrados`);
      return response.data;

    } catch (error: any) {
      console.error(`❌ [WooCommerce] Erro ao listar pedidos:`, error.message);
      throw error;
    }
  }

  async getOrdersByCustomerEmail(email: string): Promise<WooCommerceOrder[]> {
    console.log(`🔍 [WooCommerce] Buscando pedidos do cliente: ${sanitizeEmail(email)}`);

    // WooCommerce não suporta busca direta por email, então buscamos todos e filtramos
    const allOrders = await this.getOrders({ per_page: 100 });
    
    const customerOrders = allOrders.filter(
      order => order.billing.email.toLowerCase() === email.toLowerCase()
    );

    console.log(`✅ [WooCommerce] ${customerOrders.length} pedidos encontrados para ${sanitizeEmail(email)}`);
    return customerOrders;
  }

  // =====================================================
  // CATEGORIAS
  // =====================================================

  async getCategories(useCache = true): Promise<WooCommerceCategory[]> {
    const cacheKey = 'categories:all';

    if (useCache) {
      const cached = wooCache.get<WooCommerceCategory[]>(cacheKey);
      if (cached) return cached;
    }

    console.log('🔍 [WooCommerce] Listando categorias');

    try {
      const response = await this.client.get<WooCommerceCategory[]>('/products/categories', {
        params: { per_page: 100 },
      });
      
      console.log(`✅ [WooCommerce] ${response.data.length} categorias encontradas`);
      
      wooCache.set(cacheKey, response.data, 60 * 60 * 1000); // 1 hora
      return response.data;

    } catch (error: any) {
      console.error(`❌ [WooCommerce] Erro ao listar categorias:`, error.message);
      throw error;
    }
  }
  async findCustomerByEmail(email: string): Promise<WooCommerceCustomer | null> {
    console.log(`[WooCommerce] Buscando cliente por email: ${sanitizeEmail(email)}`);

    try {
      const response = await this.client.get<WooCommerceCustomer[]>('/customers', {
        params: { email, per_page: 1 },
      });

      const customer = response.data?.[0] ?? null;
      if (customer) {
        console.log(`[WooCommerce] Cliente encontrado: ${customer.id}`);
      } else {
        console.log('[WooCommerce] Nenhum cliente encontrado para o email informado');
      }
      return customer;
    } catch (error: any) {
      console.error('[WooCommerce] Erro ao buscar cliente por email:', error.message);
      throw error;
    }
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  clearCache(): void {
    wooCache.clear();
  }

  invalidateProductCache(productId?: number): void {
    if (productId) {
      wooCache.invalidate(`product:${productId}`);
    } else {
      wooCache.invalidatePattern('product:');
    }
  }

  getCacheStats() {
    return wooCache.getStats();
  }
}

// Singleton instance
let wooCommerceClient: WooCommerceClient | null = null;

export function getWooCommerceClient(): WooCommerceClient {
  if (!wooCommerceClient) {
    const config: WooCommerceConfig = {
      url: process.env.WOOCOMMERCE_URL || 'https://snkhouse.com',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
    };

    if (!config.consumerKey || !config.consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    wooCommerceClient = new WooCommerceClient(config);
  }

  return wooCommerceClient;
}

