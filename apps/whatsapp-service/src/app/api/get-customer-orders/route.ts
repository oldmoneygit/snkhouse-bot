import { NextRequest, NextResponse } from 'next/server';
import { woocommerceClient, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customer_email, status, limit = 10 } = body;

    console.log('[get-customer-orders] Fetching orders for:', customer_email);

    // Search customer
    const customerResponse = await woocommerceClient.get('/customers', {
      params: {
        email: customer_email,
        per_page: 1
      }
    });

    if (customerResponse.data.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        orders: []
      });
    }

    const customerId = customerResponse.data[0].id;

    // Get orders
    const params: any = {
      customer: customerId,
      per_page: Math.min(limit, 100),
      orderby: 'date',
      order: 'desc'
    };

    if (status && status !== 'any') {
      params.status = status;
    }

    const ordersResponse = await woocommerceClient.get('/orders', { params });
    const orders = ordersResponse.data;

    // Format response
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      total: order.total,
      currency: order.currency,
      date_created: order.date_created,
      items_count: order.line_items.length
    }));

    console.log('[get-customer-orders] Found:', formattedOrders.length, 'orders');

    return NextResponse.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });

  } catch (error: any) {
    console.error('[get-customer-orders] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al consultar pedidos' },
      { status: 500 }
    );
  }
}
