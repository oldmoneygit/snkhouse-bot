/**
 * Shopify Admin API Types
 * API Version: 2025-10
 * Docs: https://shopify.dev/docs/api/admin-rest/2025-10
 */

// =====================================================
// Product Types
// =====================================================

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: 'active' | 'archived' | 'draft';
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

// =====================================================
// Order Types
// =====================================================

export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id: number | null;
  browser_ip: string | null;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  checkout_id: number | null;
  checkout_token: string | null;
  client_details: ShopifyClientDetails | null;
  closed_at: string | null;
  confirmation_number: string;
  confirmed: boolean;
  contact_email: string | null;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_total_discounts: string;
  current_total_duties_set: null;
  current_total_price: string;
  current_total_tax: string;
  customer_locale: string | null;
  device_id: number | null;
  discount_codes: ShopifyDiscountCode[];
  email: string;
  estimated_taxes: boolean;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillment_status: 'fulfilled' | 'null' | 'partial' | 'restocked' | null;
  landing_site: string | null;
  landing_site_ref: string | null;
  location_id: number | null;
  merchant_of_record_app_id: number | null;
  name: string;
  note: string | null;
  note_attributes: ShopifyNoteAttribute[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_duties_set: null;
  payment_gateway_names: string[];
  phone: string | null;
  po_number: string | null;
  presentment_currency: string;
  processed_at: string;
  reference: string | null;
  referring_site: string | null;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  tags: string;
  tax_lines: ShopifyTaxLine[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_line_items_price: string;
  total_outstanding: string;
  total_price: string;
  total_shipping_price_set: ShopifyPriceSet;
  total_tax: string;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: ShopifyAddress | null;
  customer: ShopifyCustomer | null;
  discount_applications: ShopifyDiscountApplication[];
  fulfillments: ShopifyFulfillment[];
  line_items: ShopifyLineItem[];
  payment_terms: null;
  refunds: ShopifyRefund[];
  shipping_address: ShopifyAddress | null;
  shipping_lines: ShopifyShippingLine[];
}

export interface ShopifyClientDetails {
  accept_language: string | null;
  browser_height: number | null;
  browser_ip: string | null;
  browser_width: number | null;
  session_hash: string | null;
  user_agent: string | null;
}

export interface ShopifyDiscountCode {
  code: string;
  amount: string;
  type: string;
}

export interface ShopifyNoteAttribute {
  name: string;
  value: string;
}

export interface ShopifyTaxLine {
  price: string;
  rate: number;
  title: string;
  price_set: ShopifyPriceSet;
}

export interface ShopifyPriceSet {
  shop_money: ShopifyMoney;
  presentment_money: ShopifyMoney;
}

export interface ShopifyMoney {
  amount: string;
  currency_code: string;
}

export interface ShopifyAddress {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string | null;
  company: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
  country_code: string;
  province_code: string;
}

export interface ShopifyDiscountApplication {
  target_type: string;
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  code?: string;
  title?: string;
}

export interface ShopifyFulfillment {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  location_id: number;
  name: string;
  order_id: number;
  origin_address: Record<string, unknown>;
  receipt: Record<string, unknown>;
  service: string;
  shipment_status: string | null;
  status: string;
  tracking_company: string | null;
  tracking_number: string | null;
  tracking_numbers: string[];
  tracking_url: string | null;
  tracking_urls: string[];
  updated_at: string;
  line_items: ShopifyLineItem[];
}

export interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: ShopifyPriceSet;
  product_exists: boolean;
  product_id: number | null;
  properties: ShopifyProperty[];
  quantity: number;
  requires_shipping: boolean;
  sku: string | null;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: ShopifyPriceSet;
  variant_id: number | null;
  variant_inventory_management: string | null;
  variant_title: string | null;
  vendor: string | null;
  tax_lines: ShopifyTaxLine[];
  duties: unknown[];
  discount_allocations: ShopifyDiscountAllocation[];
}

