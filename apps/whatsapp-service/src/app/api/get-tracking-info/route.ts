import { NextRequest, NextResponse } from 'next/server';
import { woocommerceClient, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, customer_email } = body;

    console.log('[get-tracking-info] Fetching tracking for order:', order_id);

    // Get order
    const response = await woocommerceClient.get(`/orders/${order_id}`);
    const order = response.data;

    // Verify customer email
    if (order.billing.email.toLowerCase() !== customer_email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email no coincide con el pedido' },
        { status: 403 }
      );
    }

    // Get tracking info from meta_data
    const trackingNumber = order.meta_data.find((meta: any) =>
      meta.key === '_tracking_number' || meta.key === 'tracking_number'
    )?.value || null;

    const trackingUrl = order.meta_data.find((meta: any) =>
      meta.key === '_tracking_url' || meta.key === 'tracking_url'
    )?.value || null;

    const estimatedDelivery = order.meta_data.find((meta: any) =>
      meta.key === '_estimated_delivery' || meta.key === 'estimated_delivery'
    )?.value || null;

    if (!trackingNumber) {
      return NextResponse.json({
        success: true,
        hasTracking: false,
        message: 'Tracking aún no disponible',
        order_status: order.status
      });
    }

    console.log('[get-tracking-info] Tracking found:', trackingNumber);

    return NextResponse.json({
      success: true,
      hasTracking: true,
      tracking: {
        number: trackingNumber,
        url: trackingUrl,
        estimated_delivery: estimatedDelivery,
        order_status: order.status
      }
    });

  } catch (error: any) {
    console.error('[get-tracking-info] Error:', error);

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener tracking' },
      { status: 500 }
    );
  }
}
