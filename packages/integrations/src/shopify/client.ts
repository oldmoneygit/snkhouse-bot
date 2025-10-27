/**
 * Shopify Admin API Client
 * REST API Version: 2025-10
 * Docs: https://shopify.dev/docs/api/admin-rest/2025-10
 */

import type {
  ShopifyProduct,
  ShopifyProductsResponse,
  ShopifyProductResponse,
  ShopifyOrder,
  ShopifyOrdersResponse,
  ShopifyOrderResponse,
  ShopifyCustomer,
  ShopifyCustomersResponse,
  ShopifyCustomerResponse,
  ShopifyProductQueryParams,
  ShopifyOrderQueryParams,
  ShopifyCustomerQueryParams,
  ShopifyApiError,
} from './types';
import { ShopifyError } from './types';
import { shopifyCache, CACHE_TTL, buildCacheKey } from './cache';

export interface ShopifyClientConfig {
  storeUrl: string; // e.g., 'djjrjm-0p.myshopify.com'
  accessToken: string; // Admin API access token
  apiVersion?: string; // Default: '2025-10'
}

export class ShopifyClient {
  private storeUrl: string;
  private accessToken: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor(config: ShopifyClientConfig) {
    this.storeUrl = config.storeUrl;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || '2025-10';
    this.baseUrl = `https://${this.storeUrl}/admin/api/${this.apiVersion}`;

    console.log('🛍️ Shopify Client initialized:', {
      store: this.storeUrl,
      apiVersion: this.apiVersion,
    });
  }

  /**
   * Make authenticated request to Shopify Admin API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Rate limiting header
      const rateLimitRemaining = response.headers.get(
        'X-Shopify-Shop-Api-Call-Limit',
      );
      if (rateLimitRemaining) {
        console.log('📊 Shopify rate limit:', rateLimitRemaining);
      }

      if (!response.ok) {
        const errorData: ShopifyApiError = await response.json();
        throw new ShopifyError(
          `Shopify API error: ${response.statusText}`,
          response.status,
          errorData.errors,
        );
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ShopifyError) {
        console.error('❌ Shopify API Error:', {
          status: error.statusCode,
          message: error.message,
          errors: error.errors,
        });
        throw error;
      }

      console.error('❌ Shopify request failed:', error);
      throw new ShopifyError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Build query string from params
   */
  private buildQueryString(
    params: Record<string, string | number | boolean | undefined>,
  ): string {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    return filtered ? `?${filtered}` : '';
  }

  // =====================================================
  // PRODUCTS
  // =====================================================

  /**
   * Get products list
   * @param params Query parameters
   * @returns Array of products
   */
  async getProducts(
    params: ShopifyProductQueryParams = {},
  ): Promise<ShopifyProduct[]> {
    const cacheKey = buildCacheKey('products', params as Record<string, unknown>);
    const cached = shopifyCache.get<ShopifyProduct[]>(cacheKey);

    if (cached) {
      console.log('✅ Cache hit: products');
      return cached;
    }

    console.log('🔍 Fetching products from Shopify:', params);

    const queryString = this.buildQueryString(params as unknown as Record<string, string | number | boolean | undefined>);
    const response = await this.request<ShopifyProductsResponse>(
      `/products.json${queryString}`,
    );

    const products = response.products;
    shopifyCache.set(cacheKey, products, CACHE_TTL.PRODUCTS);

    console.log(`✅ Fetched ${products.length} products from Shopify`);
    return products;
  }