export interface ShopifyProperty {
  name: string;
  value: string;
}

export interface ShopifyDiscountAllocation {
  amount: string;
  amount_set: ShopifyPriceSet;
  discount_application_index: number;
}

export interface ShopifyRefund {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  note: string | null;
  order_id: number;
  processed_at: string;
  restock: boolean;
  total_duties_set: ShopifyPriceSet;
  user_id: number;
  order_adjustments: ShopifyOrderAdjustment[];
  transactions: ShopifyTransaction[];
  refund_line_items: ShopifyRefundLineItem[];
}

export interface ShopifyOrderAdjustment {
  id: number;
  order_id: number;
  refund_id: number;
  amount: string;
  amount_set: ShopifyPriceSet;
  tax_amount: string;
  tax_amount_set: ShopifyPriceSet;
  kind: string;
  reason: string;
}

export interface ShopifyTransaction {
  id: number;
  admin_graphql_api_id: string;
  amount: string;
  authorization: string | null;
  created_at: string;
  currency: string;
  device_id: number | null;
  error_code: string | null;
  gateway: string;
  kind: string;
  location_id: number | null;
  message: string | null;
  order_id: number;
  parent_id: number | null;
  processed_at: string;
  receipt: Record<string, unknown>;
  source_name: string;
  status: string;
  test: boolean;
  user_id: number | null;
}

export interface ShopifyRefundLineItem {
  id: number;
  line_item_id: number;
  location_id: number | null;
  quantity: number;
  restock_type: string;
  subtotal: string;
  subtotal_set: ShopifyPriceSet;
  total_tax: string;
  total_tax_set: ShopifyPriceSet;
  line_item: ShopifyLineItem;
}

export interface ShopifyShippingLine {
  id: number;
  carrier_identifier: string | null;
  code: string | null;
  discounted_price: string;
  discounted_price_set: ShopifyPriceSet;
  phone: string | null;
  price: string;
  price_set: ShopifyPriceSet;
  requested_fulfillment_service_id: string | null;
  source: string;
  title: string;
  tax_lines: ShopifyTaxLine[];
  discount_allocations: ShopifyDiscountAllocation[];
}

// =====================================================
// Customer Types
// =====================================================

export interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number | null;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  tags: string;
  last_order_name: string | null;
  currency: string;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: string[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress | null;
  addresses: ShopifyAddress[];
}

// =====================================================
// API Response Wrapper Types
// =====================================================

export interface ShopifyApiResponse<T> {
  [key: string]: T;
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

export interface ShopifyProductResponse {
  product: ShopifyProduct;
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

export interface ShopifyOrderResponse {
  order: ShopifyOrder;
}

export interface ShopifyCustomersResponse {
  customers: ShopifyCustomer[];
}

export interface ShopifyCustomerResponse {
  customer: ShopifyCustomer;
}

// =====================================================
// Query Params Types
// =====================================================

export interface ShopifyProductQueryParams {
  limit?: number;
  since_id?: number;
  title?: string;
  vendor?: string;
  handle?: string;
  product_type?: string;
  status?: 'active' | 'archived' | 'draft';
  collection_id?: number;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  published_at_min?: string;
  published_at_max?: string;
  published_status?: 'published' | 'unpublished' | 'any';
  fields?: string;
}

export interface ShopifyOrderQueryParams {
  limit?: number;
  since_id?: number;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  processed_at_min?: string;
  processed_at_max?: string;
  status?: 'open' | 'closed' | 'cancelled' | 'any';
  financial_status?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided' | 'any';
  fulfillment_status?: 'shipped' | 'partial' | 'unshipped' | 'unfulfilled' | 'any';
  fields?: string;
}

export interface ShopifyCustomerQueryParams {
  limit?: number;
  since_id?: number;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  fields?: string;
}

// =====================================================
// Error Types
// =====================================================

export interface ShopifyApiError {
  errors: string | Record<string, string[]>;
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = 'ShopifyError';
  }
}
