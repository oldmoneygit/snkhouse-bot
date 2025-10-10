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

/**
 * Sanitiza email para logs (LGPD compliance)
 * Exemplo: "usuario@gmail.com" → "u***@***com"
 */
function sanitizeEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***@***';
  const domainParts = domain.split('.');
  const tld = domainParts.length > 0 ? domainParts[domainParts.length - 1] : '***';
  return `${user[0]}***@***${tld}`;
}

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

    // 1) Buscar customer pelo email do onboarding
    let customerRecord = null;
    const { data: existingCustomer, error: fetchCustomerError } = await supabaseAdmin
      .from('customers')
      .select('id, email, woocommerce_id')
      .eq('email', originalEmail)
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
          email: originalEmail,
          name: originalEmail.split('@')[0],
        })
        .select('id, email, woocommerce_id')
        .single();

      if (createCustomerError || !newCustomer) {
        throw createCustomerError || new Error('No fue posible crear el cliente');
      }

      customerRecord = newCustomer;
      console.log('📝 [Widget API] Cliente criado no Supabase:', customerRecord.id);
    }

    // 2) Buscar conversa existente ANTES de detectar email (para pegar email salvo)
    let existingConversation = null;
    if (providedConversationId) {
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .select('id, customer_id, effective_email')
        .eq('id', providedConversationId)
        .eq('customer_id', customerRecord.id)
        .maybeSingle();
      existingConversation = conv;
    }

    if (!existingConversation) {
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .select('id, customer_id, effective_email')
        .eq('customer_id', customerRecord.id)
        .eq('channel', WIDGET_CHANNEL)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      existingConversation = conv;
    }

    // 3) Determinar effective email: detectado > salvo > onboarding
    const emailMatch = lastUserMessage.match(EMAIL_REGEX);
    let effectiveEmail: string;
    let emailWasUpdated = false;

    if (emailMatch) {
      // Email detectado na mensagem atual
      effectiveEmail = emailMatch[0].toLowerCase();
      if (effectiveEmail !== originalEmail) {
        emailWasUpdated = true;
        console.log('🔍 [Widget API] Email detectado na mensagem:', {
          novo: sanitizeEmail(effectiveEmail)
        });
      }
    } else if (existingConversation?.effective_email) {
      // Usar email salvo da conversa
      effectiveEmail = existingConversation.effective_email;
      console.log('♻️ [Widget API] Reutilizando email salvo da conversa:', sanitizeEmail(effectiveEmail));
    } else {
      // Fallback: usar email do onboarding
      effectiveEmail = originalEmail;
      console.log('📧 [Widget API] Usando email do onboarding:', sanitizeEmail(effectiveEmail));
    }

    // 2) Mapear customer_id do WooCommerce
    // Se email foi atualizado, forçar nova busca mesmo se já existe woocommerce_id
    let wooCustomerId: number | null = customerRecord.woocommerce_id ?? null;

    if (wooCustomerId) {
      console.log('♻️ [Widget API] Reutilizando woocommerce_id do cache:', wooCustomerId);
    }

    if (!wooCustomerId || emailWasUpdated) {
      console.log('🔍 [Widget API] Buscando woocommerce_id no WooCommerce para:', sanitizeEmail(effectiveEmail));

      try {
        const wooCustomer = await findCustomerByEmail(effectiveEmail);
        if (wooCustomer) {
          wooCustomerId = wooCustomer.id;

          const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
              woocommerce_id: wooCustomerId,
              updated_at: new Date().toISOString()
            })
            .eq('id', customerRecord.id);

          if (updateError) {
            console.error('❌ [Widget API] Erro ao salvar woocommerce_id no Supabase:', updateError);
          } else {
            if (emailWasUpdated) {
              console.log('✅ [Widget API] WooCommerce customer_id atualizado após mudança de email:', wooCustomerId);
            } else {
              console.log('✅ [Widget API] WooCommerce customer_id encontrado e salvo:', wooCustomerId);
            }
          }
        } else {
          console.log('⚠️ [Widget API] Cliente não encontrado no WooCommerce para email:', sanitizeEmail(effectiveEmail));
        }
      } catch (integrationError) {
        console.error('❌ [Widget API] Erro ao consultar WooCommerce:', integrationError);
      }
    }

    // 4) Criar ou atualizar conversa com effective_email
    let activeConversationId: string | null = existingConversation?.id || null;

    if (activeConversationId) {
      // Conversa existe - verificar se effective_email mudou
      const savedEmail = existingConversation?.effective_email;

      if (savedEmail !== effectiveEmail) {
        // Email mudou, atualizar
        await supabaseAdmin
          .from('conversations')
          .update({
            effective_email: effectiveEmail,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeConversationId);

        console.log('🔄 [Widget API] Email da conversa atualizado de',
          savedEmail ? sanitizeEmail(savedEmail) : 'null',
          'para',
          sanitizeEmail(effectiveEmail)
        );
      }
    } else {
      // Criar nova conversa COM effective_email
      const { data: newConversation, error: createConversationError } = await supabaseAdmin
        .from('conversations')
        .insert({
          customer_id: customerRecord.id,
          channel: WIDGET_CHANNEL,
          status: 'active',
          language: 'es',
          effective_email: effectiveEmail,
        })
        .select('id')
        .single();

      if (createConversationError || !newConversation) {
        throw createConversationError || new Error('No fue posible crear la conversación');
      }

      activeConversationId = newConversation.id;
      console.log('💬 [Widget API] Nova conversa criada com email:', sanitizeEmail(effectiveEmail));
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

    // Log context being passed to AI
    console.log('🤖 [Widget API] Chamando AI com contexto:', {
      conversation_id: activeConversationId,
      customer_id: wooCustomerId,
      email_sanitized: sanitizeEmail(effectiveEmail),
      has_woo_id: !!wooCustomerId,
      customer_supabase_id: customerRecord.id
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


