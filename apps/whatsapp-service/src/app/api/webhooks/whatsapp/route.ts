import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppClient } from '@snkhouse/integrations';
import type { WebhookPayload } from '@/lib/types';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

// Inicializar WhatsApp client
const whatsappClient = new WhatsAppClient({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
});

/**
 * GET: Verificação do webhook (Meta valida a URL)
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[Webhook] GET verification request:', { mode, token: token ? '***' : 'none' });

  // Verificar se é um pedido de verificação válido
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] ✅ Verification successful');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('[Webhook] ❌ Verification failed');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * POST: Recebimento de mensagens e eventos
 * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse do body
    const body: WebhookPayload = await request.json();

    // 2. Log completo do webhook recebido
    console.log('[Webhook] 📨 Received webhook:', JSON.stringify(body, null, 2));

    // 3. Verificar formato básico
    if (body.object !== 'whatsapp_business_account') {
      console.warn('[Webhook] ⚠️ Unknown object type:', body.object);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 4. Processar assincronamente
    const responsePromise = processWebhookAsync(body);

    // Não esperar o processamento terminar
    responsePromise.catch((error) => {
      console.error('[Webhook] ❌ Async processing error:', error);
    });

    // 5. Retornar 200 OK IMEDIATAMENTE
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook] ❌ Error processing webhook:', error);

    // Mesmo em erro, retornar 200 para não gerar retry do Meta
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

/**
 * Processa o webhook de forma assíncrona (não bloqueia resposta)
 */
async function processWebhookAsync(payload: WebhookPayload): Promise<void> {
  console.log('[Webhook] ✅ Processing webhook async...');

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // Log do tipo de evento
      if (value.messages && value.messages.length > 0) {
        console.log('[Webhook] 📥 Type: MESSAGE');
      } else if (value.statuses && value.statuses.length > 0) {
        console.log('[Webhook] 📊 Type: STATUS UPDATE');
      }

      // Processar mensagens recebidas
      if (value.messages && value.messages.length > 0) {
        for (const message of value.messages) {
          await processIncomingMessage(message, value);
        }
      }

      // Processar status updates (enviado, entregue, lido)
      if (value.statuses && value.statuses.length > 0) {
        for (const status of value.statuses) {
          await processStatusUpdate(status);
        }
      }
    }
  }
}

/**
 * Processa uma mensagem recebida
 */
async function processIncomingMessage(
  message: any,
  value: any
): Promise<void> {
  console.log('[Webhook] 💬 Message received:', {
    from: message.from,
    type: message.type,
    text: message.text?.body || message.type,
  });

  // Apenas processar mensagens de texto
  if (message.type !== 'text' || !message.text?.body) {
    console.log('[Webhook] ⏭️ Ignoring non-text message');
    return;
  }

  const from = message.from;
  const userMessage = message.text.body;

  try {
    // Resposta automática simples (sem IA por enquanto)
    const autoResponse = `¡Hola! Soy el asistente de SNKHOUSE 🎯

Recibí tu mensaje: "${userMessage}"

¿En qué puedo ayudarte?
• Ver productos
• Consultar stock
• Estado de pedido
• Información de envío`;

    console.log('[Webhook] 🤖 Sending auto-response to:', from.slice(0, 4) + '***');

    // Enviar resposta
    await whatsappClient.sendMessage({
      to: from,
      message: autoResponse,
    });

    console.log('[Webhook] ✅ Response sent successfully');

  } catch (error: any) {
    console.error('[Webhook] ❌ Error sending response:', error);
  }
}

/**
 * Processa status updates de mensagens enviadas
 */
async function processStatusUpdate(status: any): Promise<void> {
  console.log('[Webhook] 📊 Status update:', {
    messageId: status.id,
    status: status.status,
    timestamp: status.timestamp,
  });

  // TODO: Atualizar status no banco de dados
}
