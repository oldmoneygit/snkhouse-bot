import { processMessage } from '@snkhouse/ai-agent';
import { EvolutionAPIClient } from '@snkhouse/integrations';
import {
  findOrCreateCustomer,
} from './customer-helper'; // REUTILIZAR EXISTENTE
import {
  getOrCreateConversation,
  getConversationHistory,
  saveMessage,
  isMessageProcessed,
} from './conversation-helper'; // REUTILIZAR EXISTENTE

// Inicializar Evolution client
const evolutionClient = new EvolutionAPIClient({
  baseUrl: process.env.EVOLUTION_API_URL!,
  apiKey: process.env.EVOLUTION_API_KEY!,
  instanceName: process.env.EVOLUTION_INSTANCE_NAME!,
});

/**
 * Processa mensagem do Evolution API
 * REUTILIZA TODA a lógica de customer/conversation/AI Agent!
 */
export async function processEvolutionMessage(message: any): Promise<void> {
  // Extrair dados da mensagem Evolution/Baileys
  const messageText = message.message?.conversation ||
                      message.message?.extendedTextMessage?.text;

  if (!messageText) {
    console.log('[Evolution] Ignoring non-text message');
    return;
  }

  const messageId = message.key.id;
  const remoteJid = message.key.remoteJid; // Ex: 5592916206740@s.whatsapp.net
  const phone = remoteJid.split('@')[0]; // Ex: 5592916206740
  const pushName = message.pushName || 'WhatsApp User';

  try {
    // 1. Deduplicação
    const alreadyProcessed = await isMessageProcessed(messageId);
    if (alreadyProcessed) {
      console.log('[Evolution] Already processed:', messageId);
      return;
    }

    console.log('[Evolution] Processing from:', {
      phone: phone.slice(0, 4) + '***',
      name: pushName,
    });

    // 2. Customer (REUTILIZA helper existente!)
    const customer = await findOrCreateCustomer({
      phone,
      whatsappName: pushName,
      waId: phone,
    });

    // 3. Conversation (REUTILIZA helper existente!)
    const conversation = await getOrCreateConversation({
      customerId: customer.id,
      phone,
      waId: phone,
    });

    // 4. Salvar mensagem usuário
    await saveMessage({
      conversationId: conversation.id,
      role: 'user',
      content: messageText,
      whatsappMessageId: messageId,
    });

    // 5. Marcar como lido
    await evolutionClient.markAsRead(message.key);

    // 6. Histórico
    const history = await getConversationHistory(conversation.id);

    // 7. Contexto para AI
    const context = {
      conversation_id: conversation.id,
      customer_id: customer.id,
      customer_email: customer.email || undefined,
      woocommerce_customer_id: customer.woocommerce_customer_id || undefined,
      channel: 'whatsapp' as const,
      phone,
    };

    // 8. AI Agent (REUTILIZA TUDO!)
    console.log('[Evolution] → AI Agent...');

    const response = await processMessage({
      message: messageText,
      conversationHistory: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      context,
    });

    console.log('[Evolution] ← AI response');

    // 9. Enviar via Evolution
    await evolutionClient.sendTextMessage({
      number: phone,
      text: response.message,
    });

    // 10. Salvar resposta bot
    await saveMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: response.message,
      whatsappStatus: 'sent',
    });

    console.log('[Evolution] ✅ Success');

  } catch (error: any) {
    console.error('[Evolution] Error:', error);

    // Mensagem de erro
    try {
      await evolutionClient.sendTextMessage({
        number: phone,
        text: 'Disculpá, tuve un problema técnico. Intentá de nuevo.',
      });
    } catch (sendError) {
      console.error('[Evolution] Failed error message:', sendError);
    }
  }
}
