import { generateResponseWithFallback } from '@snkhouse/ai-agent';
import type { ConversationMessage } from '@snkhouse/ai-agent';
import { WhatsAppClient } from '@snkhouse/integrations';
import type { Message, WebhookValue } from './types';

// Inicializar WhatsApp client
const whatsappClient = new WhatsAppClient({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
});

/**
 * Processa uma mensagem recebida do WhatsApp
 * VERSÃO SIMPLIFICADA SEM BANCO DE DADOS (temporário)
 */
export async function processIncomingWhatsAppMessage(
  message: Message,
  value: WebhookValue
): Promise<void> {

  console.log('[MessageProcessor] 🚀 Starting SIMPLIFIED processing (no database)...');

  try {
    const from = message.from;
    const messageBody = message.text?.body;

    if (!messageBody) {
      console.log('[MessageProcessor] ⚠️ No text message, skipping');
      return;
    }

    const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';

    console.log('[MessageProcessor] 📋 Message received:', {
      from: from.slice(0, 4) + '***',
      name: contactName,
      text: messageBody
    });

    // REATIVADO: Processar COM banco de dados (Supabase)
    console.log('[MessageProcessor] 💾 FULL MODE: Using Supabase for persistence');

    let customer: any;
    let conversation: any;
    const context = {
      conversationId: 'temp-conv-' + Date.now(),
      customerId: undefined as string | undefined,
      customerEmail: undefined as string | undefined,
    };

    // TENTAR usar Supabase (com timeout e fallback)
    try {
      const { supabaseAdmin } = await import('@snkhouse/database');

      // 1. CRIAR/BUSCAR CUSTOMER
      console.log('[MessageProcessor] 👤 Finding or creating customer...');

      const customerOperation = (async () => {
        // Buscar customer existente por telefone
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('phone', from)
          .single();

        if (existingCustomer) {
          // Atualizar last_message_at
          await supabaseAdmin
            .from('customers')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingCustomer.id);

          return existingCustomer;
        }

        // Criar novo customer
        const { data: newCustomer, error } = await supabaseAdmin
          .from('customers')
          .insert({
            phone: from,
            name: contactName,
            source: 'whatsapp',
            metadata: {
              whatsapp_name: contactName,
              last_message_at: new Date().toISOString(),
            }
          })
          .select()
          .single();

        if (error) throw error;
        return newCustomer;
      })();

      customer = await Promise.race([
        customerOperation,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Customer timeout after 5s')), 5000)
        )
      ]);

      console.log('[MessageProcessor] ✅ Customer found/created:', {
        id: customer.id,
        phone: customer.phone,
      });

      // 2. CRIAR/BUSCAR CONVERSA
      console.log('[MessageProcessor] 💬 Getting or creating conversation...');

      const conversationOperation = (async () => {
        // Buscar conversa ativa existente
        const { data: existingConv } = await supabaseAdmin
          .from('conversations')
          .select('*')
          .eq('customer_id', customer.id)
          .eq('channel', 'whatsapp')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingConv) {
          // Atualizar updated_at
          await supabaseAdmin
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingConv.id);

          return existingConv;
        }

        // Criar nova conversa
        const { data: newConv, error } = await supabaseAdmin
          .from('conversations')
          .insert({
            customer_id: customer.id,
            channel: 'whatsapp',
            status: 'active',
            language: 'es',
            metadata: {
              phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID,
              last_message_at: new Date().toISOString(),
            }
          })
          .select()
          .single();

        if (error) throw error;
        return newConv;
      })();

      conversation = await Promise.race([
        conversationOperation,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Conversation timeout after 5s')), 5000)
        )
      ]);

      console.log('[MessageProcessor] ✅ Conversation created:', conversation.id);

      // 3. SALVAR MENSAGEM DO USUÁRIO
      console.log('[MessageProcessor] 💾 Saving user message...');

      await Promise.race([
        supabaseAdmin.from('messages').insert({
          conversation_id: conversation.id,
          role: 'user',
          content: messageBody,
          metadata: {
            whatsapp_message_id: message.id,
            timestamp: message.timestamp,
            from: from,
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save message timeout after 3s')), 3000)
        )
      ]);

      console.log('[MessageProcessor] ✅ User message saved to database');

      // Atualizar contexto com IDs reais
      context.customerId = customer.id;
      context.conversationId = conversation.id;
      context.customerEmail = customer.email;

    } catch (error) {
      console.error('[MessageProcessor] ⚠️ Database error (continuing without DB):',
        error instanceof Error ? error.message : String(error));

      console.log('[MessageProcessor] ⚠️ Falling back to temporary IDs');

      // FALLBACK: IDs temporários se DB falhar
      context.customerId = 'temp-customer-' + from;
      context.conversationId = 'temp-conv-' + Date.now();
    }

    // Preparar mensagem para AI
    const aiMessages: ConversationMessage[] = [
      {
        role: 'user',
        content: messageBody,
      }
    ];

    console.log('[MessageProcessor] 🤖 Processing with AI Agent...', {
      messageLength: messageBody.length,
      context
    });

    const response = await generateResponseWithFallback(aiMessages, context);

    console.log('[MessageProcessor] ✅ AI Response received:', {
      length: response.content.length,
      model: response.model,
      preview: response.content.substring(0, 100) + '...'
    });

    // =====================================================
    // 🔴 PRIORIDADE #1: ENVIAR MENSAGEM IMEDIATAMENTE!
    // =====================================================
    console.log('[MessageProcessor] 📤 PRIORITY: Sending WhatsApp message FIRST...');
    console.log('[MessageProcessor] 🔑 Checking WhatsApp credentials...');
    console.log('[MessageProcessor] 📋 Config:', {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'SET' : 'MISSING',
      phoneNumberIdValue: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?
        'SET (' + process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 15) + '...)' : 'MISSING',
    });

    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials missing!');
    }

    console.log('[MessageProcessor] 📱 Sending to:', from.slice(0, 4) + '***');
    console.log('[MessageProcessor] 💬 Message length:', response.content.length);
    console.log('[MessageProcessor] 💬 Message preview:', response.content.substring(0, 100) + '...');

    try {
      console.log('[MessageProcessor] 📡 Calling WhatsApp API...');

      const sendResult = await whatsappClient.sendMessage({
        to: from,
        message: response.content,
      });

      console.log('[MessageProcessor] ✅✅✅ MESSAGE SENT SUCCESSFULLY! ✅✅✅');
      console.log('[MessageProcessor] 📊 Send result:', {
        messageId: sendResult.messageId?.slice(0, 20) + '...',
        success: !!sendResult.messageId
      });

      // Salvar resposta da IA no banco (se temos conversation ID real)
      if (context.conversationId && !context.conversationId.toString().startsWith('temp-')) {
        try {
          console.log('[MessageProcessor] 💾 Saving AI response to database...');

          const { supabaseAdmin } = await import('@snkhouse/database');

          await Promise.race([
            supabaseAdmin.from('messages').insert({
              conversation_id: context.conversationId,
              role: 'assistant',
              content: response.content,
              metadata: {
                model: response.model,
                whatsapp_message_id: sendResult.messageId,
                sent_at: new Date().toISOString(),
              }
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Save AI response timeout')), 3000)
            )
          ]);

          console.log('[MessageProcessor] ✅ AI response saved to database');
        } catch (saveError) {
          console.error('[MessageProcessor] ⚠️ Failed to save AI response (ignored):',
            saveError instanceof Error ? saveError.message : String(saveError));
        }
      } else {
        console.log('[MessageProcessor] ⚠️ Skipping AI response save (temp conversation ID)');
      }

    } catch (sendError: any) {
      console.error('[MessageProcessor] ❌ ERROR SENDING MESSAGE:', {
        name: sendError instanceof Error ? sendError.name : 'Unknown',
        message: sendError instanceof Error ? sendError.message : String(sendError),
        status: sendError.status,
        code: sendError.code,
        stack: sendError instanceof Error ? sendError.stack?.substring(0, 300) : undefined,
      });

      throw sendError; // Re-throw para cair no error handler principal
    }

    // =====================================================
    // 🟡 OPCIONAL: Marcar como lida (DEPOIS do envio)
    // =====================================================
    try {
      console.log('[MessageProcessor] 👁️ [OPTIONAL] Marking as read...');
      await whatsappClient.markAsRead({ messageId: message.id });
      console.log('[MessageProcessor] ✅ Marked as read');
    } catch (markError: any) {
      console.warn('[MessageProcessor] ⚠️ Failed to mark as read (ignored):', markError.message);
      // Não lançar erro - marking as read não é crítico
    }

    console.log('[MessageProcessor] 🎉🎉🎉 Processing completed successfully! 🎉🎉🎉');

  } catch (error: any) {
    console.error('[MessageProcessor] ❌ ERROR:', error);
    console.error('[MessageProcessor] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[MessageProcessor] ❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      type: typeof error
    });

    // Em caso de erro, tentar enviar mensagem genérica
    try {
      console.log('[MessageProcessor] 🚨 Attempting to send error message to user...');

      await whatsappClient.sendMessage({
        to: message.from,
        message: 'Disculpá, tuve un problema técnico. Intentá de nuevo en unos minutos. 🙏',
      });

      console.log('[MessageProcessor] ✅ Error message sent to user');

    } catch (sendError: any) {
      console.error('[MessageProcessor] ❌ Failed to send error message:', sendError);
      console.error('[MessageProcessor] ❌ Send error details:', {
        name: sendError instanceof Error ? sendError.name : 'Unknown',
        message: sendError instanceof Error ? sendError.message : String(sendError)
      });
    }
  }
}
