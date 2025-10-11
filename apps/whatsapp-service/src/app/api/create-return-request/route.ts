import { NextRequest, NextResponse } from 'next/server';
import { woocommerce, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, customer_email, reason, description, has_photos } = body;

    console.log('[create-return-request] Creating return for order:', order_id);

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

    // Create order note with return request
    const note = {
      note: `🔄 SOLICITUD DE DEVOLUCIÓN\n\nMotivo: ${reason}\nDescripción: ${description}\nFotos adjuntas: ${has_photos ? 'Sí' : 'No'}\nEmail: ${customer_email}`,
      customer_note: false
    };

    await woocommerce.post(`orders/${order_id}/notes`, note);

    // Update order meta_data to mark return request
    const updateData = {
      meta_data: [
        {
          key: '_return_request',
          value: 'pending'
        },
        {
          key: '_return_reason',
          value: reason
        },
        {
          key: '_return_description',
          value: description
        },
        {
          key: '_return_date',
          value: new Date().toISOString()
        }
      ]
    };

    await woocommerce.put(`orders/${order_id}`, updateData);

    console.log('[create-return-request] Return request created successfully');

    return NextResponse.json({
      success: true,
      message: 'Solicitud de devolución creada correctamente',
      return_request: {
        order_id: order_id,
        status: 'pending',
        next_steps: 'Un representante se pondrá en contacto contigo en las próximas 24-48 horas'
      }
    });

  } catch (error: any) {
    console.error('[create-return-request] Error:', error);

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al crear solicitud de devolución' },
      { status: 500 }
    );
  }
}
