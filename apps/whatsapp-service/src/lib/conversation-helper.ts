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
 * Com timeout de 3 segundos para não travar o processamento
 */
export async function isMessageProcessed(whatsappMessageId: string): Promise<boolean> {
  try {
    console.log('[ConversationHelper] 🔍 Checking duplicate with 3s timeout...');

    // Query com timeout
    const checkPromise = supabase
      .from('messages')
      .select('id')
      .eq('whatsapp_message_id', whatsappMessageId)
      .maybeSingle();

    // Timeout de 3 segundos
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Duplicate check timeout')), 3000)
    );

    const { data, error } = await Promise.race([
      checkPromise,
      timeoutPromise
    ]);

    if (error) {
      console.warn('[ConversationHelper] ⚠️ Error checking message (assuming not processed):', error.message);
      return false; // Se der erro, assumir que não foi processada
    }

    const isProcessed = !!data;
    console.log('[ConversationHelper] ✅ Duplicate check result:', isProcessed ? 'ALREADY PROCESSED' : 'NEW MESSAGE');

    return isProcessed;

  } catch (error: any) {
    console.warn('[ConversationHelper] ⚠️ Duplicate check failed/timeout (assuming not processed):',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return false; // Se der timeout, assumir que não foi processada (melhor processar duplicado que não processar)
  }
}
