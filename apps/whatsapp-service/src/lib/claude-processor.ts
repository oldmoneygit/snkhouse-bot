import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { supabaseAdmin } from '@snkhouse/database';
import { buildSystemPrompt } from './system-prompt';
import { getClaudeTools } from './woocommerce-tools';
import { processMessageWithChatGPT } from './chatgpt-fallback';

/**
 * Process message with Claude + WooCommerce tools
 */
export async function processMessageWithClaude({
  message,
  conversationId,
  customerId,
  customerPhone
}: {
  message: string;
  conversationId: string;
  customerId: string;
  customerPhone: string;
}): Promise<string> {
  const startTime = Date.now();

  console.log(`🤖 [Claude Processor] Processing message for conv ${conversationId}`);

  // Declare conversationHistory outside try-catch so it's accessible in fallback
  let conversationHistory: any[] = [];

  try {
    // ========================================
    // STEP 0: Load conversation history from database
    // ========================================

    try {
      const { data: historyData, error: historyError } = await supabaseAdmin
        .from('messages')
        .select('role, content, metadata, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false }) // Get LATEST messages first
        .limit(25); // Last 25 messages for context (expanded for better memory)

      if (historyError) {
        console.error('⚠️ [Claude Processor] Failed to load history:', historyError.message);
      } else if (historyData && historyData.length > 0) {
        conversationHistory = historyData
          .filter((msg: any) => msg.role !== 'system') // Exclude system/error messages
          .reverse() // Reverse to chronological order (oldest first)
          .map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }));

        console.log(`📚 [Claude Processor] Loaded ${conversationHistory.length} messages from history`);

        // 🔍 DEBUG: Log history content to verify what's being passed to Claude
        console.log('🔍 [Claude Processor] History preview (last 5 messages):');
        conversationHistory.slice(-5).forEach((msg: any, idx: number) => {
          console.log(`   [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 80)}...`);
        });

        // 📊 DEBUG: Estimate context size
        const historyTokensEstimate = conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0) / 4;
        console.log(`📊 [Claude Processor] Estimated history tokens: ~${Math.round(historyTokensEstimate)}`);

      } else {
        console.log('📚 [Claude Processor] No conversation history found (new conversation)');
      }
    } catch (historyError: any) {
      console.error('⚠️ [Claude Processor] History loading error:', historyError.message);
      // Continue without history if loading fails
    }

    // ========================================
    // STEP 1: Save user message to database
    // ========================================
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {
          channel: 'whatsapp',
          phone: customerPhone,
          processor: 'claude',
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ [Claude Processor] User message saved');
    } catch (dbError: any) {
      console.error('⚠️ [Claude Processor] Failed to save user message:', dbError.message);
    }

    // ========================================
    // STEP 2: Run Claude with WooCommerce tools (with continuation loop)
    // ========================================

    // Build system prompt with full Knowledge Base (optimized for prompt caching)
    const systemPrompt = buildSystemPrompt();

    // 📊 DEBUG: Log system prompt size for cache monitoring
    const systemPromptTokensEstimate = systemPrompt.length / 4;
    console.log(`📊 [Claude Processor] System prompt size: ~${Math.round(systemPromptTokensEstimate)} tokens (will be cached by Anthropic)`);

    // Log request start
    console.log(`🚀 [Claude Processor] Starting Claude API call with ${conversationHistory.length} history messages`);

    // Get shared WooCommerce tools
    const tools = getClaudeTools();

    // First call - may return tool calls
    let result = await generateText({
      model: anthropic('claude-3-5-haiku-latest'), // Using Haiku - cheapest option ($0.80 vs $3/1M) with great tool calling
      system: systemPrompt,
      maxRetries: 5, // Increase retries from 3 to 5 for overload errors
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

    // DEBUG: Log the full result object to understand what's happening
    console.log('🔍 [Claude Processor] DEBUG result (first call):', {
      hasText: !!result.text,
      textLength: result.text?.length || 0,
      textPreview: result.text?.substring(0, 100) || 'EMPTY',
      finishReason: result.finishReason,
      toolCalls: result.toolCalls?.length || 0,
      toolResults: result.toolResults?.length || 0,
      steps: result.steps?.length || 0
    });

    // ========================================
    // STEP 2.5: Continue if tools were called to get final response with results
    // ========================================
    let responseText = result.text;

    // If we have tool calls, ALWAYS continue to get response with tool results
    if (result.finishReason === 'tool-calls' && result.toolResults && result.toolResults.length > 0) {
      console.log('🔄 [Claude Processor] Tool calls detected, continuing to generate response with results...');

      try {
        // Build messages from steps - use step.response.messages which has proper format
        const continueMessages: any[] = [
          // Conversation history for context
          ...conversationHistory,
          // Original user message
          {
            role: 'user',
            content: message
          },
          // Messages from the step response (assistant + tool) - already properly formatted by SDK
          ...result.steps.flatMap((step: any) => step.response?.messages || [])
        ];

        console.log('🔍 [Claude Processor] Continue messages:', {
          count: continueMessages.length,
          types: continueMessages.map((m: any) => m?.role || 'unknown')
        });

        // Continue generation with tool results
        const continueResult = await generateText({
          model: anthropic('claude-3-5-haiku-latest'),
          system: systemPrompt,
          maxRetries: 5, // Increase retries from 3 to 5 for overload errors
          abortSignal: AbortSignal.timeout(30000), // 30 second timeout
          messages: continueMessages
        });

        console.log('🔍 [Claude Processor] DEBUG result (after continuation):', {
          hasText: !!continueResult.text,
          textLength: continueResult.text?.length || 0,
          textPreview: continueResult.text?.substring(0, 100),
          finishReason: continueResult.finishReason
        });

        // Use text from continuation
        responseText = continueResult.text;
      } catch (continueError: any) {
        console.error('⚠️ [Claude Processor] Continuation failed:', continueError.message);
        // responseText will remain as result.text (which should be empty)
      }
    }

    // Fallback if still empty
    if (!responseText) {
      responseText = 'Disculpá, no pude procesar tu mensaje.';
    }

    console.log(`✅ [Claude Processor] Response generated:`, {
      duration: Date.now() - startTime,
      responseLength: responseText.length,
      usage: result.usage
    });

    // ========================================
    // STEP 3: Save assistant response to database
    // ========================================
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: responseText,
        metadata: {
          channel: 'whatsapp',
          processor: 'claude',
          model: 'claude-3-5-haiku-latest',
          execution_time_ms: Date.now() - startTime,
          usage: result.usage,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ [Claude Processor] Assistant response saved');
    } catch (dbError: any) {
      console.error('⚠️ [Claude Processor] Failed to save assistant response:', dbError.message);
    }

    return responseText;

  } catch (error: any) {
    // Enhanced error logging with more details
    const errorDetails = {
      message: error.message,
      name: error.name,
      cause: error.cause?.message || null,
      stack: error.stack?.substring(0, 500),
      isOverloaded: error.message?.includes('Overloaded') || error.message?.includes('overloaded'),
      isRetryError: error.name === 'AI_RetryError'
    };

    console.error('❌ [Claude Processor] Error:', errorDetails);

    // Log specific guidance for Overloaded errors
    if (errorDetails.isOverloaded) {
      console.error('⚠️ [Claude Processor] Anthropic API is overloaded. This usually resolves within seconds.');
      console.error('💡 [Claude Processor] User will be asked to retry. The next attempt will likely succeed.');
    }

    // Save error message to database
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'system',
        content: `Claude Error: ${error.message}`,
        metadata: {
          channel: 'whatsapp',
          processor: 'claude',
          error: true,
          error_type: error.name,
          is_overloaded: errorDetails.isOverloaded,
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      console.error('⚠️ [Claude Processor] Failed to save error message');
    }

    // ========================================
    // 🔄 FALLBACK: Try ChatGPT if Claude fails
    // ========================================
    console.log('🔄 [Claude Processor] Claude failed, attempting fallback to ChatGPT (gpt-4o-mini)...');
    console.log(`⏱️ [Claude Processor] Claude failed after ${Date.now() - startTime}ms`);

    try {
      const chatgptResponse = await processMessageWithChatGPT({
        message,
        conversationHistory,
        conversationId,
        customerPhone
      });

      console.log('✅ [Fallback] ChatGPT succeeded! Response length:', chatgptResponse.length);
      console.log(`⏱️ [Fallback] Total time (Claude fail + ChatGPT success): ${Date.now() - startTime}ms`);

      // Save ChatGPT response to database with fallback metadata
      try {
        await supabaseAdmin.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: chatgptResponse,
          metadata: {
            channel: 'whatsapp',
            processor: 'chatgpt-fallback',
            model: 'gpt-4o-mini',
            claude_error: error.message,
            claude_error_type: error.name,
            is_fallback: true,
            execution_time_ms: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        });
        console.log('✅ [Fallback] ChatGPT response saved to database');
      } catch (dbError) {
        console.error('⚠️ [Fallback] Failed to save ChatGPT response to database');
      }

      return chatgptResponse;

    } catch (fallbackError: any) {
      console.error('❌ [Fallback] ChatGPT also failed:', {
        message: fallbackError.message,
        name: fallbackError.name,
        stack: fallbackError.stack?.substring(0, 500)
      });

      console.log(`⏱️ [Fallback] Total time (both failed): ${Date.now() - startTime}ms`);

      // Save fallback failure to database
      try {
        await supabaseAdmin.from('messages').insert({
          conversation_id: conversationId,
          role: 'system',
          content: `Fallback Error: ${fallbackError.message}`,
          metadata: {
            channel: 'whatsapp',
            processor: 'chatgpt-fallback',
            error: true,
            claude_error: error.message,
            chatgpt_error: fallbackError.message,
            both_failed: true,
            timestamp: new Date().toISOString()
          }
        });
      } catch (dbError) {
        console.error('⚠️ [Fallback] Failed to save fallback error');
      }

      // Both Claude and ChatGPT failed - return error message to user
      if (errorDetails.isOverloaded) {
        return 'Disculpá, el sistema está con mucha demanda en este momento. Por favor, intentá de nuevo en unos segundos.';
      }

      return 'Disculpá, tuve un problema técnico. ¿Podés intentar de nuevo en unos segundos?';
    }
  }
}
