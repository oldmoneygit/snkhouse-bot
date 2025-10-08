import Anthropic from '@anthropic-ai/sdk';
import { ConversationMessage, AgentResponse, AgentConfig } from './types';

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-3-haiku-20240307',
  temperature: 0.7,
  maxTokens: 1000,
};

export async function generateWithAnthropic(
  messages: ConversationMessage[],
  config: Partial<AgentConfig> = {}
): Promise<AgentResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('🤖 [Anthropic] Iniciando geração...');
  console.log('📊 [Anthropic] Mensagens no histórico:', messages.length);

  try {
    // Converter mensagens para formato Anthropic
    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

    const systemPrompt = messages.find(msg => msg.role === 'system')?.content || 
      'Sos el asistente de ventas de SNKHOUSE. Ayudá a los clientes a encontrar zapatillas.';

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: finalConfig.model,
      max_tokens: finalConfig.maxTokens,
      temperature: finalConfig.temperature,
      system: systemPrompt,
      messages: anthropicMessages as any,
    });

    const content = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : 'Sin respuesta';

    console.log('✅ [Anthropic] Resposta gerada');
    console.log('📝 [Anthropic] Preview:', content.substring(0, 100) + '...');
    console.log('🎯 [Anthropic] Tokens usados:', response.usage?.input_tokens + response.usage?.output_tokens || 0);

    return {
      content,
      model: finalConfig.model,
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
    };

  } catch (error: any) {
    console.error('❌ [Anthropic] Erro:', error.message);
    throw new Error(`Anthropic Error: ${error.message}`);
  }
}
