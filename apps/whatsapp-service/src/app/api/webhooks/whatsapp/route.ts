import { NextRequest, NextResponse } from 'next/server';
// UPDATED: Using Agent Builder processor instead of old message-processor
import { processMessageWithAgentBuilder } from '@/lib/agent-builder-processor';
// import { processIncomingWhatsAppMessage } from '@/lib/message-processor'; // OLD - Keep for rollback
import type { WebhookPayload } from '@/lib/types';
import { WhatsAppClient } from '@snkhouse/integrations';
import { supabaseAdmin } from '@snkhouse/database';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

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
 * Processa uma mensagem recebida com Agent Builder
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
  const messageText = message.text.body;
  const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';

  try {
    console.log('[Webhook] 👤 Getting/creating customer...');

    // Get or create customer
    let customer;
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', from)
      .single();

    if (existingCustomer) {
      customer = existingCustomer;
      // Update last interaction
      await supabaseAdmin
        .from('customers')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', customer.id);
    } else {
      // Create new customer
      const { data: newCustomer } = await supabaseAdmin
        .from('customers')
        .insert({
          phone: from,
          name: contactName,
          source: 'whatsapp',
          metadata: {
            whatsapp_name: contactName,
            first_message_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      customer = newCustomer;
    }

    console.log('[Webhook] 💬 Getting/creating conversation...');

    // Get or create conversation
    let conversation;
    const { data: activeConv } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('channel', 'whatsapp')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (activeConv) {
      conversation = activeConv;
      // Update timestamp
      await supabaseAdmin
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
    } else {
      // Create new conversation
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          customer_id: customer.id,
          channel: 'whatsapp',
          status: 'active',
          language: 'es',
          metadata: {
            phone_number_id: value.metadata?.phone_number_id,
            first_message_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      conversation = newConv;
    }

    console.log('[Webhook] 🤖 Processing with Agent Builder...');

    // Process message with Agent Builder
    const response = await processMessageWithAgentBuilder({
      message: messageText,
      conversationId: conversation.id,
      customerId: customer.id,
      customerPhone: from
    });

    console.log('[Webhook] 📤 Sending WhatsApp response...');

    // Send response
    const whatsappClient = new WhatsAppClient({
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!
    });

    await whatsappClient.sendMessage({
      to: from,
      message: response
    });

    console.log('[Webhook] ✅ Message processed and response sent successfully');

  } catch (error: any) {
    console.error('[Webhook] ❌ Error processing message:', error);

    // Try to send error message to user
    try {
      const whatsappClient = new WhatsAppClient({
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN!
      });

      await whatsappClient.sendMessage({
        to: from,
        message: '⚠️ Hubo un error temporal. Por favor, intentá de nuevo en unos segundos.'
      });
    } catch (sendError) {
      console.error('[Webhook] ❌ Could not send error message:', sendError);
    }
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
