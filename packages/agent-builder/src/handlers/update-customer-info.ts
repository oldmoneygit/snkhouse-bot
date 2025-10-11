import { getWooCommerceClient } from '@snkhouse/integrations';

export interface UpdateCustomerInfoInput {
  current_email: string;
  updates: {
    new_email?: string | null;
    phone?: string | null;
    billing_address?: {
      address_1?: string | null;
      address_2?: string | null;
      city?: string | null;
      state?: string | null;
      postcode?: string | null;
      country?: string | null;
    } | null;
  };
}

export async function updateCustomerInfoHandler(input: UpdateCustomerInfoInput) {
  try {
    console.log(`👤 [UpdateCustomer] Updating info for: ${input.current_email}`);

    const wc = getWooCommerceClient();

    // Step 1: Buscar customer por email atual
    const customersResponse = await wc.get('customers', {
      email: input.current_email,
      per_page: 1
    });

    if (!customersResponse.data || customersResponse.data.length === 0) {
      return {
        success: false,
        error: 'No encontramos una cuenta con ese email.'
      };
    }

    const customer = customersResponse.data[0];
    const customerId = customer.id;

    console.log(`✅ [UpdateCustomer] Customer found: ID ${customerId}`);

    // Step 2: Construir objeto de atualização
    const updateData: any = {};
    const updatedFields: string[] = [];

    if (input.updates.new_email) {
      updateData.email = input.updates.new_email;
      updatedFields.push('email');
    }

    if (input.updates.phone) {
      updateData.billing = { ...updateData.billing, phone: input.updates.phone };
      updatedFields.push('phone');
    }

    if (input.updates.billing_address) {
      updateData.billing = {
        ...updateData.billing,
        ...input.updates.billing_address
      };
      updatedFields.push('billing_address');
    }

    if (updatedFields.length === 0) {
      return {
        success: false,
        error: 'No se proporcionó ninguna información para actualizar.'
      };
    }

    console.log(`📝 [UpdateCustomer] Updating fields:`, updatedFields);

    // Step 3: Atualizar customer
    await wc.put(`customers/${customerId}`, updateData);

    console.log(`✅ [UpdateCustomer] Customer updated successfully`);

    return {
      success: true,
      message: 'Información actualizada exitosamente',
      updated_fields: updatedFields
    };

  } catch (error: any) {
    console.error('❌ [UpdateCustomer] Error:', error.message);

    // Check if email already exists
    if (error.response?.data?.code === 'registration-error-email-exists') {
      return {
        success: false,
        error: 'El nuevo email ya está registrado en otra cuenta.'
      };
    }

    return {
      success: false,
      error: 'Hubo un problema al actualizar la información. Intentá de nuevo.'
    };
  }
}
