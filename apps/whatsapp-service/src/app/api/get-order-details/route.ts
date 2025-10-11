import { NextRequest, NextResponse } from 'next/server';
import { woocommerce, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, customer_email } = body;

    console.log('[get-order-details] Fetching order:', order_id, 'for:', customer_email);

    // Get order
    const response = await woocommerce.get(`orders/${order_id}`);
    const order = response.data;

    // Verify customer email
    if (order.billing.email.toLowerCase() !== customer_email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email no coincide con el pedido' },
        { status: 403 }
      );
    }

    // Format response
    const formattedOrder = {
      id: order.id,
      number: order.number,
      status: order.status,
      total: order.total,
      currency: order.currency,
      date_created: order.date_created,
      items: order.line_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        total: item.total,
        image: item.image?.src || null
      })),
      shipping: {
        first_name: order.shipping.first_name,
        last_name: order.shipping.last_name,
        address_1: order.shipping.address_1,
        address_2: order.shipping.address_2,
        city: order.shipping.city,
        state: order.shipping.state,
        postcode: order.shipping.postcode,
        country: order.shipping.country
      },
      tracking: order.meta_data.find((meta: any) => meta.key === '_tracking_number')?.value || null
    };

    console.log('[get-order-details] Order found');

    return NextResponse.json({
      success: true,
      order: formattedOrder
    });

  } catch (error: any) {
    console.error('[get-order-details] Error:', error);

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al consultar pedido' },
      { status: 500 }
    );
  }
}
