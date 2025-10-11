import { NextRequest, NextResponse } from 'next/server';
// UPDATED: Using Agent Builder processor instead of old message-processor
import { processMessageWithAgentBuilder } from '@/lib/agent-builder-processor';
// import { processIncomingWhatsAppMessage } from '@/lib/message-processor'; // OLD - Keep for rollback
import type { WebhookPayload } from '@/lib/types';
import { WhatsAppClient } from '@snkhouse/integrations';
import { supabaseAdmin } from '@snkhouse/database';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

// Cache de mensagens processadas (evita loop infinito)
const processedMessages = new Set<string>();

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
  console.log('🚨🚨🚨 [WEBHOOK] POST HANDLER CALLED! 🚨🚨🚨', new Date().toISOString());

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

    // 4. Processar e aguardar (Vercel Hobby plan requires this)
    console.log('[Webhook] 🔄 Starting synchronous processing...');

    try {
      await processWebhookAsync(body);
      console.log('[Webhook] ✅ Processing completed successfully');
    } catch (error) {
      console.error('[Webhook] ❌ Processing error:', error);
    }

    // 5. Retornar 200 OK
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
  console.log('🚨🚨🚨 [WEBHOOK] processWebhookAsync CALLED! 🚨🚨🚨');
  console.log('[Webhook] ✅ Processing webhook async...');
  console.log('[Webhook] 📊 Payload entries:', payload.entry.length);

  for (const entry of payload.entry) {
    console.log('[Webhook] 🔄 Processing entry, changes:', entry.changes.length);

    for (const change of entry.changes) {
      const value = change.value;

      // Log do tipo de evento
      if (value.messages && value.messages.length > 0) {
        console.log('[Webhook] 📥 Type: MESSAGE, count:', value.messages.length);
      } else if (value.statuses && value.statuses.length > 0) {
        console.log('[Webhook] 📊 Type: STATUS UPDATE, count:', value.statuses.length);
      }

      // Processar mensagens recebidas
      if (value.messages && value.messages.length > 0) {
        console.log('[Webhook] 🔥 About to process messages...');
        for (const message of value.messages) {
          console.log('[Webhook] ➡️ Calling processIncomingMessage for:', message.id);
          await processIncomingMessage(message, value);
          console.log('[Webhook] ✅ Finished processIncomingMessage for:', message.id);
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
  // ⚠️ CRITICAL LOG - ABSOLUTE FIRST LINE
  console.log('🚨🚨🚨 [WEBHOOK] processIncomingMessage FUNCTION CALLED! 🚨🚨🚨');

  const startTime = Date.now();

  console.log('[Webhook] 💬 Message received START', {
    from: message.from?.substring(0, 8) + '***',
    type: message.type,
    messageId: message.id,
    timestamp: new Date().toISOString(),
    fullMessage: JSON.stringify(message).substring(0, 200)
  });

  // PROTEÇÃO 1: Ignorar mensagens do próprio bot (sent by us)
  // WhatsApp não envia o campo "from" para mensagens que nós enviamos
  // Mas podemos verificar se há um recipient_id no status ou se é uma mensagem "outgoing"
  if (!message.from) {
    console.log('[Webhook] ⏭️ Ignoring outgoing message (no from field)');
    return;
  }

  // PROTEÇÃO 2: Verificar se já processamos esta mensagem (deduplicação)
  const messageId = message.id;
  const cacheKey = `processed_msg_${messageId}`;

  // Usar um Set em memória para cache simples (você pode usar Redis depois)
  if (processedMessages.has(messageId)) {
    console.log('[Webhook] ⏭️ Message already processed, skipping:', messageId);
    return;
  }

  // Marcar como processada (expira em 1 hora)
  processedMessages.add(messageId);
  setTimeout(() => processedMessages.delete(messageId), 3600000);

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
    console.log('[Webhook] 🔌 Checking supabaseAdmin client:', {
      exists: !!supabaseAdmin,
      type: typeof supabaseAdmin,
      hasFrom: !!(supabaseAdmin as any)?.from
    });

    let customer;

    try {
      const customerStart = Date.now();

      console.log('[Webhook] 🔍 About to query Supabase for customer:', from.substring(0, 8) + '***');
      console.log('[Webhook] 📊 Supabase URL check:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('[Webhook] 🔑 Supabase Key check:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

      if (!supabaseAdmin) {
        throw new Error('❌ supabaseAdmin is not initialized!');
      }

      // Query with timeout - CRITICAL: Execute query immediately
      console.log('[Webhook] 🏗️ Building and executing query...');

      const executeQuery = async () => {
        console.log('[Webhook] 🚀 Query execution started...');
        try {
          const result = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('phone', from)
            .maybeSingle();
          console.log('[Webhook] ✅ Query execution completed!');
          return result;
        } catch (queryError: any) {
          console.error('[Webhook] 💥 Query threw an exception:', {
            message: queryError.message,
            name: queryError.name,
            stack: queryError.stack?.substring(0, 300)
          });
          throw queryError;
        }
      };

      const timeoutPromise = new Promise((_, reject) => {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 1;
          console.log(`[Webhook] ⏳ Waiting... ${elapsed}s / 5s`);
          if (elapsed >= 5) {
            clearInterval(interval);
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(interval);
          console.log('[Webhook] ⏰ TIMEOUT TRIGGERED after 5 seconds!');
          reject(new Error('Customer query timeout after 5 seconds'));
        }, 5000);
      });

      console.log('[Webhook] ⏱️ Starting Promise.race with 5s timeout...');

      const { data: existingCustomer, error: customerQueryError } = await Promise.race([
        executeQuery(),
        timeoutPromise
      ]) as any;

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

        // Create customer with only existing columns (no metadata)
        const { data: newCustomer, error: createError } = await supabaseAdmin
          .from('customers')
          .insert({
            phone: from
            // Only phone is required, other fields are optional or don't exist
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

      console.log('[Webhook] 🔍 About to query conversation for customer:', customer.id);

      // Query with timeout - Execute immediately
      const executeConvQuery = async () => {
        console.log('[Webhook] 🚀 Conversation query execution started...');
        try {
          const result = await supabaseAdmin
            .from('conversations')
            .select('*')
            .eq('customer_id', customer.id)
            .eq('channel', 'whatsapp')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          console.log('[Webhook] ✅ Conversation query execution completed!');
          return result;
        } catch (queryError: any) {
          console.error('[Webhook] 💥 Conversation query threw an exception:', {
            message: queryError.message,
            name: queryError.name,
            stack: queryError.stack?.substring(0, 300)
          });
          throw queryError;
        }
      };

      const timeoutPromise = new Promise((_, reject) => {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 1;
          console.log(`[Webhook] ⏳ Conversation waiting... ${elapsed}s / 5s`);
          if (elapsed >= 5) {
            clearInterval(interval);
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(interval);
          console.log('[Webhook] ⏰ Conversation TIMEOUT TRIGGERED after 5 seconds!');
          reject(new Error('Conversation query timeout after 5 seconds'));
        }, 5000);
      });

      console.log('[Webhook] ⏱️ Starting conversation query with 5s timeout...');

      const { data: activeConv, error: convQueryError } = await Promise.race([
        executeConvQuery(),
        timeoutPromise
      ]) as any;

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

        // Create conversation with only existing columns
        const { data: newConv, error: createError } = await supabaseAdmin
          .from('conversations')
          .insert({
            customer_id: customer.id,
            channel: 'whatsapp',
            status: 'active'
            // Removed metadata and language - columns may not exist
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
