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
  const startTime = Date.now();
  console.log('[Conversation Helper] 🔍 START getOrCreateConversation', {
    customerId,
    phone: phone.substring(0, 8) + '***',
    waId: waId.substring(0, 8) + '***',
    timestamp: new Date().toISOString()
  });

  try {
    // Step 1: Verify Supabase client
    console.log('[Conversation Helper] 📋 Verifying Supabase client...');
    if (!supabase) {
      throw new Error('❌ Supabase client is not initialized!');
    }
    console.log('[Conversation Helper] ✅ Supabase client OK');

    // Step 2: Query for active conversation
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log('[Conversation Helper] 🔍 Querying active conversation (last 24h)...');

    const queryStart = Date.now();
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

    const queryDuration = Date.now() - queryStart;
    console.log('[Conversation Helper] 📊 Query completed', {
      duration: queryDuration,
      found: !!activeConversation,
      error: findError?.message
    });

    // Step 3: Handle query errors
    if (findError) {
      console.error('[Conversation Helper] ❌ Query error:', {
        message: findError.message,
        code: findError.code,
        details: findError.details,
        hint: findError.hint
      });
      throw new Error(`Conversation query failed: ${findError.message}`);
    }

    // Step 4: Return existing conversation if found
    if (activeConversation) {
      console.log('[Conversation Helper] ✅ Active conversation found', {
        id: activeConversation.id,
        created: activeConversation.created_at,
        updated: activeConversation.updated_at,
        totalDuration: Date.now() - startTime
      });
      return activeConversation;
    }

    // Step 5: Create new conversation
    console.log('[Conversation Helper] 🆕 Creating new conversation...');

    const newConversationData = {
      customer_id: customerId,
      channel: 'whatsapp',
      status: 'active',
      channel_metadata: {
        wa_id: waId,
        phone,
      },
    };

    console.log('[Conversation Helper] 📤 Inserting conversation data...');

    const insertStart = Date.now();
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert(newConversationData)
      .select()
      .single();

    const insertDuration = Date.now() - insertStart;
    console.log('[Conversation Helper] 📊 Insert completed', {
      duration: insertDuration,
      success: !!newConversation,
      error: createError?.message
    });

    // Step 6: Handle insert errors
    if (createError) {
      console.error('[Conversation Helper] ❌ Insert error:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      });
      throw new Error(`Failed to create conversation: ${createError.message}`);
    }

    if (!newConversation) {
      throw new Error('Conversation created but no data returned');
    }

    console.log('[Conversation Helper] ✅ SUCCESS - New conversation created', {
      id: newConversation.id,
      totalDuration: Date.now() - startTime
    });

    return newConversation;

  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error('[Conversation Helper] ❌ CRITICAL ERROR', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      duration,
      customerId
    });

    throw new Error(`Conversation helper failed after ${duration}ms: ${error.message}`);
  }
}

/**
 * Carrega histórico da conversa (últimas N mensagens)
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 10
): Promise<any[]> {
  console.log('[Conversation Helper] 📜 Loading conversation history', {
    conversationId,
    limit
  });

  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Conversation Helper] ❌ Error loading history:', error);
      return [];
    }

    const messageCount = messages?.length || 0;
    console.log('[Conversation Helper] ✅ History loaded', {
      count: messageCount
    });

    // Retornar em ordem cronológica (mais antigo primeiro)
    return (messages || []).reverse();
  } catch (error: any) {
    console.error('[Conversation Helper] ⚠️ History load failed:', error.message);
    return []; // Return empty array on failure
  }
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
  console.log('[Conversation Helper] 💾 Saving message', {
    conversationId,
    role,
    contentLength: content.length,
    hasWhatsappId: !!whatsappMessageId
  });

  try {
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

    if (error) {
      console.error('[Conversation Helper] ❌ Error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }

    if (!message) {
      throw new Error('Message saved but no data returned');
    }

    console.log('[Conversation Helper] ✅ Message saved', {
      id: message.id
    });

    return message;
  } catch (error: any) {
    console.error('[Conversation Helper] ❌ Save message failed:', error.message);
    throw error;
  }
}

/**
 * Verifica se mensagem já foi processada (deduplicação)
 * Com timeout de 3 segundos para não travar o processamento
 */
export async function isMessageProcessed(whatsappMessageId: string): Promise<boolean> {
  try {
    console.log('[Conversation Helper] 🔍 Checking duplicate...');

    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('whatsapp_message_id', whatsappMessageId)
      .maybeSingle();

    if (error) {
      console.warn('[Conversation Helper] ⚠️ Error checking message (assuming not processed):', error.message);
      return false; // Se der erro, assumir que não foi processada
    }

    const isProcessed = !!data;
    console.log('[Conversation Helper] ✅ Duplicate check result:', isProcessed ? 'ALREADY PROCESSED' : 'NEW MESSAGE');

    return isProcessed;

  } catch (error: any) {
    console.warn('[Conversation Helper] ⚠️ Duplicate check failed (assuming not processed):',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return false; // Se der timeout, assumir que não foi processada (melhor processar duplicado que não processar)
  }
}
