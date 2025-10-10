import OpenAI from 'openai';
import { ConversationMessage, AgentResponse, AgentConfig, AgentContext } from './types';
import { buildSystemPrompt } from './prompts';
import { enrichPromptWithFAQs } from './knowledge';
import { TOOLS_DEFINITIONS } from './tools/definitions';
import { executeToolCall } from './tools/handlers';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const DEFAULT_CONFIG: AgentConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
};

export async function generateWithOpenAI(
  messages: ConversationMessage[],
  config: Partial<AgentConfig> = {},
  context: AgentContext = {}
): Promise<AgentResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const runtimeContext: AgentContext = {
    conversationId: context.conversationId,
    customerId: context.customerId ?? null,
    customerEmail: context.customerEmail ?? null,
  };

  console.log('🤖 [OpenAI] Iniciando geração com tools habilitadas...');
  console.log('📊 [OpenAI] Mensagens no histórico:', messages.length);
  console.log('🔧 [OpenAI] Tools disponíveis:', TOOLS_DEFINITIONS.length);

  try {
    // Build dynamic system prompt from Knowledge Base
    const baseSystemPrompt = buildSystemPrompt({
      hasOrdersAccess: Boolean(runtimeContext.customerId),
    });

    // Enrich prompt with relevant FAQs based on user's last message
    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    const systemPrompt = lastUserMessage
      ? enrichPromptWithFAQs(lastUserMessage.content, baseSystemPrompt)
      : baseSystemPrompt;

    console.log('[OpenAI] System prompt enriched with FAQs from Knowledge Base');

    if (!runtimeContext.customerId) {
      console.log('[OpenAI] Tools de pedidos desabilitadas (sem customer_id no contexto)');
    }
    let currentMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ];

    // Loop para lidar com tool calls (máximo 5 iterações)
    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`🔄 [OpenAI] Iteração ${iteration}/${maxIterations}`);

      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: finalConfig.model,
        messages: currentMessages as any,
        tools: TOOLS_DEFINITIONS as any,
        tool_choice: 'auto',
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
      });

      const choice = response.choices[0];
      const finishReason = choice.finish_reason;

      console.log(`📍 [OpenAI] Finish reason: ${finishReason}`);

      // Se não há tool calls, retornar a resposta
      if (finishReason === 'stop' || !choice.message.tool_calls) {
        const content = choice.message.content || 'Sin respuesta';
        
        console.log('✅ [OpenAI] Resposta final gerada');
        console.log('📝 [OpenAI] Preview:', content.substring(0, 100) + '...');
        console.log('🎯 [OpenAI] Tokens usados:', response.usage?.total_tokens || 0);

        return {
          content,
          model: finalConfig.model,
          tokensUsed: response.usage?.total_tokens,
        };
      }

      // Executar tool calls
      console.log(`🔧 [OpenAI] ${choice.message.tool_calls.length} tool calls detectadas`);

      // Adicionar a mensagem do assistente (com tool calls)
      currentMessages.push(choice.message as any);

      // Executar cada tool call
      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        const ORDERS_TOOLS = ['get_order_status', 'search_customer_orders', 'get_order_details', 'track_shipment'];
        if (ORDERS_TOOLS.includes(toolName)) {
          if (!toolArgs.customer_id && runtimeContext.customerId) {
            // Tem customer_id numérico, usar
            toolArgs.customer_id = runtimeContext.customerId;
            console.log(`[OpenAI] Injetado customer_id=${runtimeContext.customerId} para tool ${toolName}`);
          } else if (!toolArgs.customer_id && runtimeContext.customerEmail) {
            // Não tem customer_id mas tem email, usar email como fallback
            toolArgs.customer_id = runtimeContext.customerEmail;
            console.log(`[OpenAI] Injetado customerEmail como fallback para tool ${toolName}: ${runtimeContext.customerEmail.split('@')[0]}***`);
          } else if (!toolArgs.customer_id) {
            console.log('[OpenAI] Tool de pedidos sem customer_id e sem email no contexto');
          }
        }

        if (runtimeContext.conversationId && !toolArgs.conversation_id) {
          toolArgs.conversation_id = runtimeContext.conversationId;
        }

        console.log(`⚙️  [OpenAI] Executando tool: ${toolName}`);

        try {
          const toolResult = await executeToolCall(toolName, toolArgs);
          
          console.log(`✅ [OpenAI] Tool executada com sucesso`);
          console.log(`📊 [OpenAI] Resultado (${toolResult.length} chars)`);

          // Adicionar resultado da tool
          currentMessages.push({
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: toolResult,
          } as any);

        } catch (error: any) {
          console.error(`❌ [OpenAI] Erro na tool ${toolName}:`, error.message);
          
          currentMessages.push({
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: `Error ejecutando ${toolName}: ${error.message}`,
          } as any);
        }
      }
    }

    // Se chegou no máximo de iterações
    console.warn('⚠️  [OpenAI] Máximo de iterações atingido');
    return {
      content: 'Disculpá, hubo un problema procesando tu consulta. ¿Podés reformular tu pregunta?',
      model: finalConfig.model,
    };

  } catch (error: any) {
    console.error('❌ [OpenAI] Erro:', error.message);
    throw new Error(`OpenAI Error: ${error.message}`);
  }
}

