import axios, { AxiosInstance } from 'axios';

// Validate environment variables
if (!process.env.WOOCOMMERCE_URL) {
  throw new Error('WOOCOMMERCE_URL is not defined');
}

if (!process.env.WOOCOMMERCE_CONSUMER_KEY) {
  throw new Error('WOOCOMMERCE_CONSUMER_KEY is not defined');
}

if (!process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  throw new Error('WOOCOMMERCE_CONSUMER_SECRET is not defined');
}

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

/**
 * WooCommerce REST API Client
 *
 * IMPORTANT: Uses query string authentication instead of Authorization header
 * because some servers (including snkhouse.com) don't parse the Authorization
 * header correctly, resulting in 401 "woocommerce_rest_cannot_view" errors.
 *
 * Reference: https://woocommerce.github.io/woocommerce-rest-api-docs/
 * Section: "Authentication over HTTPS"
 */
export const woocommerceClient: AxiosInstance = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/v3`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'SNKHOUSE-Bot/1.0',
  },
});

/**
 * Interceptor to add credentials as query parameters
 * This ensures authentication works even when Authorization header is not parsed correctly
 */
woocommerceClient.interceptors.request.use((config) => {
  // Add consumer_key and consumer_secret as query params
  config.params = {
    ...config.params,
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
  };

  console.log('[WooCommerce] Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    params: {
      ...config.params,
      consumer_key: CONSUMER_KEY.substring(0, 10) + '...',
      consumer_secret: '***',
    },
  });

  return config;
});

/**
 * Interceptor to log responses and errors
 */
woocommerceClient.interceptors.response.use(
  (response) => {
    console.log('[WooCommerce] Response:', {
      status: response.status,
      statusText: response.statusText,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
    });
    return response;
  },
  (error) => {
    console.error('[WooCommerce] Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

/**
 * Helper: Search products
 */
export async function searchProducts(query: string, limit: number = 10) {
  const response = await woocommerceClient.get('/products', {
    params: {
      search: query,
      per_page: limit,
      status: 'publish',
      _fields: 'id,name,price,images,stock_status,permalink',
    },
  });
  return response.data;
}

/**
 * Helper: Get product by ID
 */
export async function getProductById(productId: string) {
  const response = await woocommerceClient.get(`/products/${productId}`, {
    params: {
      _fields: 'id,name,price,images,stock_status,stock_quantity,permalink',
    },
  });
  return response.data;
}

/**
 * Helper: Get order by ID
 */
export async function getOrderById(orderId: string) {
  const response = await woocommerceClient.get(`/orders/${orderId}`);
  return response.data;
}

/**
 * Legacy function to verify API key (kept for backward compatibility)
 */
export function verifyApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.AGENT_API_KEY;

  if (!expectedKey) {
    console.warn('[WooCommerce API] AGENT_API_KEY not configured');
    return true; // Allow if not configured (development mode)
  }

  return apiKey === expectedKey;
}
