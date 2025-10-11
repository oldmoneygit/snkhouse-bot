// Main workflow
export { runAgentWorkflow } from './workflow';

// Product Handlers
export { searchProductsHandler } from './handlers/search-products';
export { checkStockHandler } from './handlers/check-stock';
export { getProductDetailsHandler } from './handlers/get-product-details';

// Order Handlers
export { getOrderDetailsHandler } from './handlers/get-order-details';
export { getCustomerOrdersHandler } from './handlers/get-customer-orders';
export { getTrackingInfoHandler } from './handlers/get-tracking-info';

// Order Management Handlers
export { updateShippingAddressHandler } from './handlers/update-shipping-address';
export { createReturnRequestHandler } from './handlers/create-return-request';

// Customer Handlers
export { updateCustomerInfoHandler } from './handlers/update-customer-info';
export { checkVipStatusHandler } from './handlers/check-vip-status';

// Promotions Handler
export { getActivePromotionsHandler } from './handlers/get-active-promotions';

// Types - Products
export type { SearchProductsInput } from './handlers/search-products';
export type { CheckStockInput } from './handlers/check-stock';
export type { GetProductDetailsInput } from './handlers/get-product-details';

// Types - Orders
export type { GetOrderDetailsInput } from './handlers/get-order-details';
export type { GetCustomerOrdersInput } from './handlers/get-customer-orders';
export type { GetTrackingInfoInput } from './handlers/get-tracking-info';

// Types - Order Management
export type { UpdateShippingAddressInput } from './handlers/update-shipping-address';
export type { CreateReturnRequestInput } from './handlers/create-return-request';

// Types - Customer
export type { UpdateCustomerInfoInput } from './handlers/update-customer-info';
export type { CheckVipStatusInput } from './handlers/check-vip-status';

// Types - Promotions
export type { GetActivePromotionsInput } from './handlers/get-active-promotions';
