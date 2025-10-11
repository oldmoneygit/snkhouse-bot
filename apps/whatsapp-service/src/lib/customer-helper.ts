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
  const startTime = Date.now();
  console.log('[Customer Helper] 🔍 START findOrCreateCustomer', {
    phone: phone.substring(0, 8) + '***',
    whatsappName,
    waId: waId.substring(0, 8) + '***',
    timestamp: new Date().toISOString()
  });

  try {
    // Step 1: Verify Supabase client
    console.log('[Customer Helper] 📋 Verifying Supabase client...');
    if (!supabase) {
      throw new Error('❌ Supabase client is not initialized!');
    }
    console.log('[Customer Helper] ✅ Supabase client OK');

    // Step 2: Query existing customer
    console.log('[Customer Helper] 🔍 Querying for existing customer by phone...');

    const queryStart = Date.now();
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    const queryDuration = Date.now() - queryStart;
    console.log('[Customer Helper] 📊 Query completed', {
      duration: queryDuration,
      found: !!existingCustomer,
      error: findError?.message
    });

    // Step 3: Handle query errors
    if (findError) {
      console.error('[Customer Helper] ❌ Query error:', {
        message: findError.message,
        code: findError.code,
        details: findError.details,
        hint: findError.hint
      });
      throw new Error(`Supabase query failed: ${findError.message}`);
    }

    // Step 4: Update existing customer if found
    if (existingCustomer) {
      console.log('[Customer Helper] ✅ Existing customer found', {
        id: existingCustomer.id,
        currentName: existingCustomer.whatsapp_name,
        newName: whatsappName
      });

      // Update name if changed
      if (existingCustomer.whatsapp_name !== whatsappName) {
        console.log('[Customer Helper] 📝 Updating customer name...');

        const updateStart = Date.now();
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            whatsapp_name: whatsappName,
            whatsapp_profile_updated_at: new Date().toISOString(),
          })
          .eq('id', existingCustomer.id);

        if (updateError) {
          console.error('[Customer Helper] ⚠️ Update failed (non-critical):', updateError);
        } else {
          console.log('[Customer Helper] ✅ Name updated', {
            duration: Date.now() - updateStart
          });
        }
      }

      console.log('[Customer Helper] ✅ SUCCESS - Returning existing customer', {
        id: existingCustomer.id,
        totalDuration: Date.now() - startTime
      });

      return existingCustomer;
    }

    // Step 5: Create new customer
    console.log('[Customer Helper] 🆕 Creating new customer...');

    const newCustomerData = {
      phone,
      whatsapp_name: whatsappName,
      whatsapp_profile_updated_at: new Date().toISOString(),
      // email e woocommerce_customer_id ficam null até identificar
    };

    console.log('[Customer Helper] 📤 Inserting customer data...');

    const insertStart = Date.now();
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert(newCustomerData)
      .select()
      .single();

    const insertDuration = Date.now() - insertStart;
    console.log('[Customer Helper] 📊 Insert completed', {
      duration: insertDuration,
      success: !!newCustomer,
      error: createError?.message
    });

    // Step 6: Handle insert errors
    if (createError) {
      console.error('[Customer Helper] ❌ Insert error:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      });
      throw new Error(`Failed to create customer: ${createError.message}`);
    }

    if (!newCustomer) {
      throw new Error('Customer created but no data returned');
    }

    console.log('[Customer Helper] ✅ SUCCESS - New customer created', {
      id: newCustomer.id,
      totalDuration: Date.now() - startTime
    });

    return newCustomer;

  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error('[Customer Helper] ❌ CRITICAL ERROR', {
      error: error.message,
      stack: error.stack?.substring(0, 500), // Truncate stack trace
      duration,
      phone: phone.substring(0, 8) + '***'
    });

    // Re-throw with more context
    throw new Error(`Customer helper failed after ${duration}ms: ${error.message}`);
  }
}

/**
 * Atualiza customer_id do WooCommerce quando identificar o cliente
 */
export async function linkCustomerToWooCommerce(
  customerId: string,
  email: string,
  woocommerceCustomerId: number
): Promise<void> {
  console.log('[Customer Helper] 🔗 Linking customer to WooCommerce', {
    customerId,
    email: email.substring(0, 3) + '***',
    woocommerceCustomerId
  });

  try {
    const { error } = await supabase
      .from('customers')
      .update({
        email,
        woocommerce_customer_id: woocommerceCustomerId,
      })
      .eq('id', customerId);

    if (error) {
      console.error('[Customer Helper] ❌ Error linking to WooCommerce:', error);
      throw new Error('Failed to link customer to WooCommerce');
    }

    console.log('[Customer Helper] ✅ Customer linked to WooCommerce successfully');
  } catch (error: any) {
    console.error('[Customer Helper] ❌ Link failed:', error.message);
    throw error;
  }
}
