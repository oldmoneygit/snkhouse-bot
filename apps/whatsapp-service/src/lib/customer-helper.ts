import { supabaseAdmin as supabase } from '@snkhouse/database';

interface FindOrCreateCustomerParams {
  phone: string;
  whatsappName: string;
  waId: string;
}

/**
 * Busca ou cria um customer baseado no telefone WhatsApp
 */
export async function findOrCreateCustomer({
  phone,
  whatsappName,
  waId,
}: FindOrCreateCustomerParams): Promise<any> {

  // 1. Tentar encontrar customer existente por telefone
  const { data: existingCustomer, error: findError } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (findError) {
    console.error('[CustomerHelper] Error finding customer:', findError);
    throw new Error('Failed to find customer');
  }

  // 2. Se encontrou, atualizar nome do WhatsApp (pode ter mudado)
  if (existingCustomer) {
    console.log('[CustomerHelper] Customer found:', existingCustomer.id);

    // Atualizar nome se mudou
    if (existingCustomer.whatsapp_name !== whatsappName) {
      await supabase
        .from('customers')
        .update({
          whatsapp_name: whatsappName,
          whatsapp_profile_updated_at: new Date().toISOString(),
        })
        .eq('id', existingCustomer.id);
    }

    return existingCustomer;
  }

  // 3. Não encontrou - criar novo customer
  console.log('[CustomerHelper] Creating new customer for phone:', phone.slice(0, 4) + '***');

  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert({
      phone,
      whatsapp_name: whatsappName,
      whatsapp_profile_updated_at: new Date().toISOString(),
      // email e woocommerce_customer_id ficam null até identificar
    })
    .select()
    .single();

  if (createError || !newCustomer) {
    console.error('[CustomerHelper] Error creating customer:', createError);
    throw new Error('Failed to create customer');
  }

  console.log('[CustomerHelper] New customer created:', newCustomer.id);

  return newCustomer;
}

/**
 * Atualiza customer_id do WooCommerce quando identificar o cliente
 */
export async function linkCustomerToWooCommerce(
  customerId: string,
  email: string,
  woocommerceCustomerId: number
): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({
      email,
      woocommerce_customer_id: woocommerceCustomerId,
    })
    .eq('id', customerId);

  if (error) {
    console.error('[CustomerHelper] Error linking to WooCommerce:', error);
    throw new Error('Failed to link customer to WooCommerce');
  }

  console.log('[CustomerHelper] Customer linked to WooCommerce:', {
    customerId,
    woocommerceCustomerId,
  });
}
