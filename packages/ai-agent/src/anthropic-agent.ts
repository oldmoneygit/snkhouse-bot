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

    // 🧪 MOCK TEMPORÁRIO - API CALL DESABILITADA
    console.log('[Anthropic] 🧪 MOCK MODE: Using fake response (API call disabled)');
    console.log('[Anthropic] ⏳ Generating mock response...');

    let content = '';

    try {
      // Extrair última mensagem do usuário
      const userMessage = (anthropicMessages[anthropicMessages.length - 1]?.content || '').toLowerCase();

      console.log('[Anthropic] 📋 User message preview:', userMessage.substring(0, 50) + '...');

      if (userMessage.includes('nike') || userMessage.includes('zapatilla')) {
        content = `¡Hola! Sí, tenemos zapatillas Nike disponibles.

🔥 Algunos modelos destacados:
• Nike Air Max - $150 USD
• Nike Dunk Low - $120 USD
• Nike Air Force 1 - $130 USD

Todos son 100% originales con envío GRATIS a toda América Latina.

¿Te interesa algún modelo en particular?`;
      } else if (userMessage.includes('envío') || userMessage.includes('envio') || userMessage.includes('enviar')) {
        content = `¡El envío es GRATIS para toda América Latina! 📦

Tiempos de entrega:
🇦🇷 Argentina: 3-5 días
🇧🇷 Brasil: 5-7 días
🇨🇱 Chile: 4-6 días

¿En qué puedo ayudarte más?`;
      } else if (userMessage.includes('stock') || userMessage.includes('disponible')) {
        content = `Sí, tenemos stock disponible de la mayoría de modelos.

Para verificar stock de un modelo específico, decime qué zapatilla te interesa y te confirmo disponibilidad al instante. 👟`;
      } else if (userMessage.includes('pedido') || userMessage.includes('orden') || userMessage.includes('compra')) {
        content = `Para consultar tu pedido, necesito tu número de orden o email de compra.

También podés:
• Ver estado de envío
• Solicitar cambio/devolución
• Contactar con soporte

¿Qué necesitás?`;
      } else if (userMessage.includes('precio') || userMessage.includes('cuanto') || userMessage.includes('costo')) {
        content = `Nuestros precios van desde:

💰 Zapatillas básicas: $80-100 USD
🔥 Modelos populares: $120-150 USD
⭐ Ediciones limitadas: $180-250 USD

Todos con envío GRATIS y garantía de autenticidad.

¿Buscás algo en particular?`;
      } else {
        content = `¡Hola! Soy el asistente de SNKHOUSE 👟

Vendemos zapatillas 100% originales con:
✅ Envío GRATIS
✅ Cambio gratis en 7 días
✅ Programa de fidelidad (3 compras = 1 gratis)

¿En qué puedo ayudarte hoy?`;
      }

      console.log('[Anthropic] ✅ Mock response generated');
      console.log('[Anthropic] 📝 Content length:', content.length);
      console.log('[Anthropic] 📝 Preview:', content.substring(0, 100) + '...');

    } catch (mockError: any) {
      console.error('[Anthropic] ❌ Error generating mock:', mockError);
      content = 'Hola! Soy el asistente de SNKHOUSE. ¿En qué puedo ayudarte?';
    }

    // NÃO FAZER CHAMADA REAL:
    // const response = await anthropic.messages.create({ ... });

    console.log('✅ [Anthropic] Resposta mockada gerada');
    console.log('🎯 [Anthropic] Mock tokens (estimate):', content.length);

    return {
      content,
      model: 'mock-claude-3-5-haiku',
      tokensUsed: content.length, // Estimate
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
