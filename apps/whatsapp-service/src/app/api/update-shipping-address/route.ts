import { NextRequest, NextResponse } from 'next/server';
import { woocommerceClient, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, customer_email, new_address } = body;

    console.log('[update-shipping-address] Updating order:', order_id);

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

    // Check if order can be modified
    const allowedStatuses = ['pending', 'processing', 'on-hold'];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `No se puede modificar. El pedido está en estado: ${order.status}` },
        { status: 400 }
      );
    }

    // Update shipping address
    const updateData = {
      shipping: new_address
    };

    const updateResponse = await woocommerceClient.put(`/orders/${order_id}`, updateData);

    console.log('[update-shipping-address] Address updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Dirección actualizada correctamente',
      order: {
        id: updateResponse.data.id,
        number: updateResponse.data.number,
        shipping: updateResponse.data.shipping
      }
    });

  } catch (error: any) {
    console.error('[update-shipping-address] Error:', error);

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar dirección' },
      { status: 500 }
    );
  }
}
