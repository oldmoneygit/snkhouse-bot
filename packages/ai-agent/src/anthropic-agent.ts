import Anthropic from '@anthropic-ai/sdk';
import { ConversationMessage, AgentResponse, AgentConfig } from './types';

function getAnthropicClient() {
  console.log('[Anthropic] 🔧 Creating client with config...');

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 0, // Sem retries para debug
    timeout: 15000, // 15s timeout
  });

  console.log('[Anthropic] ✅ Client created with:', {
    apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
    maxRetries: 0,
    timeout: 15000,
  });

  return client;
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

    // VERSÃO MINIMALISTA - SEM TOOLS, SEM COMPLEXIDADE
    console.log('[Anthropic] 🧪 MINIMAL MODE: No tools, basic config only');
    console.log('[Anthropic] ⏳ Calling API...');

    let response;
    try {
      const startTime = Date.now();

      // CHAMADA ULTRA SIMPLIFICADA
      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: anthropicMessages[anthropicMessages.length - 1]?.content || 'Hola',
          }
        ],
        system: 'Eres un asistente de SNKHOUSE. Responde en español de forma breve y amigable.',
      });

      const duration = Date.now() - startTime;
      console.log('[Anthropic] ✅ Response received in', duration, 'ms');

    } catch (apiError: any) {
      console.error('[Anthropic] ❌ ERRO COMPLETO:', {
        name: apiError.name || 'Unknown',
        message: apiError.message || 'No message',
        code: apiError.code,
        status: apiError.status,
        type: apiError.type,
        stack: apiError.stack?.split('\n').slice(0, 5),
      });
      throw new Error('Anthropic API failed: ' + apiError.message);
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
