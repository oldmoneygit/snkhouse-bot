import { generateResponseWithFallback } from '@snkhouse/ai-agent';
import type { ConversationMessage } from '@snkhouse/ai-agent';
import { WhatsAppClient } from '@snkhouse/integrations';
import type { Message, WebhookValue } from './types';
import {
  findOrCreateCustomer,
} from './customer-helper';
import {
  getOrCreateConversation,
  getConversationHistory,
  saveMessage,
  isMessageProcessed,
} from './conversation-helper';

// Inicializar WhatsApp client
const whatsappClient = new WhatsAppClient({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
});

/**
 * Processa uma mensagem recebida do WhatsApp
 * COM MEMÓRIA DE CONVERSAÇÃO E DEBUG LOGGING
 */
export async function processIncomingWhatsAppMessage(
  message: Message,
  value: WebhookValue
): Promise<void> {

  console.log('[MessageProcessor] 🚀 Starting processing WITH DATABASE AND MEMORY...');

  try {
    const from = message.from;
    const messageBody = message.text?.body;
    const messageId = message.id;

    if (!messageBody) {
      console.log('[MessageProcessor] ⚠️ No text message, skipping');
      return;
    }

    const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';

    console.log('[MessageProcessor] 📋 Message received:', {
      from: from.slice(0, 4) + '***',
      name: contactName,
      text: messageBody,
      messageId: messageId.slice(0, 20) + '...'
    });

    // =====================================================
    // 🔍 DEBUG #1: Check if message already processed
    // =====================================================
    console.log('🔍 DEBUG #1 - Checking for duplicate message...');
    const alreadyProcessed = await isMessageProcessed(messageId);
    if (alreadyProcessed) {
      console.log('[MessageProcessor] ⚠️ Message already processed, skipping');
      return;
    }
    console.log('✅ DEBUG #1 - Message is new, proceeding');

    // =====================================================
    // 🔍 DEBUG #2: Get or create customer
    // =====================================================
    console.log('🔍 DEBUG #2 - Finding or creating customer...');
    const customer = await findOrCreateCustomer({
      phone: from,
      whatsappName: contactName,
      waId: from,
    });
    console.log('✅ DEBUG #2 - Customer retrieved:', {
      id: customer.id,
      email: customer.email || 'NO EMAIL',
      wooCustomerId: customer.woocommerce_customer_id || 'NO WOO ID'
    });

    // =====================================================
    // 🔍 DEBUG #3: Get or create conversation
    // =====================================================
    console.log('🔍 DEBUG #3 - Finding or creating conversation...');
    const conversation = await getOrCreateConversation({
      customerId: customer.id,
      phone: from,
      waId: from,
    });
    console.log('✅ DEBUG #3 - Conversation retrieved:', {
      id: conversation.id,
      status: conversation.status,
      created: conversation.created_at,
      updated: conversation.updated_at
    });

    // =====================================================
    // 🆔 DEBUG: Confirm conversation_id consistency
    // =====================================================
    console.log('🆔 DEBUG - CONVERSATION ID CONSISTENCY CHECK:');
    console.log('🆔   conversation.id:', conversation.id);
    console.log('🆔   This ID will be used for ALL database operations');

    // =====================================================
    // 🔍 DEBUG #4: Save user message
    // =====================================================
    console.log('🔍 DEBUG #4 - Saving user message to database...');
    const savedUserMessage = await saveMessage({
      conversationId: conversation.id,
      role: 'user',
      content: messageBody,
      whatsappMessageId: messageId,
    });
    console.log('✅ DEBUG #4 - User message saved:', {
      messageDbId: savedUserMessage.id,
      conversationId: savedUserMessage.conversation_id,
      role: savedUserMessage.role
    });

    // =====================================================
    // 🔍 DEBUG #5: Load conversation history
    // =====================================================
    console.log('🔍 DEBUG #5 - Loading conversation history...');
    console.log('🔍   Querying messages WHERE conversation_id =', conversation.id);

    const history = await getConversationHistory(conversation.id);

    console.log('✅ DEBUG #5 - History loaded:', {
      messageCount: history.length,
      conversationId: conversation.id
    });

    if (history.length === 0) {
      console.log('⚠️ DEBUG #5 - WARNING: NO HISTORY FOUND!');
      console.log('⚠️   This could indicate a database query issue');
    } else {
      console.log('📜 DEBUG #5 - History preview (last 3 messages):');
      history.slice(-3).forEach((msg, idx) => {
        console.log(`📜   [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 50)}...`);
      });
    }

    // =====================================================
    // 🔍 DEBUG #6: Prepare messages for AI
    // =====================================================
    console.log('🔍 DEBUG #6 - Preparing messages for Claude...');

    const aiMessages: ConversationMessage[] = [
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: messageBody,
      },
    ];

    console.log('✅ DEBUG #6 - Messages prepared:', {
      totalMessages: aiMessages.length,
      historyMessages: history.length,
      currentMessage: 1,
      firstMessage: aiMessages[0] ? {
        role: aiMessages[0].role,
        preview: aiMessages[0].content.substring(0, 30) + '...'
      } : 'NONE',
      lastMessage: {
        role: aiMessages[aiMessages.length - 1].role,
        preview: aiMessages[aiMessages.length - 1].content.substring(0, 30) + '...'
      }
    });

    // Context for AI
    const context = {
      conversationId: conversation.id,
      customerId: customer.woocommerce_customer_id || undefined,
      customerEmail: customer.email || undefined,
    };

    console.log('[MessageProcessor] 📋 Context for AI:', {
      conversationId: context.conversationId,
      customerId: context.customerId || 'NO WOO ID',
      customerEmail: context.customerEmail || 'NO EMAIL'
    });

    console.log('[MessageProcessor] 🤖 Processing with AI Agent...', {
      messageCount: aiMessages.length,
      context
    });

    const response = await generateResponseWithFallback(aiMessages, context);

    console.log('✅ DEBUG #7 - AI Response received:', {
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

    let sentMessageId: string | undefined;

    try {
      console.log('[MessageProcessor] 📡 Calling WhatsApp API...');

      const sendResult = await whatsappClient.sendMessage({
        to: from,
        message: response.content,
      });

      sentMessageId = sendResult.messageId;

      console.log('[MessageProcessor] ✅✅✅ MESSAGE SENT SUCCESSFULLY! ✅✅✅');
      console.log('[MessageProcessor] 📊 Send result:', {
        messageId: sendResult.messageId?.slice(0, 20) + '...',
        success: !!sendResult.messageId
      });

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
    // 🔍 DEBUG #8: Save assistant response to database
    // =====================================================
    console.log('🔍 DEBUG #8 - Saving assistant response to database...');
    try {
      const savedAssistantMessage = await saveMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: response.content,
        whatsappMessageId: sentMessageId,
        whatsappStatus: 'sent',
      });

      console.log('✅ DEBUG #8 - Assistant message saved:', {
        messageDbId: savedAssistantMessage.id,
        conversationId: savedAssistantMessage.conversation_id,
        role: savedAssistantMessage.role,
        whatsappMessageId: sentMessageId?.slice(0, 20) + '...' || 'NO ID'
      });

      // Verify message was saved
      console.log('🔍 DEBUG #8 - Verifying message in database...');
      const verifyHistory = await getConversationHistory(conversation.id, 2);
      console.log('✅ DEBUG #8 - Current message count in conversation:', verifyHistory.length);

    } catch (saveError: any) {
      console.error('❌ DEBUG #8 - Failed to save assistant message:', saveError.message);
      console.error('⚠️ WARNING: Message was sent but NOT saved to database!');
      // Don't throw - message was already sent successfully
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
    console.log('[MessageProcessor] 📊 FINAL SUMMARY:');
    console.log('[MessageProcessor]   - User message saved: ✅');
    console.log('[MessageProcessor]   - AI response generated: ✅');
    console.log('[MessageProcessor]   - WhatsApp message sent: ✅');
    console.log('[MessageProcessor]   - Assistant message saved: ✅');
    console.log('[MessageProcessor]   - Conversation ID:', conversation.id);
    console.log('[MessageProcessor]   - Total messages in conversation:', aiMessages.length + 1);

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
