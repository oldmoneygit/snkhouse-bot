/**
 * Helpers para gerenciar customers e conversations (Admin context)
 */

import { supabaseAdmin as supabase } from '@snkhouse/database';

/**
 * Busca ou cria customer pelo telefone
 */
export async function findOrCreateCustomer(phone: string, name?: string) {
  console.log('[WhatsAppHelpers] 🔍 findOrCreateCustomer:', phone.slice(0, 4) + '***');

  try {
    // Buscar customer existente
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (findError) {
      console.error('[WhatsAppHelpers] ❌ Error finding customer:', findError);
      throw new Error(`Erro ao buscar cliente: ${findError.message}`);
    }

    // Se encontrou, retornar
    if (existingCustomer) {
      console.log('[WhatsAppHelpers] ✅ Customer found:', existingCustomer.id);
      return existingCustomer;
    }

    // Criar novo customer
    console.log('[WhatsAppHelpers] 🆕 Creating new customer...');
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        phone,
        whatsapp_name: name || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('[WhatsAppHelpers] ❌ Error creating customer:', createError);
      throw new Error(`Erro ao criar cliente: ${createError.message}`);
    }

    if (!newCustomer) {
      throw new Error('Customer criado mas sem dados retornados');
    }

    console.log('[WhatsAppHelpers] ✅ Customer created:', newCustomer.id);
    return newCustomer;
  } catch (error: any) {
    console.error('[WhatsAppHelpers] ❌ Error:', error);
    throw error;
  }
}

/**
 * Busca ou cria conversation para o customer
 */
export async function findOrCreateConversation(customerId: string) {
  console.log('[WhatsAppHelpers] 🔍 findOrCreateConversation:', customerId);

  try {
    // Buscar conversa ativa recente (últimas 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: activeConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('channel', 'whatsapp')
      .eq('status', 'active')
      .gte('updated_at', oneDayAgo)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('[WhatsAppHelpers] ❌ Error finding conversation:', findError);
      throw new Error(`Erro ao buscar conversa: ${findError.message}`);
    }

    // Se encontrou, retornar
    if (activeConversation) {
      console.log('[WhatsAppHelpers] ✅ Conversation found:', activeConversation.id);
      return activeConversation;
    }

    // Criar nova conversation
    console.log('[WhatsAppHelpers] 🆕 Creating new conversation...');
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        customer_id: customerId,
        channel: 'whatsapp',
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('[WhatsAppHelpers] ❌ Error creating conversation:', createError);
      throw new Error(`Erro ao criar conversa: ${createError.message}`);
    }

    if (!newConversation) {
      throw new Error('Conversa criada mas sem dados retornados');
    }

    console.log('[WhatsAppHelpers] ✅ Conversation created:', newConversation.id);
    return newConversation;
  } catch (error: any) {
    console.error('[WhatsAppHelpers] ❌ Error:', error);
    throw error;
  }
}

/**
 * Salva mensagem no banco
 */
export async function saveMessage({
  conversationId,
  role,
  content,
  imageUrl,
  whatsappMessageId,
}: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  whatsappMessageId?: string;
}) {
  console.log('[WhatsAppHelpers] 💾 saveMessage:', {
    conversationId,
    role,
    hasImage: !!imageUrl,
  });

  try {
    const metadata: any = {
      sent_by: 'admin',
      sent_at: new Date().toISOString(),
    };

    if (imageUrl) {
      metadata.image_url = imageUrl;
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        metadata,
        whatsapp_message_id: whatsappMessageId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[WhatsAppHelpers] ❌ Error saving message:', error);
      throw new Error(`Erro ao salvar mensagem: ${error.message}`);
    }

    if (!message) {
      throw new Error('Mensagem salva mas sem dados retornados');
    }

    console.log('[WhatsAppHelpers] ✅ Message saved:', message.id);
    return message;
  } catch (error: any) {
    console.error('[WhatsAppHelpers] ❌ Error:', error);
    throw error;
  }
}
