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

  console.log('🚀 [Anthropic] Starting generation...');
  console.log('📊 [Anthropic] Messages count:', messages.length);

  try {
    // Converter mensagens para formato Anthropic
    console.log('[Anthropic] 🔄 Converting messages to Anthropic format...');

    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

    console.log('[Anthropic] ✅ Converted messages:', anthropicMessages.length);

    const systemPrompt = messages.find(msg => msg.role === 'system')?.content ||
      'Sos el asistente de ventas de SNKHOUSE. Ayudá a los clientes a encontrar zapatillas.';

    console.log('[Anthropic] 📋 System prompt length:', systemPrompt.length);
    console.log('[Anthropic] 🔧 Initializing Anthropic client...');

    const anthropic = getAnthropicClient();

    console.log('[Anthropic] ✅ Client initialized');
    console.log('[Anthropic] 🕐 Calling Anthropic API...');
    console.log('[Anthropic] 📊 Config:', {
      model: finalConfig.model,
      maxTokens: finalConfig.maxTokens,
      temperature: finalConfig.temperature,
      messagesCount: anthropicMessages.length,
    });

    let response;
    try {
      // Timeout de 15 segundos
      const apiCall = anthropic.messages.create({
        model: finalConfig.model,
        max_tokens: finalConfig.maxTokens,
        temperature: finalConfig.temperature,
        system: systemPrompt,
        messages: anthropicMessages as any,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Anthropic API timeout after 15 seconds'));
        }, 15000);
      });

      console.log('[Anthropic] ⏳ Waiting for response (15s timeout)...');
      response = await Promise.race([apiCall, timeoutPromise]);
      console.log('[Anthropic] ✅ Response received from API!');

    } catch (apiError: any) {
      console.error('[Anthropic] ❌ API Call ERROR:', {
        name: apiError.name,
        message: apiError.message,
        stack: apiError.stack?.substring(0, 200),
      });
      throw apiError;
    }

    console.log('[Anthropic] 📊 Response details:', {
      id: response.id,
      model: response.model,
      stopReason: response.stop_reason,
      contentBlocks: response.content?.length,
    });

    const content = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Sin respuesta';

    console.log('✅ [Anthropic] Resposta gerada');
    console.log('📝 [Anthropic] Content length:', content.length);
    console.log('📝 [Anthropic] Preview:', content.substring(0, 100) + '...');
    console.log('🎯 [Anthropic] Tokens usados:', (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0));

    return {
      content,
      model: finalConfig.model,
      tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    };

  } catch (error: any) {
    console.error('❌ [Anthropic] ERRO:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 300),
    });
    throw new Error(`Anthropic Error: ${error.message}`);
  }
}
