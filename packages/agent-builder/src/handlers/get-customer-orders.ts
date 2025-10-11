import { getWooCommerceClient } from '@snkhouse/integrations';

export interface GetCustomerOrdersInput {
  customer_email: string;
  status?: string | null;
  limit?: number | null;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pending': 'Pendiente de pago',
    'processing': 'Procesando',
    'on-hold': 'En espera',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado',
    'failed': 'Fallido'
  };
  return labels[status] || status;
}

export async function getCustomerOrdersHandler(input: GetCustomerOrdersInput) {
  try {
    console.log(`👤 [GetCustomerOrders] Fetching orders for: ${input.customer_email}`);

    const wc = getWooCommerceClient();

    // Step 1: Buscar customer por email
    const customersResponse = await wc.get('customers', {
      email: input.customer_email,
      per_page: 1
    });

    if (!customersResponse.data || customersResponse.data.length === 0) {
      console.log(`⚠️ [GetCustomerOrders] No customer found with email: ${input.customer_email}`);
      return {
        success: false,
        error: 'No encontramos una cuenta con ese email. Verificá que sea correcto.'
      };
    }

    const customer = customersResponse.data[0];
    const customerId = customer.id;

    console.log(`✅ [GetCustomerOrders] Customer found: ${customer.first_name} ${customer.last_name} (ID: ${customerId})`);

    // Step 2: Buscar pedidos do cliente
    const params: any = {
      customer: customerId,
      per_page: Math.min(input.limit || 5, 20),
      orderby: 'date',
      order: 'desc'
    };

    // Filtrar por status se fornecido
    if (input.status && input.status !== 'all') {
      params.status = input.status;
    }

    console.log(`📋 [GetCustomerOrders] Query params:`, params);

    const ordersResponse = await wc.get('orders', params);
    const orders = ordersResponse.data;

    console.log(`✅ [GetCustomerOrders] Found ${orders.length} orders`);

    // Mapear orders para formato simplificado
    const results = orders.map((order: any) => ({
      order_id: order.id.toString(),
      order_number: order.number || order.id.toString(),
      date: order.date_created.split('T')[0],
      status: order.status,
      status_label: getStatusLabel(order.status),
      total: `${order.total} ${order.currency}`,
      currency: order.currency,
      products_count: order.line_items.length,
      // Primeiro produto como preview
      main_product: order.line_items[0]?.name || 'Sin detalles'
    }));

    return {
      success: true,
      customer_email: input.customer_email,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      total_orders: results.length,
      orders: results
    };

  } catch (error: any) {
    console.error('❌ [GetCustomerOrders] Error:', error.message);

    return {
      success: false,
      error: 'Hubo un problema al consultar tus pedidos. Intentá de nuevo en unos segundos.'
    };
  }
}
