import { getWooCommerceClient } from '@snkhouse/integrations';

export interface CreateReturnRequestInput {
  order_id: string;
  customer_email: string;
  reason: string;
  description: string;
  has_photos?: boolean | null;
}

export async function createReturnRequestHandler(input: CreateReturnRequestInput) {
  try {
    console.log(`🔄 [CreateReturn] Processing return for order: ${input.order_id}`);

    const wc = getWooCommerceClient();

    // Step 1: Buscar pedido e validar
    const response = await wc.get(`orders/${input.order_id}`);
    const order = response.data;

    // SEGURANÇA: Validar email
    if (order.billing.email.toLowerCase() !== input.customer_email.toLowerCase()) {
      console.warn(`⚠️ [CreateReturn] Email mismatch!`);
      return {
        success: false,
        error: 'El email no coincide con el pedido.'
      };
    }

    // Step 2: Verificar elegibilidad
    const ineligibleStatuses = ['cancelled', 'refunded', 'failed'];
    if (ineligibleStatuses.includes(order.status)) {
      return {
        success: false,
        error: `No podés crear una devolución para este pedido. Estado actual: "${order.status}".`
      };
    }

    // Verificar si ya pasaron más de 30 días
    const orderDate = new Date(order.date_created);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceOrder > 30) {
      return {
        success: false,
        error: `El plazo para devoluciones es de 30 días. Tu pedido tiene ${daysSinceOrder} días.`
      };
    }

    // Step 3: Crear return ID único
    const timestamp = Date.now();
    const returnId = `RMA-${input.order_id}-${timestamp}`;

    console.log(`📋 [CreateReturn] Generated return ID: ${returnId}`);

    // Step 4: Adicionar nota ao pedido
    const noteText = `🔄 DEVOLUCIÓN SOLICITADA

Return ID: ${returnId}
Motivo: ${input.reason}
Descripción: ${input.description}
Fotos adjuntas: ${input.has_photos ? 'Sí' : 'No'}
Fecha solicitud: ${new Date().toISOString()}

Estado: Pendiente de aprobación`;

    await wc.post(`orders/${input.order_id}/notes`, {
      note: noteText,
      customer_note: false // Nota privada, no visible para cliente
    });

    console.log(`✅ [CreateReturn] Return request created successfully`);

    // Step 5: Retornar info da devolução
    return {
      success: true,
      return_id: returnId,
      order_id: input.order_id,
      status: 'pending_approval',
      return_label_url: `https://snkhouse.com/returns/label-${returnId}.pdf`, // Mock URL
      instructions: `1. Imprimir la etiqueta de devolución
2. Embalar el producto en su caja original
3. Pegar la etiqueta en el paquete
4. Despachar en el correo más cercano

⚠️ Importante: El producto debe estar en perfectas condiciones, sin uso.`,
      estimated_processing: '10-15 días hábiles',
      message: 'Solicitud de devolución procesada exitosamente. Recibirás la etiqueta por email en las próximas 24hs.'
    };

  } catch (error: any) {
    console.error('❌ [CreateReturn] Error:', error.message);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: `No encontramos el pedido #${input.order_id}.`
      };
    }

    return {
      success: false,
      error: 'Hubo un problema al procesar la devolución. Intentá de nuevo o contactá con soporte.'
    };
  }
}