  /**
   * Get single product by ID
   * @param productId Product ID
   * @returns Product details
   */
  async getProductById(productId: number): Promise<ShopifyProduct | null> {
    const cacheKey = buildCacheKey('product', { id: productId });
    const cached = shopifyCache.get<ShopifyProduct>(cacheKey);

    if (cached) {
      console.log(`✅ Cache hit: product ${productId}`);
      return cached;
    }

    try {
      console.log(`🔍 Fetching product ${productId} from Shopify`);

      const response = await this.request<ShopifyProductResponse>(
        `/products/${productId}.json`,
      );

      const product = response.product;
      shopifyCache.set(cacheKey, product, CACHE_TTL.PRODUCT_DETAILS);

      console.log(`✅ Fetched product: ${product.title}`);
      return product;
    } catch (error) {
      if (error instanceof ShopifyError && error.statusCode === 404) {
        console.log(`⚠️ Product ${productId} not found`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Search products by title
   * @param query Search query
   * @param limit Max results
   * @returns Array of products
   */
  async searchProducts(
    query: string,
    limit: number = 20,
  ): Promise<ShopifyProduct[]> {
    console.log(`🔍 Searching products: "${query}"`);

    const products = await this.getProducts({
      limit,
      title: query,
      status: 'active',
    });

    // Additional filtering in memory (case-insensitive)
    const normalizedQuery = query.toLowerCase();
    const filtered = products.filter((product) => {
      const titleMatch = product.title.toLowerCase().includes(normalizedQuery);
      const tagsMatch = product.tags.toLowerCase().includes(normalizedQuery);
      const typeMatch = product.product_type
        .toLowerCase()
        .includes(normalizedQuery);

      return titleMatch || tagsMatch || typeMatch;
    });

    console.log(`✅ Found ${filtered.length} products matching "${query}"`);
    return filtered;
  }

  // =====================================================
  // ORDERS
  // =====================================================

  /**
   * Get orders list
   * @param params Query parameters
   * @returns Array of orders
   */
  async getOrders(
    params: ShopifyOrderQueryParams = {},
  ): Promise<ShopifyOrder[]> {
    const cacheKey = buildCacheKey('orders', params as Record<string, unknown>);
    const cached = shopifyCache.get<ShopifyOrder[]>(cacheKey);

    if (cached) {
      console.log('✅ Cache hit: orders');
      return cached;
    }

    console.log('🔍 Fetching orders from Shopify:', params);

    const queryString = this.buildQueryString(params as unknown as Record<string, string | number | boolean | undefined>);
    const response = await this.request<ShopifyOrdersResponse>(
      `/orders.json${queryString}`,
    );

    const orders = response.orders;
    shopifyCache.set(cacheKey, orders, CACHE_TTL.ORDERS);

    console.log(`✅ Fetched ${orders.length} orders from Shopify`);
    return orders;
  }

  /**
   * Get single order by ID
   * @param orderId Order ID
   * @returns Order details
   */
  async getOrderById(orderId: number): Promise<ShopifyOrder | null> {
    const cacheKey = buildCacheKey('order', { id: orderId });
    const cached = shopifyCache.get<ShopifyOrder>(cacheKey);

    if (cached) {
      console.log(`✅ Cache hit: order ${orderId}`);
      return cached;
    }

    try {
      console.log(`🔍 Fetching order ${orderId} from Shopify`);

      const response = await this.request<ShopifyOrderResponse>(
        `/orders/${orderId}.json`,
      );

      const order = response.order;
      shopifyCache.set(cacheKey, order, CACHE_TTL.ORDER_DETAILS);

      console.log(`✅ Fetched order: ${order.name}`);
      return order;
    } catch (error) {
      if (error instanceof ShopifyError && error.statusCode === 404) {
        console.log(`⚠️ Order ${orderId} not found`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Get orders by customer email
   * @param email Customer email
   * @returns Array of orders
   */
  async getOrdersByEmail(email: string): Promise<ShopifyOrder[]> {
    console.log(`🔍 Fetching orders for email: ${email}`);

    // Shopify doesn't support direct email filter in orders endpoint
    // We need to fetch customer first, then filter orders
    const customer = await this.findCustomerByEmail(email);

    if (!customer) {
      console.log(`⚠️ Customer not found: ${email}`);
      return [];
    }

    // Fetch all recent orders and filter by customer
    const allOrders = await this.getOrders({ limit: 250, status: 'any' });
    const customerOrders = allOrders.filter(
      (order) => order.customer?.id === customer.id,
    );

    console.log(
      `✅ Found ${customerOrders.length} orders for customer ${email}`,
    );
    return customerOrders;
  }

  // =====================================================
  // CUSTOMERS
  // =====================================================

  /**
   * Get customers list
   * @param params Query parameters
   * @returns Array of customers
   */
  async getCustomers(
    params: ShopifyCustomerQueryParams = {},
  ): Promise<ShopifyCustomer[]> {
    const cacheKey = buildCacheKey('customers', params as Record<string, unknown>);
    const cached = shopifyCache.get<ShopifyCustomer[]>(cacheKey);

    if (cached) {
      console.log('✅ Cache hit: customers');
      return cached;
    }

    console.log('🔍 Fetching customers from Shopify:', params);

    const queryString = this.buildQueryString(params as unknown as Record<string, string | number | boolean | undefined>);
    const response = await this.request<ShopifyCustomersResponse>(
      `/customers.json${queryString}`,
    );

    const customers = response.customers;
    shopifyCache.set(cacheKey, customers, CACHE_TTL.CUSTOMERS);

    console.log(`✅ Fetched ${customers.length} customers from Shopify`);
    return customers;
  }

  /**
   * Get single customer by ID
   * @param customerId Customer ID
   * @returns Customer details
   */
  async getCustomerById(customerId: number): Promise<ShopifyCustomer | null> {
    const cacheKey = buildCacheKey('customer', { id: customerId });
    const cached = shopifyCache.get<ShopifyCustomer>(cacheKey);

    if (cached) {
      console.log(`✅ Cache hit: customer ${customerId}`);
      return cached;
    }

    try {
      console.log(`🔍 Fetching customer ${customerId} from Shopify`);

      const response = await this.request<ShopifyCustomerResponse>(
        `/customers/${customerId}.json`,
      );

      const customer = response.customer;
      shopifyCache.set(cacheKey, customer, CACHE_TTL.CUSTOMER_DETAILS);

      console.log(`✅ Fetched customer: ${customer.email}`);
      return customer;
    } catch (error) {
      if (error instanceof ShopifyError && error.statusCode === 404) {
        console.log(`⚠️ Customer ${customerId} not found`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Find customer by email
   * @param email Customer email
   * @returns Customer details or null
   */
  async findCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    const cacheKey = buildCacheKey('customer_email', { email });
    const cached = shopifyCache.get<ShopifyCustomer | null>(cacheKey);

    if (cached !== null) {
      console.log(`✅ Cache hit: customer email ${email}`);
      return cached;
    }

    try {
      console.log(`🔍 Searching customer by email: ${email}`);

      // Shopify search endpoint
      const response = await this.request<ShopifyCustomersResponse>(
        `/customers/search.json?query=email:${encodeURIComponent(email)}`,
      );

      const customer = response.customers[0] ?? null;
      shopifyCache.set(cacheKey, customer, CACHE_TTL.CUSTOMER_DETAILS);

      if (customer) {
        console.log(`✅ Found customer: ${customer.email}`);
      } else {
        console.log(`⚠️ Customer not found: ${email}`);
      }

      return customer;
    } catch (error) {
      console.error(`❌ Error searching customer by email:`, error);
      return null;
    }
  }

  /**
   * Find customer by phone
   * @param phone Customer phone
   * @returns Customer details or null
   */
  async findCustomerByPhone(phone: string): Promise<ShopifyCustomer | null> {
    const cacheKey = buildCacheKey('customer_phone', { phone });
    const cached = shopifyCache.get<ShopifyCustomer | null>(cacheKey);

    if (cached !== null) {
      console.log(`✅ Cache hit: customer phone ${phone}`);
      return cached;
    }

    try {
      console.log(`🔍 Searching customer by phone: ${phone}`);

      // Shopify search endpoint
      const response = await this.request<ShopifyCustomersResponse>(
        `/customers/search.json?query=phone:${encodeURIComponent(phone)}`,
      );

      const customer = response.customers[0] ?? null;
      shopifyCache.set(cacheKey, customer, CACHE_TTL.CUSTOMER_DETAILS);

      if (customer) {
        console.log(`✅ Found customer: ${customer.email}`);
      } else {
        console.log(`⚠️ Customer not found: ${phone}`);
      }

      return customer;
    } catch (error) {
      console.error(`❌ Error searching customer by phone:`, error);
      return null;
    }
  }
}

// =====================================================
// Factory function
// =====================================================

let shopifyClientInstance: ShopifyClient | null = null;

export function getShopifyClient(
  config?: ShopifyClientConfig,
): ShopifyClient {
  if (!shopifyClientInstance) {
    if (!config) {
      const envConfig: ShopifyClientConfig = {
        storeUrl:
          process.env.SHOPIFY_STORE_URL || process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || '',
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
        apiVersion: process.env.SHOPIFY_API_VERSION || '2025-10',
      };

      if (!envConfig.storeUrl || !envConfig.accessToken) {
        throw new Error(
          'Shopify configuration missing. Set SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN environment variables.',
        );
      }

      shopifyClientInstance = new ShopifyClient(envConfig);
    } else {
      shopifyClientInstance = new ShopifyClient(config);
    }
  }

  return shopifyClientInstance;
}
