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

    // 🚀 MODO REAL - CHAMANDO CLAUDE API
    console.log('[Anthropic] 🚀 REAL MODE: Calling Claude API (with timeout)');
    console.log('[Anthropic] ⚠️ Tools DISABLED for initial testing');

    let content = '';
    let responseModel = finalConfig.model;
    let tokensUsed = 0;

    try {
      // Criar cliente Anthropic
      const anthropicClient = getAnthropicClient();

      // Timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[Anthropic] ⏱️ TIMEOUT! Aborting Claude API call after 10s');
        controller.abort();
      }, 10000);

      console.log('[Anthropic] 📡 Making Claude API request...');
      const startTime = Date.now();

      // System prompt
      const systemPrompt = `Eres un asistente de SNKHOUSE, una tienda de zapatillas premium.

INFORMACIÓN IMPORTANTE:
- Vendemos zapatillas 100% originales
- Envío GRATIS a toda América Latina
- Cambio gratis en 7 días
- Programa de fidelidad: 3 compras = 1 gratis
- Tiempos de entrega: Argentina 3-5 días, Brasil 5-7 días, Chile 4-6 días

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé breve y directo (máximo 3-4 líneas)
- Sé amigable y usa emojis ocasionalmente
- Si preguntan por productos específicos, di que estás verificando disponibilidad
- No inventes precios o productos que no conoces`;

      const response = await anthropicClient.messages.create({
        model: finalConfig.model,
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: anthropicMessages,
        // SEM TOOLS por enquanto (adicionar depois)
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      console.log('[Anthropic] ✅ Response received in', duration, 'ms');
      console.log('[Anthropic] 📊 Response details:', {
        id: response.id,
        model: response.model,
        stopReason: response.stop_reason,
        usage: response.usage,
      });

      // Extrair texto
      content = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');

      responseModel = response.model;
      tokensUsed = response.usage.output_tokens || 0;

      console.log('[Anthropic] 📝 Response length:', content.length, 'chars');
      console.log('[Anthropic] 📝 Preview:', content.substring(0, 100) + '...');

    } catch (apiError: any) {
      console.error('[Anthropic] ❌ API Error:', {
        name: apiError.name,
        message: apiError.message,
        isAbortError: apiError.name === 'AbortError',
        isTimeout: apiError.message?.includes('timeout'),
      });

      // Se timeout ou erro, lançar para fallback
      if (apiError.name === 'AbortError') {
        throw new Error('Claude API timeout after 10s');
      }

      throw apiError;
    }

    return {
      content,
      model: responseModel,
      tokensUsed,
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
