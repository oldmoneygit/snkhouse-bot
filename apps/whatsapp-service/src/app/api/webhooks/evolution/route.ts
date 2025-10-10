import { NextRequest, NextResponse } from 'next/server';
import { processEvolutionMessage } from '@/lib/evolution-processor';

/**
 * POST: Webhook Evolution API
 * Recebe eventos do Evolution API (Baileys)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Evolution Webhook] Event:', body.event);

    // Retornar 200 OK imediatamente
    const responsePromise = processWebhookAsync(body);

    responsePromise.catch((error) => {
      console.error('[Evolution Webhook] Async error:', error);
    });

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[Evolution Webhook] Error:', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

async function processWebhookAsync(payload: any): Promise<void> {
  // Processar apenas mensagens recebidas
  if (payload.event !== 'messages.upsert') {
    console.log('[Evolution Webhook] Ignoring event:', payload.event);
    return;
  }

  const message = payload.data;

  // Ignorar mensagens próprias
  if (message.key?.fromMe) {
    console.log('[Evolution Webhook] Ignoring own message');
    return;
  }

  // Processar mensagem
  await processEvolutionMessage(message);
}
