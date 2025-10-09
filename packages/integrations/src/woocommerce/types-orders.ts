/**
 * Types para Orders do WooCommerce
 *
 * @module woocommerce/types-orders
 * @version 1.0.0
 * @since 2025-01-10
 */

export interface WooOrderBilling {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface WooOrderShipping {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WooOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  sku: string;
  price: number;
}

export interface WooOrderShippingLine {
  method_title: string;
  method_id: string;
  total: string;
}

export interface WooOrderMetaData {
  id: number;
  key: string;
  value: string;
}

export interface WooOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: WooOrderBilling;
  shipping: WooOrderShipping;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string | null;
  date_paid_gmt: string | null;
  date_completed: string | null;
  date_completed_gmt: string | null;
  cart_hash: string;
  meta_data: WooOrderMetaData[];
  line_items: WooOrderLineItem[];
  shipping_lines: WooOrderShippingLine[];
}

export interface OrderStatusData {
  order_id: number;
  order_number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  customer_id: number;
}

export interface OrderDetailsData {
  order_id: number;
  order_number: string;
  status: string;
  date_created: string;
  date_paid: string | null;
  date_completed: string | null;
  total: string;
  currency: string;
  payment_method: string;
  customer_id: number;
  items: Array<{
    name: string;
    quantity: number;
    total: string;
    sku: string;
  }>;
  shipping: {
    method: string;
    total: string;
    address: string;
  };
  tracking?: string;
}

export interface CustomerOrdersData {
  order_id: number;
  order_number: string;
  status: string;
  date_created: string;
  total: string;
  items_count: number;
}
