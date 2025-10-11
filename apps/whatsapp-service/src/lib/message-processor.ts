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

    // TEMPORÁRIO: Processar SEM banco de dados
    console.log('[MessageProcessor] ⚠️ SIMPLIFIED MODE: Skipping database operations');
    console.log('[MessageProcessor] 🤖 Calling AI Agent directly...');

    // Preparar mensagem para AI
    const aiMessages: ConversationMessage[] = [
      {
        role: 'user',
        content: messageBody,
      }
    ];

    // Contexto mínimo
    const context = {
      conversationId: `temp-conv-${Date.now()}`,
      customerId: undefined,
      customerEmail: undefined,
    };

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

    // Marcar como lida (tentar, mas não bloquear se falhar)
    try {
      console.log('[MessageProcessor] 👁️ Marking as read...');
      await whatsappClient.markAsRead({ messageId: message.id });
      console.log('[MessageProcessor] ✅ Marked as read');
    } catch (markError: any) {
      console.warn('[MessageProcessor] ⚠️ Failed to mark as read:', markError.message);
    }

    // Enviar resposta
    console.log('[MessageProcessor] 📤 Sending WhatsApp message...');

    const { messageId } = await whatsappClient.sendMessage({
      to: from,
      message: response.content,
    });

    console.log('[MessageProcessor] ✅ Message sent successfully!', {
      messageId: messageId?.slice(0, 20) + '...'
    });

    console.log('[MessageProcessor] 🎉 Processing completed (simplified mode)');

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
