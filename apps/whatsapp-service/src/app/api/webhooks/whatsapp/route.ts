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
  const startTime = Date.now();

  console.log('[Webhook] 💬 Message received START', {
    from: message.from?.substring(0, 8) + '***',
    type: message.type,
    messageId: message.id,
    timestamp: new Date().toISOString()
  });

  // Apenas processar mensagens de texto
  if (message.type !== 'text' || !message.text?.body) {
    console.log('[Webhook] ⏭️ Ignoring non-text message:', message.type);
    return;
  }

  const from = message.from;
  const messageText = message.text.body;
  const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';

  console.log('[Webhook] 📝 Message details:', {
    textLength: messageText.length,
    contactName,
    preview: messageText.substring(0, 50) + '...'
  });

  try {
    // Step 1: Get or create customer with detailed error handling
    console.log('[Webhook] 👤 Step 1: Getting/creating customer...');
    let customer;

    try {
      const customerStart = Date.now();

      const { data: existingCustomer, error: customerQueryError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('phone', from)
        .maybeSingle();

      console.log('[Webhook] 📊 Customer query result:', {
        duration: Date.now() - customerStart,
        found: !!existingCustomer,
        error: customerQueryError?.message
      });

      if (customerQueryError) {
        console.error('[Webhook] ❌ Customer query error:', {
          message: customerQueryError.message,
          code: customerQueryError.code,
          details: customerQueryError.details
        });
        throw new Error(`Customer query failed: ${customerQueryError.message}`);
      }

      if (existingCustomer) {
        customer = existingCustomer;
        console.log('[Webhook] ✅ Existing customer found:', customer.id);

        // Update last interaction
        await supabaseAdmin
          .from('customers')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', customer.id);
      } else {
        console.log('[Webhook] 🆕 Creating new customer...');

        const { data: newCustomer, error: createError } = await supabaseAdmin
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

        if (createError) {
          console.error('[Webhook] ❌ Customer creation error:', createError);
          throw new Error(`Customer creation failed: ${createError.message}`);
        }

        customer = newCustomer;
        console.log('[Webhook] ✅ New customer created:', customer.id);
      }
    } catch (customerError: any) {
      console.error('[Webhook] ❌ CRITICAL: Customer handling failed:', {
        error: customerError.message,
        stack: customerError.stack?.substring(0, 500),
        duration: Date.now() - startTime
      });

      // Send error message to user
      await sendErrorMessage(from, '⚠️ Hubo un problema temporal con nuestro sistema. Por favor, intentá de nuevo en unos segundos.');
      return; // Exit early
    }

    // Step 2: Get or create conversation
    console.log('[Webhook] 💬 Step 2: Getting/creating conversation...');
    let conversation;

    try {
      const convStart = Date.now();

      const { data: activeConv, error: convQueryError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('channel', 'whatsapp')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[Webhook] 📊 Conversation query result:', {
        duration: Date.now() - convStart,
        found: !!activeConv,
        error: convQueryError?.message
      });

      if (convQueryError) {
        console.error('[Webhook] ❌ Conversation query error:', convQueryError);
        throw new Error(`Conversation query failed: ${convQueryError.message}`);
      }

      if (activeConv) {
        conversation = activeConv;
        console.log('[Webhook] ✅ Active conversation found:', conversation.id);

        // Update timestamp
        await supabaseAdmin
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversation.id);
      } else {
        console.log('[Webhook] 🆕 Creating new conversation...');

        const { data: newConv, error: createError } = await supabaseAdmin
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

        if (createError) {
          console.error('[Webhook] ❌ Conversation creation error:', createError);
          throw new Error(`Conversation creation failed: ${createError.message}`);
        }

        conversation = newConv;
        console.log('[Webhook] ✅ New conversation created:', conversation.id);
      }
    } catch (conversationError: any) {
      console.error('[Webhook] ❌ CRITICAL: Conversation handling failed:', {
        error: conversationError.message,
        stack: conversationError.stack?.substring(0, 500)
      });

      await sendErrorMessage(from, '⚠️ Hubo un problema temporal. Por favor, intentá nuevamente.');
      return;
    }

    // Step 3: Process with Agent Builder
    console.log('[Webhook] 🤖 Step 3: Processing with Agent Builder...');
    let response: string;

    try {
      const agentStart = Date.now();

      response = await processMessageWithAgentBuilder({
        message: messageText,
        conversationId: conversation.id,
        customerId: customer.id,
        customerPhone: from
      });

      console.log('[Webhook] ✅ Agent Builder response ready:', {
        duration: Date.now() - agentStart,
        responseLength: response.length
      });
    } catch (agentError: any) {
      console.error('[Webhook] ❌ Agent Builder failed:', {
        error: agentError.message,
        stack: agentError.stack?.substring(0, 500)
      });

      response = '⚠️ Disculpá, tuve un problema procesando tu mensaje. ¿Podés intentar de nuevo?';
    }

    // Step 4: Send WhatsApp response
    console.log('[Webhook] 📤 Step 4: Sending WhatsApp response...');

    try {
      const sendStart = Date.now();

      const whatsappClient = new WhatsAppClient({
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN!
      });

      await whatsappClient.sendMessage({
        to: from,
        message: response
      });

      console.log('[Webhook] ✅ Response sent successfully:', {
        duration: Date.now() - sendStart
      });
    } catch (sendError: any) {
      console.error('[Webhook] ❌ Failed to send WhatsApp response:', {
        error: sendError.message
      });
      // Don't throw - message was processed
    }

    console.log('[Webhook] ✅ Message processing COMPLETE:', {
      totalDuration: Date.now() - startTime,
      messageId: message.id
    });

  } catch (error: any) {
    console.error('[Webhook] ❌ CRITICAL: Message processing failed:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      duration: Date.now() - startTime,
      from: from?.substring(0, 8) + '***'
    });

    // Always try to send error message
    await sendErrorMessage(from, '⚠️ Hubo un error inesperado. Nuestro equipo fue notificado.');
  }
}

/**
 * Helper to send error messages with error handling
 */
async function sendErrorMessage(to: string, message: string): Promise<void> {
  try {
    const whatsappClient = new WhatsAppClient({
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!
    });

    await whatsappClient.sendMessage({ to, message });
    console.log('[Webhook] ✅ Error message sent to user');
  } catch (sendError: any) {
    console.error('[Webhook] ❌ Could not send error message:', sendError.message);
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
