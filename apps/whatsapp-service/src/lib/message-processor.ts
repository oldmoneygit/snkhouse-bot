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

  // Apenas processar mensagens de texto por enquanto
  if (message.type !== 'text' || !message.text) {
    console.log('[MessageProcessor] Ignoring non-text message:', message.type);
    return;
  }

  try {
    // 1. Deduplicação - verificar se já processamos esta mensagem
    const alreadyProcessed = await isMessageProcessed(message.id);
    if (alreadyProcessed) {
      console.log('[MessageProcessor] Message already processed:', message.id);
      return;
    }

    // 2. Extrair dados do contato
    const contact = value.contacts?.[0];
    const whatsappName = contact?.profile?.name || 'WhatsApp User';
    const phone = message.from;
    const waId = contact?.wa_id || phone;

    console.log('[MessageProcessor] Processing message from:', {
      phone: phone.slice(0, 4) + '***',
      name: whatsappName,
    });

    // 3. Buscar ou criar customer
    const customer = await findOrCreateCustomer({
      phone,
      whatsappName,
      waId,
    });

    // 4. Buscar ou criar conversation
    const conversation = await getOrCreateConversation({
      customerId: customer.id,
      phone,
      waId,
    });

    // 5. Salvar mensagem do usuário
    await saveMessage({
      conversationId: conversation.id,
      role: 'user',
      content: message.text.body,
      whatsappMessageId: message.id,
    });

    // 6. Marcar mensagem como lida
    await whatsappClient.markAsRead({ messageId: message.id });

    // 7. Carregar histórico da conversa
    const history = await getConversationHistory(conversation.id);

    // 8. Preparar mensagens para AI Agent (formato OpenAI)
    const aiMessages = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // 9. Preparar contexto para AI Agent
    const context = {
      conversationId: conversation.id,
      customerId: customer.woocommerce_customer_id || undefined,
      customerEmail: customer.email || undefined,
    };

    // 10. Processar com AI Agent (REUTILIZAR código do widget!)
    console.log('[MessageProcessor] Sending to AI Agent...', {
      conversation_id: conversation.id,
      has_customer_id: !!customer.woocommerce_customer_id,
      has_email: !!customer.email,
    });

    const response = await generateResponseWithFallback(aiMessages, context);

    console.log('[MessageProcessor] AI response received:', {
      length: response.content.length,
      model: response.model,
    });

    // 11. Enviar resposta via WhatsApp
    const { messageId } = await whatsappClient.sendMessage({
      to: phone,
      message: response.content,
    });

    // 12. Salvar resposta do bot
    await saveMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: response.content,
      whatsappMessageId: messageId,
      whatsappStatus: 'sent',
    });

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

    console.log('[MessageProcessor] ✅ Message processed successfully');

  } catch (error: any) {
    console.error('[MessageProcessor] Error processing message:', error);

    // Em caso de erro, tentar enviar mensagem genérica
    try {
      await whatsappClient.sendMessage({
        to: message.from,
        message: 'Disculpá, tuve un problema técnico. Intentá de nuevo en unos minutos.',
      });
    } catch (sendError) {
      console.error('[MessageProcessor] Failed to send error message:', sendError);
    }
  }
}
