import { NextRequest, NextResponse } from 'next/server';
import { generateResponseWithFallback } from '@snkhouse/ai-agent';
import { supabaseAdmin } from '@snkhouse/database';
import { trackAIRequest, trackAIResponse } from '@snkhouse/analytics';
import * as path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env.local') });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, email, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    console.log('━'.repeat(70));
    console.log('🤖 [Widget API] Recibiendo mensaje:', message);
    console.log('📧 [Widget API] Email:', email || 'anónimo');
    console.log('🔑 [Widget API] Conversation ID recibido:', conversationId || 'ninguno');

    // 1. Identificar/criar customer
    let customerId: string;

    if (email) {
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log('✅ [Widget API] Cliente existente:', customerId);
      } else {
        const { data: newCustomer, error: customerError } = await supabaseAdmin
          .from('customers')
          .insert({ email })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          console.error('❌ [Widget API] Erro ao criar cliente:', customerError);
          throw new Error('Error al crear cliente');
        }

        customerId = newCustomer.id;
        console.log('✅ [Widget API] Novo cliente criado:', customerId);
      }
    } else {
      // Cliente anônimo - criar um temporário
      const { data: anonCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({ email: `anon_${Date.now()}@snkhouse.com` })
        .select('id')
        .single();

      if (customerError || !anonCustomer) {
        console.error('❌ [Widget API] Erro ao criar cliente anônimo:', customerError);
        throw new Error('Error al crear cliente');
      }

      customerId = anonCustomer.id;
      console.log('✅ [Widget API] Cliente anônimo criado:', customerId);
    }

    // 2. Identificar/criar conversation
    let currentConversationId: string;

    if (conversationId) {
      // Verificar se a conversa existe
      const { data: existingConv } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .single();

      if (existingConv) {
        currentConversationId = conversationId;
        console.log('✅ [Widget API] Usando conversa existente:', currentConversationId);
      } else {
        console.log('⚠️  [Widget API] Conversa não encontrada, criando nova...');
        const { data: newConv, error: convError } = await supabaseAdmin
          .from('conversations')
          .insert({
            customer_id: customerId,
            channel: 'widget',
            status: 'active',
            language: 'es',
          })
          .select('id')
          .single();

        if (convError || !newConv) {
          console.error('❌ [Widget API] Erro ao criar conversa:', convError);
          throw new Error('Error al crear conversación');
        }

        currentConversationId = newConv.id;
        console.log('✅ [Widget API] Nova conversa criada:', currentConversationId);
      }
    } else {
      // Criar nova conversa
      const { data: newConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          customer_id: customerId,
          channel: 'widget',
          status: 'active',
          language: 'es',
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        console.error('❌ [Widget API] Erro ao criar conversa:', convError);
        throw new Error('Error al crear conversación');
      }

      currentConversationId = newConv.id;
      console.log('✅ [Widget API] Nova conversa criada:', currentConversationId);
    }

    console.log('━'.repeat(70));
    console.log('🔍 [DEBUG] CONVERSATION INFO:');
    console.log('   Conversation ID:', currentConversationId);
    console.log('   Customer ID:', customerId);
    console.log('━'.repeat(70));

    // 3. Carregar histórico de mensagens
    console.log('🔍 [DEBUG] CARREGANDO HISTÓRICO:');
    console.log('   Conversation ID:', currentConversationId);

    const { data: conversationMessages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    console.log('   Mensagens no banco:', conversationMessages?.length || 0);
    console.log('   Erro ao carregar?:', messagesError ? messagesError.message : 'Não');

    if (conversationMessages && conversationMessages.length > 0) {
      console.log('   Preview mensagens carregadas:');
      conversationMessages.forEach((msg: any, i: number) => {
        console.log(`   ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
      });
    }

    // 4. Montar array de mensagens para IA
    const messages = [
      ...(conversationMessages || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    console.log('🔍 [DEBUG] ENVIANDO PARA IA:');
    console.log('   Total mensagens:', messages.length);
    console.log('   Breakdown:');
    console.log('   - Do banco:', conversationMessages?.length || 0);
    console.log('   - Nova (user):', 1);
    console.log('   Preview completo:');
    messages.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });
    console.log('━'.repeat(70));

    // 5. Salvar mensagem do usuário
    const { error: userMessageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message,
      });

    console.log('💾 [DEBUG] SALVANDO MENSAGEM USER:');
    console.log('   Conversation ID:', currentConversationId);
    console.log('   Content:', message);
    console.log('   Erro?:', userMessageError ? userMessageError.message : 'Não');

    if (userMessageError) {
      console.error('❌ [Widget API] Erro ao salvar mensagem do usuário:', userMessageError);
    }

    // 6. Gerar resposta com IA
    const aiStartTime = Date.now();

    // TRACKING: AI Request
    await trackAIRequest({
      model: 'gpt-4o-mini',
      prompt_tokens: messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0),
      conversation_id: currentConversationId,
      user_message: message
    });

    const response = await generateResponseWithFallback(messages);
    const aiResponseTime = Date.now() - aiStartTime;

    console.log('🤖 [Widget API] Resposta generada:', response.model);

    // TRACKING: AI Response
    await trackAIResponse({
      model: response.model,
      completion_tokens: Math.ceil(response.content.length / 4), // Estimativa
      total_tokens: Math.ceil((message.length + response.content.length) / 4), // Estimativa
      response_time_ms: aiResponseTime,
      conversation_id: currentConversationId,
      success: true
    });

    // 7. Salvar resposta do assistente
    const { error: assistantMessageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: response.content,
      });

    console.log('💾 [DEBUG] SALVANDO MENSAGEM ASSISTANT:');
    console.log('   Conversation ID:', currentConversationId);
    console.log('   Content length:', response.content.length);
    console.log('   Erro?:', assistantMessageError ? assistantMessageError.message : 'Não');
    console.log('━'.repeat(70));

    if (assistantMessageError) {
      console.error('❌ [Widget API] Erro ao salvar mensagem do assistente:', assistantMessageError);
    }

    return NextResponse.json({
      message: response.content,
      model: response.model,
      conversationId: currentConversationId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [Widget API] Error:', error.message);
    console.error('❌ [Widget API] Stack:', error.stack);

    // TRACKING: AI Response Failed
    try {
      await trackAIResponse({
        model: 'unknown',
        completion_tokens: 0,
        total_tokens: 0,
        response_time_ms: 0,
        conversation_id: 'error',
        success: false,
        error: error.message
      });
    } catch (trackError) {
      console.error('❌ [Widget API] Error tracking failed response:', trackError);
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'Lo siento, hubo un error. Por favor intenta de nuevo.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'SNKHOUSE Widget API funcionando',
    timestamp: new Date().toISOString()
  });
}
