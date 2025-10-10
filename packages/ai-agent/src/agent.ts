import { ConversationMessage, AgentResponse, AgentContext } from './types';
import { generateWithOpenAI } from './openai-agent';
import { generateWithAnthropic } from './anthropic-agent';
import { FALLBACK_RESPONSE } from './prompts';

/**
 * Gera resposta usando OpenAI com fallback para Anthropic
 */
export async function generateResponseWithFallback(
  messages: ConversationMessage[],
  context: AgentContext = {}
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração com fallback...');

  try {
    // Tentar OpenAI primeiro (com tools)
    console.log('🔄 [Agent] Tentando OpenAI...');
    return await generateWithOpenAI(messages, {}, context);

  } catch (openaiError: any) {
    console.error('❌ [Agent] OpenAI falhou:', openaiError.message);
    
    try {
      // Fallback para Anthropic Claude Haiku 3.5 (sem tools, mais barato)
      console.log('🔄 [Agent] Tentando Claude Haiku 3.5 como fallback...');
      return await generateWithAnthropic(messages, { 
        model: 'claude-3-5-haiku-20241022' 
      });

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
  messages: ConversationMessage[],
  context: AgentContext = {}
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração com OpenAI...');
  return await generateWithOpenAI(messages, {}, context);
}

