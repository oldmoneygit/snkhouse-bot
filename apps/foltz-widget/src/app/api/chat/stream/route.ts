/**
 * FOLTZ Widget - Chat Streaming API
 * Main endpoint for AI chat with Shopify integration
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { supabaseAdmin } from '@snkhouse/database';
import {
  buildFoltzWidgetPrompt,
  FOLTZ_TOOLS,
  executeToolCall,
  type ToolInput,
} from '@snkhouse/foltz-ai-agent';
import { extractEmail, shouldUseTool, extractProductIds } from '@/lib/product-utils';

// Edge runtime for better performance
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * POST /api/chat/stream
 * Main chat endpoint with streaming and tool support
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, customerEmail, conversationId, pageContext } = body;

    const lastUserMessage = messages[messages.length - 1];

    console.log('💬 Chat stream request:', {
      messagesCount: messages.length,
      customerEmail: customerEmail || 'NULL',
      conversationId: conversationId || 'NULL',
      pageContext: pageContext ? 'PROVIDED' : 'NULL',
      userMessage: lastUserMessage?.content?.substring(0, 60) + '...' || 'EMPTY',
    });

    console.log('🔍 [DEBUG 1] Frontend conversationId:', conversationId);

    // Validate input
    if (!messages || !Array.from(messages).length) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 },
      );
    }

    // Get last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 },
      );
    }

    // Validate message content
    if (!lastMessage.content || typeof lastMessage.content !== 'string' || lastMessage.content.trim() === '') {
      console.error('❌ Empty message content');
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 },
      );
    }

    // Get validated user message
    const userMessage = lastMessage.content;

    // Extract email from message if present
    const detectedEmail = extractEmail(userMessage);
    const effectiveEmail = detectedEmail || customerEmail || null;

    console.log('📧 Email resolution:', {
      provided: customerEmail,
      detected: detectedEmail,
      effective: effectiveEmail,
    });

    // Get or create customer
    let customerId = null;
    if (effectiveEmail) {
      const { data: existingCustomer, error: findError } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', effectiveEmail)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .single();

      if (findError && findError.code !== 'PGRST116') {
        // PGRST116 = not found, which is expected for new customers
        console.error('❌ [DEBUG 2] Error finding customer:', findError);
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log('🔍 [DEBUG 2] Found existing customer:', customerId);
      } else {
        const { data: newCustomer, error: createError } = await supabaseAdmin
          .from('customers')
          .insert({
            email: effectiveEmail,
            name: effectiveEmail.split('@')[0],
            store_id: 'foltz', // ← FOLTZ
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ [DEBUG 2] Error creating customer:', createError);
          console.error('❌ [DEBUG 2] Error details:', JSON.stringify(createError, null, 2));
        } else {
          customerId = newCustomer?.id ?? null;
          console.log('🔍 [DEBUG 2] Created new customer:', customerId);
          console.log('🔍 [DEBUG 2] Customer data:', newCustomer);
        }
      }
    } else {
      console.log('🔍 [DEBUG 2] No email, customerId will be null');
    }

    // Get or create conversation
    let effectiveConversationId = conversationId;
    if (!effectiveConversationId && customerId) {
      const { data: activeConversation, error: findConvError } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .eq('channel', 'widget')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (findConvError && findConvError.code !== 'PGRST116') {
        // PGRST116 = not found, which is expected for new conversations
        console.error('❌ [DEBUG 3] Error finding conversation:', findConvError);
      }

      if (activeConversation) {
        effectiveConversationId = activeConversation.id;
        console.log('🔍 [DEBUG 3] Found existing conversation:', effectiveConversationId);
      } else {
        const { data: newConversation, error: createConvError } = await supabaseAdmin
          .from('conversations')
          .insert({
            customer_id: customerId,
            store_id: 'foltz', // ← FOLTZ
            channel: 'widget',
            status: 'active',
            language: 'es',
            effective_email: effectiveEmail,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (createConvError) {
          console.error('❌ [DEBUG 3] Error creating conversation:', createConvError);
          console.error('❌ [DEBUG 3] Error details:', JSON.stringify(createConvError, null, 2));
        } else {
          effectiveConversationId = newConversation?.id ?? null;
          console.log('🔍 [DEBUG 3] Created new conversation:', effectiveConversationId);
          console.log('🔍 [DEBUG 3] Conversation data:', newConversation);
        }
      }
    } else {
      console.log('🔍 [DEBUG 3] Using frontend conversationId:', effectiveConversationId, 'or no customerId');
    }

    // Load conversation history (last 20 messages)
    let conversationHistory: Array<{ role: string; content: string }> = [];
    if (effectiveConversationId) {
      const { data: historyMessages, error: historyError } = await supabaseAdmin
        .from('messages')
        .select('role, content')
        .eq('conversation_id', effectiveConversationId)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .order('created_at', { ascending: true })
        .limit(20);

      if (historyError) {
        console.error('❌ Error loading history:', historyError);
      }

      if (historyMessages) {
        // Filter out messages with null/empty content
        conversationHistory = historyMessages.filter(
          (m) => m.content && typeof m.content === 'string' && m.content.trim() !== '',
        );
        console.log(`🔍 [DEBUG 4] Loaded ${conversationHistory.length} valid history messages (${historyMessages.length} total) for conversation ${effectiveConversationId}`);
        if (conversationHistory.length > 0) {
          console.log('🔍 [DEBUG 4] Full history:', conversationHistory.map((m, i) => `[${i}] ${m.role}: ${m.content.substring(0, 100)}`));
        }
      } else {
        console.log('🔍 [DEBUG 4] No history messages found for conversation:', effectiveConversationId);
      }
    } else {
      console.log('🔍 [DEBUG 4] No conversationId, starting fresh conversation');
    }

    // Build system prompt with context
    const systemPrompt = buildFoltzWidgetPrompt({
      customerEmail: effectiveEmail ?? undefined,
      conversationId: effectiveConversationId ?? undefined,
      pageContext,
    });

    // Check if should use tools
    const useTools = shouldUseTool(userMessage);

    console.log(`🤖 AI mode: ${useTools ? 'Function calling' : 'Streaming'}`);

    // Validate userMessage is not empty
    if (!userMessage || userMessage.trim() === '') {
      console.error('❌ Empty user message');
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 },
      );
    }

    // Prepare messages for AI
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    console.log('🔍 [DEBUG 5] Preparing AI messages:', {
      total: aiMessages.length,
      system: 1,
      history: conversationHistory.length,
      currentUser: 1,
    });
    console.log('🔍 [DEBUG 5] AI messages preview:', aiMessages.map((m, i) =>
      `[${i}] ${m.role}: ${m.content.substring(0, 80)}...`
    ));

    // Double-check all messages have valid content
    const invalidMessage = aiMessages.find(
      (m) => !m.content || typeof m.content !== 'string' || m.content.trim() === '',
    );
    if (invalidMessage) {
      console.error('❌ Invalid message found:', invalidMessage);
      return NextResponse.json(
        { error: 'Invalid message in conversation history' },
        { status: 500 },
      );
    }

    // If tools needed, use function calling (non-streaming)
    if (useTools) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: aiMessages as OpenAI.ChatCompletionMessageParam[],
        tools: FOLTZ_TOOLS.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.input_schema,
          },
        })),
        tool_choice: 'auto',
        temperature: 0.7,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new Error('No response from AI');
      }

      let assistantMessage = choice.message.content || '';
      const toolCalls = choice.message.tool_calls;
      const executedTools: Array<{
        name: string;
        arguments: Record<string, unknown>;
        result: Record<string, unknown>;
      }> = [];

      // Execute tools
      if (toolCalls && toolCalls.length > 0) {
        console.log(`🔧 Executing ${toolCalls.length} tool(s)`);

        for (const toolCall of toolCalls) {
          // Type guard: ensure toolCall has function property
          if (toolCall.type !== 'function' || !('function' in toolCall)) {
            continue;
          }

          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments) as ToolInput;

          console.log(`🔧 Tool: ${toolName}`, toolArgs);

          const toolResult = await executeToolCall(toolName, toolArgs);

          executedTools.push({
            name: toolName,
            arguments: toolArgs as Record<string, unknown>,
            result: toolResult.data as Record<string, unknown>,
          });

          // Generate follow-up response with tool result
          // Ensure assistant message has valid content (OpenAI doesn't accept null)
          const assistantContent = choice.message.content ?? '';
          const toolContent = JSON.stringify(toolResult.data ?? {});

          console.log('🔍 [DEBUG 7] Assistant content before:', choice.message.content, 'after:', assistantContent, 'type:', typeof assistantContent);
          console.log('🔍 [DEBUG 7] Tool result:', toolResult.data);
          console.log('🔍 [DEBUG 7] Tool content after stringify:', toolContent, 'type:', typeof toolContent);

          const assistantMessageForFollowUp: OpenAI.ChatCompletionMessageParam = {
            role: 'assistant',
            content: assistantContent,
            tool_calls: choice.message.tool_calls,
          };

          const toolMessage: OpenAI.ChatCompletionMessageParam = {
            role: 'tool',
            content: toolContent,
            tool_call_id: toolCall.id,
          };

          console.log('🔍 [DEBUG 7] Follow-up messages to send:', [
            ...aiMessages,
            assistantMessageForFollowUp,
            toolMessage,
          ].map((m, i) => `[${i}] ${m.role}: content type=${typeof m.content}, value=${m.content === null ? 'NULL' : m.content === '' ? 'EMPTY_STRING' : `"${String(m.content).substring(0, 50)}..."`}`));

          const followUpResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              ...aiMessages,
              assistantMessageForFollowUp,
              toolMessage,
            ] as OpenAI.ChatCompletionMessageParam[],
            temperature: 0.7,
          });

          const followUpChoice = followUpResponse.choices[0];
          assistantMessage = followUpChoice?.message.content || assistantMessage;
        }
      }

      // Extract product IDs
      const productIds = extractProductIds(assistantMessage, executedTools);

      console.log('✅ Tool execution complete, response preview:', assistantMessage.substring(0, 80));

      // Save messages to database
      if (effectiveConversationId && customerId) {
        const { error: saveError } = await supabaseAdmin.from('messages').insert([
          {
            conversation_id: effectiveConversationId,
            store_id: 'foltz', // ← FOLTZ
            role: 'user',
            content: userMessage,
            created_at: new Date().toISOString(),
          },
          {
            conversation_id: effectiveConversationId,
            store_id: 'foltz', // ← FOLTZ
            role: 'assistant',
            content: assistantMessage,
            metadata: {
              productIds,
              toolCalls: executedTools,
            },
            created_at: new Date().toISOString(),
          },
        ]);

        if (saveError) {
          console.error('🔍 [DEBUG 6-TOOL] Error saving messages:', saveError);
        } else {
          console.log('🔍 [DEBUG 6-TOOL] Saved 2 messages to conversation:', effectiveConversationId);
          console.log('🔍 [DEBUG 6-TOOL] User message:', userMessage.substring(0, 50));
          console.log('🔍 [DEBUG 6-TOOL] Assistant message:', assistantMessage.substring(0, 50));

          // Verify save by counting messages
          const { count } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', effectiveConversationId);
          console.log('🔍 [DEBUG 6-TOOL] Total messages in conversation after save:', count);
        }
      } else {
        console.log('🔍 [DEBUG 6-TOOL] NOT saving messages - conversationId:', effectiveConversationId, 'customerId:', customerId);
      }

      // Return in streaming format (same as non-tool path)
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Escape quotes and newlines
          const escaped = assistantMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n');
          controller.enqueue(encoder.encode(`0:"${escaped}"\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Conversation-Id': effectiveConversationId || '',
          'X-Email': effectiveEmail || '',
          'X-Product-Ids': productIds.join(','),
        },
      });
    }

    // No tools needed - use direct response (streaming has parsing issues with Spanish)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: aiMessages as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
    });

    const assistantMessage =
      response.choices[0]?.message.content ||
      'Lo siento, no pude generar una respuesta.';

    console.log('✅ Generated response (preview):', assistantMessage.substring(0, 80));

    // Save messages to database
    if (effectiveConversationId && customerId) {
      const { error: saveError } = await supabaseAdmin.from('messages').insert([
        {
          conversation_id: effectiveConversationId,
          store_id: 'foltz',
          role: 'user',
          content: userMessage,
          created_at: new Date().toISOString(),
        },
        {
          conversation_id: effectiveConversationId,
          store_id: 'foltz',
          role: 'assistant',
          content: assistantMessage,
          created_at: new Date().toISOString(),
        },
      ]);

      if (saveError) {
        console.error('🔍 [DEBUG 6-DIRECT] Error saving messages:', saveError);
      } else {
        console.log('🔍 [DEBUG 6-DIRECT] Saved 2 messages to conversation:', effectiveConversationId);
        console.log('🔍 [DEBUG 6-DIRECT] User message:', userMessage.substring(0, 50));
        console.log('🔍 [DEBUG 6-DIRECT] Assistant message:', assistantMessage.substring(0, 50));

        // Verify save by counting messages
        const { count } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', effectiveConversationId);
        console.log('🔍 [DEBUG 6-DIRECT] Total messages in conversation after save:', count);
      }
    } else {
      console.log('🔍 [DEBUG 6-DIRECT] NOT saving messages - conversationId:', effectiveConversationId, 'customerId:', customerId);
    }

    // Return in Vercel AI SDK format (text/event-stream compatible)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the complete message at once
        controller.enqueue(encoder.encode(`0:"${assistantMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Conversation-Id': effectiveConversationId || '',
        'X-Email': effectiveEmail || '',
        'X-Product-Ids': '',
      },
    });
  } catch (error) {
    console.error('❌ Chat stream error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
