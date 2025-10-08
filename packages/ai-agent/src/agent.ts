import { ConversationMessage, AgentResponse } from './types';
import { generateWithOpenAI } from './openai-agent';
import { generateWithAnthropic } from './anthropic-agent';
import { FALLBACK_RESPONSE } from './prompts';

/**
 * Gera resposta usando OpenAI com fallback para Anthropic
 */
export async function generateResponseWithFallback(
  messages: ConversationMessage[]
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração com fallback...');

  try {
    // Tentar OpenAI primeiro (com tools)
    console.log('🔄 [Agent] Tentando OpenAI...');
    return await generateWithOpenAI(messages);

  } catch (openaiError: any) {
    console.error('❌ [Agent] OpenAI falhou:', openaiError.message);
    
    try {
      // Fallback para Anthropic (sem tools)
      console.log('🔄 [Agent] Tentando Anthropic como fallback...');
      return await generateWithAnthropic(messages);

    } catch (anthropicError: any) {
      console.error('❌ [Agent] Anthropic também falhou:', anthropicError.message);
      
      // Último recurso: resposta estática
      console.log('🔄 [Agent] Usando resposta de fallback estática...');
      return {
        content: FALLBACK_RESPONSE,
        model: 'fallback',
      };
    }
  }
}

/**
 * Gera resposta usando apenas OpenAI (com tools)
 */
export async function generateResponse(
  messages: ConversationMessage[]
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração com OpenAI...');
  return await generateWithOpenAI(messages);
}
