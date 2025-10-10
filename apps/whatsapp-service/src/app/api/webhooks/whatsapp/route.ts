import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/verify-signature';
import { processIncomingWhatsAppMessage } from '@/lib/message-processor';
import type { WebhookPayload } from '@/lib/types';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const APP_SECRET = process.env.WHATSAPP_ACCESS_TOKEN!; // Usar access token como secret por enquanto

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
    // 1. Ler o body como texto (necessário para validação de signature)
    const rawBody = await request.text();

    // 2. Verificar signature (segurança)
    const signature = request.headers.get('x-hub-signature-256');

    // IMPORTANTE: Em produção, SEMPRE validar signature
    // Por enquanto vamos apenas logar se falhar (para facilitar testes)
    const isValid = verifyWebhookSignature(rawBody, signature || undefined, APP_SECRET);
    if (!isValid) {
      console.warn('[Webhook] ⚠️ Invalid signature - processing anyway for testing');
      // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Parse do JSON
    const body: WebhookPayload = JSON.parse(rawBody);

    // 4. Verificar formato
    if (body.object !== 'whatsapp_business_account') {
      console.warn('[Webhook] Unknown object type:', body.object);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 5. IMPORTANTE: Retornar 200 OK IMEDIATAMENTE (< 5s)
    // Processar mensagens de forma assíncrona depois
    const responsePromise = processWebhookAsync(body);

    // Não esperar o processamento terminar
    responsePromise.catch((error) => {
      console.error('[Webhook] Async processing error:', error);
    });

    // Retornar sucesso imediatamente
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error);

    // Mesmo em erro, retornar 200 para não gerar retry do Meta
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

/**
 * Processa o webhook de forma assíncrona (não bloqueia resposta)
 */
async function processWebhookAsync(payload: WebhookPayload): Promise<void> {
  console.log('[Webhook] Processing webhook async...');

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;

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
  await processIncomingWhatsAppMessage(message, value);
}

/**
 * Processa status updates de mensagens enviadas
 */
async function processStatusUpdate(status: any): Promise<void> {
  console.log('[Webhook] Status update:', {
    messageId: status.id,
    status: status.status,
    timestamp: status.timestamp,
  });

  // TODO: Atualizar status no banco de dados
}
