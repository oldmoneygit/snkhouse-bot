/**
 * ChatGPT Fallback Processor
 *
 * This module provides a fallback AI processor using OpenAI's GPT-4o-mini when Claude fails.
 * Uses the same system prompt, tools, and conversation history to maintain consistency.
 *
 * Model: gpt-4o-mini
 * - Cost: $0.15 / $0.60 per 1M tokens (input/output)
 * - 90% cheaper than gpt-4o
 * - Excellent tool calling support
 * - Fast response times (~2x faster than gpt-4o)
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { buildSystemPrompt } from './system-prompt';
import { getOpenAITools } from './woocommerce-tools';

/**
 * Process message with ChatGPT (fallback when Claude fails)
 */
export async function processMessageWithChatGPT({
  message,
  conversationHistory,
  conversationId,
  customerPhone
}: {
  message: string;
  conversationHistory: any[];
  conversationId: string;
  customerPhone: string;
}): Promise<string> {
  const startTime = Date.now();

  console.log(`🤖 [ChatGPT Fallback] Processing message for conv ${conversationId}`);
  console.log(`📚 [ChatGPT Fallback] Using ${conversationHistory.length} messages from history`);

  // Build system prompt (same as Claude)
  const systemPrompt = buildSystemPrompt();
  const systemPromptTokensEstimate = systemPrompt.length / 4;
  console.log(`📊 [ChatGPT Fallback] System prompt size: ~${Math.round(systemPromptTokensEstimate)} tokens`);

  console.log(`🚀 [ChatGPT Fallback] Starting OpenAI API call (gpt-4o-mini)`);

  // Get OpenAI-compatible tools
  const tools = getOpenAITools();

  try {
    // First call - may return tool calls
    let result = await generateText({
      model: openai('gpt-4o-mini'), // Cheapest model with great tool calling
      system: systemPrompt,
      maxRetries: 3, // Standard retries for OpenAI
      abortSignal: AbortSignal.timeout(30000), // 30 second timeout
      messages: [
        ...conversationHistory, // Include conversation history for context
        {
          role: 'user',
          content: message
        }
      ],
      tools
    });

    // DEBUG: Log the full result object
    console.log('🔍 [ChatGPT Fallback] DEBUG result (first call):', {
      hasText: !!result.text,
      textLength: result.text?.length || 0,
      textPreview: result.text?.substring(0, 100) || 'EMPTY',
      finishReason: result.finishReason,
      toolCalls: result.toolCalls?.length || 0,
      toolResults: result.toolResults?.length || 0,
      steps: result.steps?.length || 0
    });

    let responseText = result.text;

    // If we have tool calls, ALWAYS continue to get response with tool results
    if (result.finishReason === 'tool-calls' && result.toolResults && result.toolResults.length > 0) {
      console.log('🔄 [ChatGPT Fallback] Tool calls detected, continuing to generate response with results...');

      try {
        // Build messages from steps
        const continueMessages: any[] = [
          // Conversation history for context
          ...conversationHistory,
          // Original user message
          {
            role: 'user',
            content: message
          },
          // Messages from the step response (assistant + tool)
          ...result.steps.flatMap((step: any) => step.response?.messages || [])
        ];

        console.log('🔍 [ChatGPT Fallback] Continue messages:', {
          count: continueMessages.length,
          types: continueMessages.map((m: any) => m?.role || 'unknown')
        });

        // Continue generation with tool results
        const continueResult = await generateText({
          model: openai('gpt-4o-mini'),
          system: systemPrompt,
          maxRetries: 3,
          abortSignal: AbortSignal.timeout(30000),
          messages: continueMessages
        });

        console.log('🔍 [ChatGPT Fallback] DEBUG result (after continuation):', {
          hasText: !!continueResult.text,
          textLength: continueResult.text?.length || 0,
          textPreview: continueResult.text?.substring(0, 100),
          finishReason: continueResult.finishReason
        });

        // Use text from continuation
        responseText = continueResult.text;
      } catch (continueError: any) {
        console.error('⚠️ [ChatGPT Fallback] Continuation failed:', continueError.message);
        // responseText will remain as result.text
      }
    }

    // Fallback if still empty
    if (!responseText) {
      responseText = 'Disculpá, no pude procesar tu mensaje.';
    }

    console.log(`✅ [ChatGPT Fallback] Response generated:`, {
      duration: Date.now() - startTime,
      responseLength: responseText.length,
      usage: result.usage
    });

    return responseText;

  } catch (error: any) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      name: error.name,
      cause: error.cause?.message || null,
      stack: error.stack?.substring(0, 500)
    };

    console.error('❌ [ChatGPT Fallback] Error:', errorDetails);

    // Rethrow so parent can handle
    throw new Error(`ChatGPT fallback failed: ${error.message}`);
  }
}
