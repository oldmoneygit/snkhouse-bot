import { ConversationMessage, AgentResponse, AgentContext } from './types';
import { generateWithOpenAI } from './openai-agent';
import { generateWithAnthropic } from './anthropic-agent';
import { FALLBACK_RESPONSE } from './prompts';

/**
 * Gera resposta com TRIPLE FALLBACK
 * 1. Claude (primeiro)
 * 2. OpenAI (se Claude falhar)
 * 3. Mock básico (se ambos falharem)
 */
export async function generateResponseWithFallback(
  messages: ConversationMessage[],
  context: AgentContext = {}
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração...');
  console.log('🔄 [Agent] Trying Claude first, OpenAI as fallback...');

  let response: AgentResponse;

  // ===========================================
  // 1️⃣ TENTAR CLAUDE PRIMEIRO
  // ===========================================
  try {
    console.log('[Agent] 🚀 Attempting Claude...');

    response = await Promise.race([
      generateWithAnthropic(messages, {
        model: 'claude-3-5-haiku-20241022'
      }),
      new Promise<AgentResponse>((_, reject) =>
        setTimeout(() => reject(new Error('Claude overall timeout')), 12000)
      )
    ]);

    console.log('[Agent] ✅ Claude succeeded!');
    return response;

  } catch (claudeError: any) {
    console.error('[Agent] ❌ Claude failed:', claudeError.message);

    // ===========================================
    // 2️⃣ FALLBACK PARA OPENAI
    // ===========================================
    try {
      console.log('[Agent] 🔄 Trying OpenAI as fallback...');

      response = await Promise.race([
        generateWithOpenAI(messages, {}, context),
        new Promise<AgentResponse>((_, reject) =>
          setTimeout(() => reject(new Error('OpenAI overall timeout')), 12000)
        )
      ]);

      console.log('[Agent] ✅ OpenAI succeeded!');
      return response;

    } catch (openaiError: any) {
      console.error('[Agent] ❌ OpenAI also failed:', openaiError.message);

      // ===========================================
      // 3️⃣ ÚLTIMO FALLBACK: MOCK BÁSICO
      // ===========================================
      console.log('[Agent] ⚠️ Both AIs failed, using emergency fallback');

      return {
        content: '¡Hola! Soy el asistente de SNKHOUSE. Actualmente estoy experimentando problemas técnicos, pero estoy aquí para ayudarte. ¿En qué puedo asistirte?',
        model: 'emergency-fallback',
      };
    }
  }
}

/**
 * Gera resposta usando apenas OpenAI (com tools)
 */
export async function generateResponse(
  messages: ConversationMessage[],
  context: AgentContext = {}
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração com OpenAI...');
  return await generateWithOpenAI(messages, {}, context);
}

