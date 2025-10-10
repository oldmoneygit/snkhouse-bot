export { WooCommerceClient, getWooCommerceClient } from './client';
export { wooCache } from './cache';
export type {
  WooCommerceConfig,
  WooCommerceProduct,
  WooCommerceOrder,
  WooCommerceCategory,
  ProductSearchParams,
  OrderSearchParams,
} from './types';

// Orders Tools - SNKH-16.5
export {
  getOrderStatus,
  searchCustomerOrders,
  getOrderDetails,
  trackShipment,
  invalidateOrderCache
} from './orders';

export type {
  WooOrder,
  OrderStatusData,
  OrderDetailsData,
  CustomerOrdersData,
  WooOrderBilling,
  WooOrderShipping,
  WooOrderLineItem,
  WooOrderMetaData
} from './types-orders';

import { getWooCommerceClient } from './client';

export async function findCustomerByEmail(email: string) {
  const client = getWooCommerceClient();
  return client.findCustomerByEmail(email);
}
