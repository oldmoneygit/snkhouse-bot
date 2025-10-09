/**
 * WooCommerce Orders Client
 *
 * Sistema de consulta de pedidos com validação de segurança,
 * cache otimizado e logs sanitizados (LGPD compliance).
 *
 * @module woocommerce/orders
 * @version 1.0.0
 * @since 2025-01-10
 */

import { WooOrder, OrderStatusData, OrderDetailsData, CustomerOrdersData } from './types-orders';
import { getWooCommerceClient } from './client';

/**
 * Cache de orders (TTL: 5 minutos)
 * Dados sensíveis requerem refresh mais frequente
 */
const ordersCache = new Map<string, { data: any; timestamp: number }>();
const ORDERS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Limpa cache de orders expirados
 */
function cleanOrdersCache(): void {
  const now = Date.now();
  for (const [key, value] of ordersCache.entries()) {
    if (now - value.timestamp > ORDERS_CACHE_TTL) {
      ordersCache.delete(key);
    }
  }
}

/**
 * Invalida cache de um pedido específico
 */
export function invalidateOrderCache(orderId?: number): void {
  if (orderId) {
    ordersCache.delete(`order_${orderId}`);
    console.log(`🗑️ [Orders] Cache invalidado: order_${orderId}`);
  } else {
    ordersCache.clear();
    console.log('🗑️ [Orders] Todo cache de orders invalidado');
  }
}

/**
 * Sanitiza customer_id para logs (LGPD)
 *
 * Exemplo: 12345 → "cust_12***5"
 */
function sanitizeCustomerId(customerId: number): string {
  const str = customerId.toString();
  if (str.length <= 3) return 'cust_***';
  return `cust_${str.slice(0, 2)}***${str.slice(-1)}`;
}

/**
 * Valida se pedido pertence ao cliente (SEGURANÇA CRÍTICA)
 *
 * @throws Error se customer_id não corresponde ao dono do pedido
 */
function validateOrderOwnership(order: WooOrder, customerId: number): void {
  if (order.customer_id !== customerId) {
    console.error('🚨 [Orders] Unauthorized access attempt', {
      order_id: order.id,
      expected_customer: sanitizeCustomerId(customerId),
      actual_customer: sanitizeCustomerId(order.customer_id)
    });
    throw new Error('Unauthorized: Este pedido não pertence a este cliente');
  }
}

/**
 * Busca pedido por ID do WooCommerce
 *
 * @throws Error se pedido não encontrado ou não pertence ao cliente
 */
async function fetchOrderById(orderId: number, customerId: number): Promise<WooOrder> {
  const cacheKey = `order_${orderId}`;
  const cached = ordersCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < ORDERS_CACHE_TTL) {
    console.log(`✅ [Orders] Cache HIT: ${cacheKey}`);
    const order = cached.data as WooOrder;
    // Sempre validar ownership mesmo em cache
    validateOrderOwnership(order, customerId);
    return order;
  }

  console.log(`🔍 [Orders] Cache MISS: ${cacheKey}`);

  try {
    const client = getWooCommerceClient();
    const response = await client.get(`orders/${orderId}`);
    const order = response.data as WooOrder;

    // VALIDAÇÃO CRÍTICA: verificar ownership
    validateOrderOwnership(order, customerId);

    ordersCache.set(cacheKey, { data: order, timestamp: Date.now() });
    cleanOrdersCache();

    console.log('✅ [Orders] Pedido carregado', {
      order_id: order.id,
      customer_id: sanitizeCustomerId(customerId),
      status: order.status
    });

    return order;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.error('❌ [Orders] Pedido não encontrado:', orderId);
      throw new Error(`Pedido #${orderId} não encontrado`);
    }
    if (error.message.includes('Unauthorized')) {
      throw error; // Re-throw security errors
    }
    console.error('❌ [Orders] Erro ao buscar pedido:', error.message);
    throw error;
  }
}

/**
 * Tool 1: get_order_status
 *
 * Retorna status básico de um pedido
 *
 * @param orderId - ID do pedido no WooCommerce
 * @param customerId - ID do cliente (para validação de segurança)
 * @returns Status básico do pedido
 */
export async function getOrderStatus(orderId: number, customerId: number): Promise<OrderStatusData> {
  console.log('📦 [Orders] Buscando status do pedido', {
    order_id: orderId,
    customer_id: sanitizeCustomerId(customerId)
  });

  const order = await fetchOrderById(orderId, customerId);

  return {
    order_id: order.id,
    order_number: order.number,
    status: order.status,
    date_created: order.date_created,
    total: order.total,
    currency: order.currency,
    customer_id: order.customer_id
  };
}

