import { NextRequest, NextResponse } from 'next/server';
import { generateResponseWithFallback } from '@snkhouse/ai-agent';
import { supabaseAdmin } from '@snkhouse/database';
import { trackAIRequest, trackAIResponse } from '@snkhouse/analytics';
import { findCustomerByEmail } from '@snkhouse/integrations';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.local') });

const WIDGET_CHANNEL = 'widget';
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

interface IncomingMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawMessages: IncomingMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const lastProvided = rawMessages.length > 0 ? rawMessages[rawMessages.length - 1] : null;
    const fallbackMessage = typeof body.message === 'string' ? body.message.trim() : '';
    const lastUserMessage = (lastProvided?.content ?? fallbackMessage).trim();

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const originalEmail: string | null =
      typeof body.customerEmail === 'string' && body.customerEmail.trim().length > 0
        ? body.customerEmail.trim().toLowerCase()
        : null;

    if (!originalEmail || !originalEmail.includes('@')) {
      return NextResponse.json({ error: 'Email del cliente requerido' }, { status: 400 });
    }

    const providedConversationId: string | null =
      typeof body.conversationId === 'string' && body.conversationId.trim().length > 0
        ? body.conversationId
        : null;

    // Detectar se usuário está fornecendo um email diferente na mensagem
    const emailMatch = lastUserMessage.match(EMAIL_REGEX);
    let effectiveEmail = originalEmail;
    let emailWasUpdated = false;

    if (emailMatch) {
      const candidateEmail = emailMatch[0].toLowerCase();
      if (candidateEmail !== originalEmail) {
        effectiveEmail = candidateEmail;
        emailWasUpdated = true;
        console.log('🔄 [Widget API] Email atualizado dinamicamente na conversa:', {
          original: `${originalEmail.split('@')[0]}***@${originalEmail.split('@')[1]}`,
          novo: `${candidateEmail.split('@')[0]}***@${candidateEmail.split('@')[1]}`,
        });
      }
    }

    console.log('📧 [Widget API] Email ativo para processamento:', `${effectiveEmail.split('@')[0]}***@${effectiveEmail.split('@')[1]}`);

    // 1) Buscar ou criar customer
    let customerRecord = null;
    const { data: existingCustomer, error: fetchCustomerError } = await supabaseAdmin
      .from('customers')
      .select('id, email, woocommerce_id')
      .eq('email', effectiveEmail)
      .maybeSingle();

    if (fetchCustomerError && fetchCustomerError.code !== 'PGRST116') {
      throw fetchCustomerError;
    }

    if (existingCustomer) {
      customerRecord = existingCustomer;
    } else {
      const { data: newCustomer, error: createCustomerError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: effectiveEmail,
          name: effectiveEmail.split('@')[0],
        })
        .select('id, email, woocommerce_id')
        .single();

      if (createCustomerError || !newCustomer) {
        throw createCustomerError || new Error('No fue posible crear el cliente');
      }

      customerRecord = newCustomer;
      console.log('? [Widget API] Cliente criado no Supabase:', customerRecord.id);
    }

    // 2) Mapear customer_id do WooCommerce
    // Se email foi atualizado, forçar nova busca mesmo se já existe woocommerce_id
    let wooCustomerId: number | null = customerRecord.woocommerce_id ?? null;

    if (!wooCustomerId || emailWasUpdated) {
      try {
        const wooCustomer = await findCustomerByEmail(effectiveEmail);
        if (wooCustomer) {
          wooCustomerId = wooCustomer.id;
          await supabaseAdmin
            .from('customers')
            .update({ woocommerce_id: wooCustomerId })
            .eq('id', customerRecord.id);

          if (emailWasUpdated) {
            console.log('✅ [Widget API] WooCommerce customer_id atualizado após mudança de email:', wooCustomerId);
          } else {
            console.log('✅ [Widget API] WooCommerce customer_id encontrado:', wooCustomerId);
          }
        } else {
          console.log('⚠️ [Widget API] Cliente sem pedidos registrados no WooCommerce');
        }
      } catch (integrationError) {
        console.error('❌ [Widget API] Erro ao consultar WooCommerce:', integrationError);
      }
    }

    // 3) Identificar ou criar conversa
    let activeConversationId: string | null = null;

    if (!emailWasUpdated && providedConversationId) {
      const { data: existingConversation, error: existingConversationError } = await supabaseAdmin
        .from('conversations')
        .select('id, customer_id')
        .eq('id', providedConversationId)
        .maybeSingle();

      if (!existingConversationError && existingConversation?.customer_id === customerRecord.id) {
        activeConversationId = existingConversation.id;
      }
    }

    if (!activeConversationId) {
      const { data: existingActive, error: activeConversationError } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('customer_id', customerRecord.id)
        .eq('channel', WIDGET_CHANNEL)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeConversationError) {
        throw activeConversationError;
      }

      if (existingActive && existingActive.length > 0) {
        activeConversationId = existingActive[0].id;
      }
    }

    if (!activeConversationId) {
      const { data: newConversation, error: createConversationError } = await supabaseAdmin
        .from('conversations')
        .insert({
          customer_id: customerRecord.id,
          channel: WIDGET_CHANNEL,
          status: 'active',
          language: 'es',
        })
        .select('id')
        .single();

      if (createConversationError || !newConversation) {
        throw createConversationError || new Error('No fue posible crear la conversaci�n');
      }

      activeConversationId = newConversation.id;
      console.log('?? [Widget API] Nueva conversaci�n creada:', activeConversationId);
    }

    // 4) Construir hist�rico para a IA
    const { data: conversationMessages, error: conversationMessagesError } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true });

    if (conversationMessagesError) {
      throw conversationMessagesError;
    }

    const aiMessages = [
      ...(conversationMessages ?? []).map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: lastUserMessage },
    ];

    // 5) Registrar mensagem do usu�rio
    const { error: userMessageError } = await supabaseAdmin.from('messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: lastUserMessage,
    });

    if (userMessageError) {
      console.error('? [Widget API] Falha ao salvar mensagem do usu�rio:', userMessageError);
    }

    // 6) Tracking e resposta da IA
    const aiStartTime = Date.now();

    await trackAIRequest({
      model: 'gpt-4o-mini',
      prompt_tokens: aiMessages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0),
      conversation_id: activeConversationId,
      user_message: lastUserMessage,
    });

    const response = await generateResponseWithFallback(aiMessages, {
      conversationId: activeConversationId,
      customerId: wooCustomerId,
      customerEmail: effectiveEmail,
    });

    const aiResponseTime = Date.now() - aiStartTime;

    await trackAIResponse({
      model: response.model,
      completion_tokens: Math.ceil(response.content.length / 4),
      total_tokens: Math.ceil((lastUserMessage.length + response.content.length) / 4),
      response_time_ms: aiResponseTime,
      conversation_id: activeConversationId,
      success: true,
    });

    const { error: assistantMessageError } = await supabaseAdmin.from('messages').insert({
      conversation_id: activeConversationId,
      role: 'assistant',
      content: response.content,
    });

    if (assistantMessageError) {
      console.error('? [Widget API] Falha ao salvar resposta do assistente:', assistantMessageError);
    }

    return NextResponse.json({
      message: response.content,
      model: response.model,
      conversationId: activeConversationId,
      emailUpdated: emailWasUpdated,
      newEmail: emailWasUpdated ? effectiveEmail : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('? [Widget API] Error:', error?.message ?? error);

    try {
      await trackAIResponse({
        model: 'unknown',
        completion_tokens: 0,
        total_tokens: 0,
        response_time_ms: 0,
        conversation_id: 'error',
        success: false,
        error: error?.message ?? 'unknown',
      });
    } catch (trackError) {
      console.error('? [Widget API] Error tracking failed response:', trackError);
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'SNKHOUSE Widget API funcionando',
    timestamp: new Date().toISOString(),
  });
}


