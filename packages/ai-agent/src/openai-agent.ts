import OpenAI from 'openai';
import { ConversationMessage, AgentResponse, AgentConfig } from './types';
import { SYSTEM_PROMPT } from './prompts';
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
  config: Partial<AgentConfig> = {}
): Promise<AgentResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('🤖 [OpenAI] Iniciando geração com tools habilitadas...');
  console.log('📊 [OpenAI] Mensagens no histórico:', messages.length);
  console.log('🔧 [OpenAI] Tools disponíveis:', TOOLS_DEFINITIONS.length);

  try {
    let currentMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
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