/**
 * Tool 2: search_customer_orders
 *
 * Busca todos os pedidos de um cliente por email ou customer_id
 *
 * @param emailOrCustomerId - Email do cliente ou customer_id
 * @param limit - Número máximo de resultados (default: 5)
 * @returns Lista de pedidos do cliente
 */
export async function searchCustomerOrders(
  emailOrCustomerId: string | number,
  limit: number = 5
): Promise<CustomerOrdersData[]> {
  console.log('🔍 [Orders] Buscando pedidos do cliente', {
    identifier: typeof emailOrCustomerId === 'number'
      ? sanitizeCustomerId(emailOrCustomerId)
      : `email_${emailOrCustomerId.slice(0, 3)}***`,
    limit
  });

  try {
    const client = getWooCommerceClient();

    // Determinar parâmetro de busca
    const params: any = {
      per_page: Math.min(limit, 10), // Máximo 10
      orderby: 'date',
      order: 'desc'
    };

    if (typeof emailOrCustomerId === 'number') {
      params.customer = emailOrCustomerId;
    } else {
      // Buscar customer por email primeiro
      const customersResponse = await client.get('customers', {
        params: { email: emailOrCustomerId }
      });

      if (!customersResponse.data || customersResponse.data.length === 0) {
        console.warn('⚠️ [Orders] Nenhum cliente encontrado com este email');
        return [];
      }

      params.customer = customersResponse.data[0].id;
    }

    const response = await client.get('orders', { params });
    const orders = response.data as WooOrder[];

    console.log(`✅ [Orders] ${orders.length} pedidos encontrados`);

    return orders.map(order => ({
      order_id: order.id,
      order_number: order.number,
      status: order.status,
      date_created: order.date_created,
      total: order.total,
      items_count: order.line_items.length
    }));
  } catch (error: any) {
    console.error('❌ [Orders] Erro ao buscar pedidos do cliente:', error.message);
    throw error;
  }
}

/**
 * Tool 3: get_order_details
 *
 * Retorna detalhes completos de um pedido
 *
 * @param orderId - ID do pedido no WooCommerce
 * @param customerId - ID do cliente (para validação de segurança)
 * @returns Detalhes completos do pedido
 */
export async function getOrderDetails(orderId: number, customerId: number): Promise<OrderDetailsData> {
  console.log('📋 [Orders] Buscando detalhes completos do pedido', {
    order_id: orderId,
    customer_id: sanitizeCustomerId(customerId)
  });

  const order = await fetchOrderById(orderId, customerId);

  // Extrair tracking de meta_data se existir
  const trackingMeta = order.meta_data.find(m =>
    m.key === '_tracking_number' ||
    m.key === 'tracking_code' ||
    m.key === '_aftership_tracking_number'
  );

  return {
    order_id: order.id,
    order_number: order.number,
    status: order.status,
    date_created: order.date_created,
    date_paid: order.date_paid,
    date_completed: order.date_completed,
    total: order.total,
    currency: order.currency,
    payment_method: order.payment_method_title,
    customer_id: order.customer_id,
    items: order.line_items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      total: item.total,
      sku: item.sku
    })),
    shipping: {
      method: order.shipping_lines[0]?.method_title || 'N/A',
      total: order.shipping_total,
      address: `${order.shipping.address_1}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.postcode}`
    },
    tracking: trackingMeta?.value || undefined
  };
}

/**
 * Tool 4: track_shipment
 *
 * Retorna código de rastreamento do pedido
 *
 * @param orderId - ID do pedido no WooCommerce
 * @param customerId - ID do cliente (para validação de segurança)
 * @returns Informações de rastreamento
 */
export async function trackShipment(orderId: number, customerId: number): Promise<{
  order_id: number;
  tracking_code?: string;
  carrier?: string;
  status: string;
  estimated_delivery?: string;
}> {
  console.log('📮 [Orders] Buscando rastreamento', {
    order_id: orderId,
    customer_id: sanitizeCustomerId(customerId)
  });

  const order = await fetchOrderById(orderId, customerId);

  // Buscar tracking em meta_data
  const trackingMeta = order.meta_data.find(m =>
    m.key === '_tracking_number' ||
    m.key === 'tracking_code' ||
    m.key === '_aftership_tracking_number'
  );

  const carrierMeta = order.meta_data.find(m =>
    m.key === '_tracking_provider' ||
    m.key === 'carrier'
  );

  const estimatedMeta = order.meta_data.find(m =>
    m.key === 'estimated_delivery' ||
    m.key === '_estimated_delivery_date'
  );

  return {
    order_id: order.id,
    tracking_code: trackingMeta?.value,
    carrier: carrierMeta?.value,
    status: order.status,
    estimated_delivery: estimatedMeta?.value
  };
}
