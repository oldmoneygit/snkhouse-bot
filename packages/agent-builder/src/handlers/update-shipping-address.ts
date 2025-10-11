import { getWooCommerceClient } from '@snkhouse/integrations';

export interface UpdateShippingAddressInput {
  order_id: string;
  customer_email: string;
  new_address: {
    address_1: string;
    address_2?: string | null;
    city: string;
    state: string;
    postcode: string;
    country?: string | null;
  };
}

export async function updateShippingAddressHandler(input: UpdateShippingAddressInput) {
  try {
    console.log(`📦 [UpdateAddress] Updating address for order: ${input.order_id}`);

    const wc = getWooCommerceClient();

    // Step 1: Buscar pedido e validar email
    const orderResponse = await wc.get(`orders/${input.order_id}`);
    const order = orderResponse.data;

    // SEGURANÇA: Validar ownership
    if (order.billing.email.toLowerCase() !== input.customer_email.toLowerCase()) {
      console.warn(`⚠️ [UpdateAddress] Email mismatch!`);
      return {
        success: false,
        error: 'El email no coincide con el pedido.'
      };
    }

    // Step 2: Verificar se status permite modificação
    const allowedStatuses = ['pending', 'processing', 'on-hold'];
    if (!allowedStatuses.includes(order.status)) {
      console.warn(`⚠️ [UpdateAddress] Status doesn't allow modification: ${order.status}`);
      return {
        success: false,
        error: `No podés modificar la dirección. El pedido está en estado: "${order.status}". Solo se puede modificar si está pendiente o procesando.`,
        current_status: order.status
      };
    }

    // Step 3: Atualizar endereço
    const updateData = {
      shipping: {
        address_1: input.new_address.address_1,
        address_2: input.new_address.address_2 || '',
        city: input.new_address.city,
        state: input.new_address.state,
        postcode: input.new_address.postcode,
        country: input.new_address.country || order.shipping.country
      }
    };

    console.log(`📝 [UpdateAddress] Updating with:`, updateData.shipping);

    await wc.put(`orders/${input.order_id}`, updateData);

    console.log(`✅ [UpdateAddress] Address updated successfully`);

    return {
      success: true,
      message: 'Dirección actualizada exitosamente',
      order_id: input.order_id,
      new_address: updateData.shipping
    };

  } catch (error: any) {
    console.error('❌ [UpdateAddress] Error:', error.message);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: `No encontramos el pedido #${input.order_id}.`
      };
    }

    return {
      success: false,
      error: 'Hubo un problema al actualizar la dirección. Intentá de nuevo.'
    };
  }
}
