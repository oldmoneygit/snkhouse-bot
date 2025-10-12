import { NextRequest, NextResponse } from 'next/server';
import { woocommerceClient, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { current_email, updates } = body;

    console.log('[update-customer-info] Updating customer:', current_email);

    // Search customer by email
    const searchResponse = await woocommerceClient.get('/customers', {
      params: {
        email: current_email,
        per_page: 1
      }
    });

    if (searchResponse.data.length === 0) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const customerId = searchResponse.data[0].id;

    // Build update data
    const updateData: any = {};

    if (updates.new_email) {
      updateData.email = updates.new_email;
    }

    if (updates.phone) {
      updateData.billing = {
        ...searchResponse.data[0].billing,
        phone: updates.phone
      };
    }

    if (updates.billing_address) {
      updateData.billing = {
        ...searchResponse.data[0].billing,
        ...updates.billing_address
      };
    }

    // Update customer
    const updateResponse = await woocommerceClient.put(`/customers/${customerId}`, updateData);

    console.log('[update-customer-info] Customer updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Información actualizada correctamente',
      customer: {
        id: updateResponse.data.id,
        email: updateResponse.data.email,
        phone: updateResponse.data.billing.phone
      }
    });

  } catch (error: any) {
    console.error('[update-customer-info] Error:', error);

    if (error.response?.data?.code === 'registration-error-email-exists') {
      return NextResponse.json(
        { error: 'El nuevo email ya está en uso' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar información' },
      { status: 500 }
    );
  }
}
