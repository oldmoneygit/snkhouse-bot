import { generateResponseWithFallback } from '@snkhouse/ai-agent';
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
 */
export async function processIncomingWhatsAppMessage(
  message: Message,
  value: WebhookValue
): Promise<void> {

  console.log('[MessageProcessor] 🚀 Starting processing...', {
    from: message.from,
    type: message.type,
    messageLength: message.text?.body?.length
  });

  // Apenas processar mensagens de texto por enquanto
  if (message.type !== 'text' || !message.text) {
    console.log('[MessageProcessor] ⏭️ Ignoring non-text message:', message.type);
    return;
  }

  try {
    // 1. Deduplicação - verificar se já processamos esta mensagem
    console.log('[MessageProcessor] 🔍 Checking if already processed:', message.id);

    const alreadyProcessed = await isMessageProcessed(message.id);
    if (alreadyProcessed) {
      console.log('[MessageProcessor] ⏭️ Message already processed:', message.id);
      return;
    }

    console.log('[MessageProcessor] ✅ Message is new, proceeding...');

    // 2. Extrair dados do contato
    const contact = value.contacts?.[0];
    const whatsappName = contact?.profile?.name || 'WhatsApp User';
    const phone = message.from;
    const waId = contact?.wa_id || phone;

    console.log('[MessageProcessor] 📋 Extracted data:', {
      phone: phone.slice(0, 4) + '***',
      name: whatsappName,
      waId: waId?.slice(0, 4) + '***',
      messageBody: message.text.body
    });

    // 3. Buscar ou criar customer
    console.log('[MessageProcessor] 👤 Finding/creating customer for:', phone.slice(0, 4) + '***');

    const customer = await findOrCreateCustomer({
      phone,
      whatsappName,
      waId,
    });

    console.log('[MessageProcessor] ✅ Customer:', {
      id: customer.id,
      phone: customer.phone?.slice(0, 4) + '***',
      hasEmail: !!customer.email,
      hasWooCommerceId: !!customer.woocommerce_customer_id
    });

    // 4. Buscar ou criar conversation
    console.log('[MessageProcessor] 💬 Getting/creating conversation...');

    const conversation = await getOrCreateConversation({
      customerId: customer.id,
      phone,
      waId,
    });

    console.log('[MessageProcessor] ✅ Conversation:', {
      id: conversation.id,
      status: conversation.status
    });

    // 5. Salvar mensagem do usuário
    console.log('[MessageProcessor] 💾 Saving user message...');

    await saveMessage({
      conversationId: conversation.id,
      role: 'user',
      content: message.text.body,
      whatsappMessageId: message.id,
    });

    console.log('[MessageProcessor] ✅ User message saved');

    // 6. Marcar mensagem como lida
    console.log('[MessageProcessor] 👁️ Marking as read...');

    await whatsappClient.markAsRead({ messageId: message.id });

    console.log('[MessageProcessor] ✅ Marked as read');

    // 7. Carregar histórico da conversa
    console.log('[MessageProcessor] 📚 Loading conversation history...');

    const history = await getConversationHistory(conversation.id);

    console.log('[MessageProcessor] ✅ History loaded:', {
      messagesCount: history.length
    });

    // 8. Preparar mensagens para AI Agent (formato OpenAI)
    console.log('[MessageProcessor] 🔄 Preparing AI messages...');

    const aiMessages = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    console.log('[MessageProcessor] ✅ AI messages prepared:', {
      count: aiMessages.length
    });

    // 9. Preparar contexto para AI Agent
    const context = {
      conversationId: conversation.id,
      customerId: customer.woocommerce_customer_id || undefined,
      customerEmail: customer.email || undefined,
    };

    // 10. Processar com AI Agent (REUTILIZAR código do widget!)
    console.log('[MessageProcessor] 🤖 Calling AI Agent...', {
      conversationId: conversation.id,
      hasCustomerId: !!customer.woocommerce_customer_id,
      hasEmail: !!customer.email,
      historyCount: aiMessages.length
    });

    const response = await generateResponseWithFallback(aiMessages, context);

    console.log('[MessageProcessor] ✅ AI response received:', {
      length: response.content.length,
      model: response.model,
      preview: response.content.substring(0, 100) + '...'
    });

    // 11. Enviar resposta via WhatsApp
    console.log('[MessageProcessor] 📤 Sending WhatsApp message...');

    const { messageId } = await whatsappClient.sendMessage({
      to: phone,
      message: response.content,
    });

    console.log('[MessageProcessor] ✅ Message sent successfully:', {
      messageId: messageId?.slice(0, 20) + '...'
    });

    // 12. Salvar resposta do bot
    console.log('[MessageProcessor] 💾 Saving AI response...');

    await saveMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: response.content,
      whatsappMessageId: messageId,
      whatsappStatus: 'sent',
    });

    console.log('[MessageProcessor] ✅ AI response saved');

    // 13. Track analytics (temporariamente desabilitado - trackEvent não disponível)
    // TODO: Implementar tracking quando analytics estiver disponível
    // await trackEvent({
    //   event_type: 'message_sent',
    //   conversation_id: conversation.id,
    //   metadata: {
    //     channel: 'whatsapp',
    //     message_length: response.content.length,
    //   },
    // });

    console.log('[MessageProcessor] 🎉 Processing completed successfully!');

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
