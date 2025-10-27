/**
 * Shopify Integration Package
 * Exports all Shopify-related functionality
 */

// Client
export { ShopifyClient, getShopifyClient } from './client';
export type { ShopifyClientConfig } from './client';

// Cache
export {
  ShopifyCache,
  shopifyCache,
  CACHE_TTL,
  buildCacheKey,
} from './cache';
export type { CacheEntry } from './cache';

// Types
export type {
  // Products
  ShopifyProduct,
  ShopifyVariant,
  ShopifyOption,
  ShopifyImage,
  ShopifyProductsResponse,
  ShopifyProductResponse,
  ShopifyProductQueryParams,
  // Orders
  ShopifyOrder,
  ShopifyOrdersResponse,
  ShopifyOrderResponse,
  ShopifyOrderQueryParams,
  ShopifyClientDetails,
  ShopifyDiscountCode,
  ShopifyNoteAttribute,
  ShopifyTaxLine,
  ShopifyPriceSet,
  ShopifyMoney,
  ShopifyAddress,
  ShopifyDiscountApplication,
  ShopifyFulfillment,
  ShopifyLineItem,
  ShopifyProperty,
  ShopifyDiscountAllocation,
  ShopifyRefund,
  ShopifyOrderAdjustment,
  ShopifyTransaction,
  ShopifyRefundLineItem,
  ShopifyShippingLine,
  // Customers
  ShopifyCustomer,
  ShopifyCustomersResponse,
  ShopifyCustomerResponse,
  ShopifyCustomerQueryParams,
  // API
  ShopifyApiResponse,
  ShopifyApiError,
} from './types';

export { ShopifyError } from './types';
