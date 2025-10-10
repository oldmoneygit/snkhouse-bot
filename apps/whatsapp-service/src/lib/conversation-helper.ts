import { supabaseAdmin as supabase } from '@snkhouse/database';

interface GetOrCreateConversationParams {
  customerId: string;
  phone: string;
  waId: string;
}

/**
 * Busca conversa ativa ou cria nova para WhatsApp
 */
export async function getOrCreateConversation({
  customerId,
  phone,
  waId,
}: GetOrCreateConversationParams): Promise<any> {

  // 1. Buscar conversa ativa (últimas 24h)
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
    console.error('[ConversationHelper] Error finding conversation:', findError);
    throw new Error('Failed to find conversation');
  }

  // 2. Se encontrou conversa ativa, retornar
  if (activeConversation) {
    console.log('[ConversationHelper] Active conversation found:', activeConversation.id);
    return activeConversation;
  }

  // 3. Criar nova conversa
  console.log('[ConversationHelper] Creating new WhatsApp conversation');

  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({
      customer_id: customerId,
      channel: 'whatsapp',
      status: 'active',
      channel_metadata: {
        wa_id: waId,
        phone,
      },
    })
    .select()
    .single();

  if (createError || !newConversation) {
    console.error('[ConversationHelper] Error creating conversation:', createError);
    throw new Error('Failed to create conversation');
  }

  console.log('[ConversationHelper] New conversation created:', newConversation.id);

  return newConversation;
}

/**
 * Carrega histórico da conversa (últimas N mensagens)
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 10
): Promise<any[]> {

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ConversationHelper] Error loading history:', error);
    return [];
  }

  // Retornar em ordem cronológica (mais antigo primeiro)
  return (messages || []).reverse();
}

/**
 * Salva mensagem no banco
 */
export async function saveMessage({
  conversationId,
  role,
  content,
  whatsappMessageId,
  whatsappStatus,
}: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  whatsappMessageId?: string;
  whatsappStatus?: string;
}): Promise<any> {

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      whatsapp_message_id: whatsappMessageId || null,
      whatsapp_status: whatsappStatus || null,
    })
    .select()
    .single();

  if (error || !message) {
    console.error('[ConversationHelper] Error saving message:', error);
    throw new Error('Failed to save message');
  }

  return message;
}

/**
 * Verifica se mensagem já foi processada (deduplicação)
 */
export async function isMessageProcessed(whatsappMessageId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .eq('whatsapp_message_id', whatsappMessageId)
    .maybeSingle();

  if (error) {
    console.error('[ConversationHelper] Error checking message:', error);
    return false;
  }

  return !!data;
}
