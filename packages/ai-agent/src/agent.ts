import { ConversationMessage, AgentResponse, AgentContext } from './types';
import { generateWithOpenAI } from './openai-agent';
import { generateWithAnthropic } from './anthropic-agent';
import { FALLBACK_RESPONSE } from './prompts';

/**
 * Gera resposta usando Claude APENAS
 * OpenAI DESABILITADO temporariamente devido a timeouts
 */
export async function generateResponseWithFallback(
  messages: ConversationMessage[],
  context: AgentContext = {}
): Promise<AgentResponse> {
  console.log('🤖 [Agent] Iniciando geração...');
  console.log('⚠️  [Agent] OpenAI DISABLED temporarily - using Claude only');

  // Validar Anthropic API Key
  console.log('🔑 [Agent] Checking Anthropic API Key...');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ [Agent] ANTHROPIC_API_KEY not found in environment!');
    throw new Error('Anthropic API Key is missing');
  }

  if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    console.error('❌ [Agent] ANTHROPIC_API_KEY format invalid (should start with sk-ant-)');
    throw new Error('Anthropic API Key format is invalid');
  }

  console.log('✅ [Agent] Anthropic API Key found:',
    process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...');

  // OPENAI DESABILITADO - COMENTADO
  // try {
  //   console.log('🔄 [Agent] Tentando OpenAI...');
  //   return await generateWithOpenAI(messages, {}, context);
  // } catch (openaiError: any) {
  //   console.error('❌ [Agent] OpenAI falhou:', openaiError.message);
  // }

  try {
    // Usar Claude Haiku 3.5 diretamente
    console.log('🚀 [Agent] Using Claude Haiku 3.5 directly...');
    return await generateWithAnthropic(messages, {
      model: 'claude-3-5-haiku-20241022'
    });

  } catch (anthropicError: any) {
    console.error('❌ [Agent] Claude failed:', anthropicError.message);

    // Último recurso: resposta estática
    console.log('🔄 [Agent] Usando resposta de fallback estática...');
    return {
      content: FALLBACK_RESPONSE,
      model: 'fallback',
    };
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

