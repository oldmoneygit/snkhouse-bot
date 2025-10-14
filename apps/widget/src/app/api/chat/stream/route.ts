import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { supabaseAdmin } from "@snkhouse/database";
import { buildWidgetSystemPrompt, TOOLS_DEFINITIONS, executeToolCall } from "@snkhouse/ai-agent";
import { findCustomerByEmail } from "@snkhouse/integrations";
import { trackAIRequest, trackAIResponse } from "@snkhouse/analytics";
import {
  shouldUseTool,
  extractProductIdsFromToolCalls,
  type ToolCall,
} from "../../../../lib/product-utils";

// CRITICAL: Edge runtime required for streaming
export const runtime = "edge";

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

/**
 * PageContext interface (matching frontend)
 */
interface PageContext {
  page: 'product' | 'category' | 'cart' | 'home' | 'checkout';
  productId?: number;
  productName?: string;
  productPrice?: number;
  productInStock?: boolean;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  cartItemsCount?: number;
  cartTotal?: number;
  timestamp?: string;
}

/**
 * Request body type
 */
interface StreamRequestBody {
  messages: any[];
  customerEmail?: string;
  conversationId?: string;
  pageContext?: PageContext;
}

/**
 * Sanitiza email para logs (LGPD compliance)
 */
function sanitizeEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***@***";
  const domainParts = domain.split(".");
  const tld =
    domainParts.length > 0 ? domainParts[domainParts.length - 1] : "***";
  return `${user[0]}***@***${tld}`;
}

/**
 * POST /api/chat/stream
 *
 * Streaming endpoint compatible with useChat() hook from Vercel AI SDK
 * Uses Server-Sent Events (SSE) for real-time AI responses (word-by-word)
 *
 * Flow:
 * 1. Receive messages array from useChat()
 * 2. Load conversation history from Supabase
 * 3. Build system prompt (widget-specific)
 * 4. Stream AI response (GPT-4o-mini)
 * 5. Save messages to database on stream completion
 * 6. Return StreamingTextResponse
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // useChat() sends: { messages: Message[], data?: any }
    const incomingMessages = body.messages || [];

    if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensajes requeridas" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lastUserMessage = incomingMessages[incomingMessages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== "user") {
      return new Response(
        JSON.stringify({ error: "Última mensagem debe ser del usuario" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract metadata from useChat() body parameter
    const customerEmail: string | null = body.customerEmail?.trim()?.toLowerCase() || null;
    const conversationId: string | null = body.conversationId?.trim() || null;
    const pageContext: PageContext | undefined = body.pageContext;

    if (!customerEmail || !customerEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email del cliente requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const originalEmail = customerEmail;
    const userMessageContent = lastUserMessage.content;

    console.log("📡 [Stream API] Starting stream:", {
      email: sanitizeEmail(originalEmail),
      conversationId: conversationId || "NEW",
      messagesCount: incomingMessages.length,
      hasPageContext: !!pageContext,
      pageContextType: pageContext?.page,
    });

    // Log contexto detalhado (development only)
    if (process.env.NODE_ENV === 'development' && pageContext) {
      console.log('🎯 [Stream API] Page context:', pageContext);
    }

    // 1) Get or create customer
    const { data: existingCustomer, error: fetchCustomerError } =
      await supabaseAdmin
        .from("customers")
        .select("id, email, woocommerce_id")
        .eq("email", originalEmail)
        .maybeSingle();

    if (fetchCustomerError && fetchCustomerError.code !== "PGRST116") {
      throw fetchCustomerError;
    }

    let customerRecord;
    if (existingCustomer) {
      customerRecord = existingCustomer;
    } else {
      const { data: newCustomer, error: createCustomerError } =
        await supabaseAdmin
          .from("customers")
          .insert({
            email: originalEmail,
            name: originalEmail.split("@")[0],
          })
          .select("id, email, woocommerce_id")
          .single();

      if (createCustomerError || !newCustomer) {
        throw (
          createCustomerError || new Error("No fue posible crear el cliente")
        );
      }

      customerRecord = newCustomer;
    }

    // 2) Get or create conversation
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      // Try to find active conversation
      const { data: existingConv } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .eq("customer_id", customerRecord.id)
        .eq("channel", "widget")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingConv) {
        activeConversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createConvError } = await supabaseAdmin
          .from("conversations")
          .insert({
            customer_id: customerRecord.id,
            channel: "widget",
            status: "active",
            language: "es",
            effective_email: originalEmail,
          })
          .select("id")
          .single();

        if (createConvError || !newConv) {
          throw createConvError || new Error("Failed to create conversation");
        }

        activeConversationId = newConv.id;
      }
    }

    // 3) Detect email in message (if any)
    const emailMatch = userMessageContent.match(EMAIL_REGEX);
    let effectiveEmail = originalEmail;

    if (emailMatch) {
      effectiveEmail = emailMatch[0].toLowerCase();
      console.log("🔍 [Stream API] Email detected in message:", effectiveEmail);
    }

    // 4) Get WooCommerce customer ID
    let wooCustomerId: number | null = customerRecord.woocommerce_id ?? null;

    if (!wooCustomerId && effectiveEmail) {
      try {
        const wooCustomer = await findCustomerByEmail(effectiveEmail);
        if (wooCustomer) {
          wooCustomerId = wooCustomer.id;
          console.log(
            "✅ [Stream API] WooCommerce customer found:",
            wooCustomerId,
          );
        }
      } catch (error) {
        console.error("⚠️ [Stream API] WooCommerce lookup failed:", error);
      }
    }

    // 5) Load conversation history (including metadata for product IDs)
    const { data: conversationMessages } = await supabaseAdmin
      .from("messages")
      .select("role, content, metadata")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(50);

    // 6) Build system prompt with context
    const systemPrompt = buildWidgetSystemPrompt({
      hasOrdersAccess: Boolean(wooCustomerId),
      pageContext,
    });

    console.log(
      "🎯 [Stream API] System prompt built:",
      systemPrompt.length,
      "chars",
    );

    // 7) Track AI request
    const aiStartTime = Date.now();

    await trackAIRequest({
      model: "gpt-4o-mini",
      prompt_tokens: incomingMessages.reduce(
        (sum: number, msg: any) => sum + Math.ceil(msg.content.length / 4),
        0
      ),
      conversation_id: activeConversationId || "",
      user_message: userMessageContent,
    });

    // 8) Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 9) Prepare messages for OpenAI format
    const openaiMessages = [
      ...(conversationMessages ?? []).map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      ...incomingMessages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
    ];

    // 10) SMART ROUTING: Detect if user message needs tools
    const needsTools = shouldUseTool(userMessageContent);
    console.log(`🔧 [Stream API] Tool detection: ${needsTools ? 'TOOLS NEEDED' : 'STREAMING ONLY'}`);

    // 10a) If tools needed: Use non-streaming with function calling
    if (needsTools) {
      console.log("🤖 [Stream API] Using function calling with tools (no streaming)");

      let conversationMessages: any[] = [
        { role: "system" as const, content: systemPrompt },
        ...openaiMessages,
      ];

      let finalResponse = "";
      let allToolCalls: ToolCall[] = [];
      let iterations = 0;
      const MAX_ITERATIONS = 5;

      // Tool execution loop
      while (iterations < MAX_ITERATIONS) {
        iterations++;
        console.log(`🔧 [Stream API] Tool iteration ${iterations}/${MAX_ITERATIONS}`);

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: conversationMessages,
          tools: TOOLS_DEFINITIONS as any,
          tool_choice: "auto",
          temperature: 0.7,
          stream: false,
        });

        const assistantMessage = response.choices[0]?.message;

        if (!assistantMessage) {
          throw new Error("No response from AI");
        }

        // Check if AI wants to use tools
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          console.log(`🔧 [Stream API] AI requested ${assistantMessage.tool_calls.length} tool calls`);

          // Add assistant message with tool calls to conversation
          conversationMessages.push({
            role: "assistant",
            content: assistantMessage.content || "",
            tool_calls: assistantMessage.tool_calls as any,
          });

          // Execute each tool call
          for (const toolCall of assistantMessage.tool_calls) {
            // Type assertion for OpenAI ChatCompletionMessageToolCall
            const toolFunction = (toolCall as any).function;
            if (!toolFunction) continue;

            const toolName = toolFunction.name;
            const toolArgs = JSON.parse(toolFunction.arguments);

            console.log(`🔧 [Stream API] Executing tool: ${toolName}`, toolArgs);

            try {
              // Execute tool using @snkhouse/ai-agent handler
              const toolResult = await executeToolCall(
                toolName,
                toolArgs
              );

              console.log(`✅ [Stream API] Tool ${toolName} executed successfully`);

              // Store tool call with response
              allToolCalls.push({
                name: toolName,
                arguments: toolArgs,
                response: toolResult as any,
              });

              // Add tool result to conversation
              // If result has .formatted, send only that to AI (for search_products)
              const contentForAI = toolResult?.formatted || JSON.stringify(toolResult);

              conversationMessages.push({
                role: "tool" as const,
                tool_call_id: toolCall.id,
                content: contentForAI,
              });
            } catch (error) {
              console.error(`❌ [Stream API] Tool ${toolName} failed:`, error);

              // Add error result
              conversationMessages.push({
                role: "tool" as const,
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: "Tool execution failed",
                  message: error instanceof Error ? error.message : "Unknown error",
                }),
              });
            }
          }

          // Continue loop to get AI's final response with tool results
          continue;
        }

        // No more tool calls - AI has final response
        finalResponse = assistantMessage.content || "";
        console.log("✅ [Stream API] AI generated final response:", {
          textLength: finalResponse.length,
          totalToolCalls: allToolCalls.length,
          iterations,
        });
        break;
      }

      if (!finalResponse) {
        throw new Error("AI failed to generate final response after tool execution");
      }

      // Extract product IDs from tool calls
      const productIds = extractProductIdsFromToolCalls(allToolCalls);
      console.log(`🛍️ [Stream API] Product IDs detected: [${productIds.join(", ")}]`);

      const aiResponseTime = Date.now() - aiStartTime;

      // Save user message
      await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: activeConversationId,
          role: "user",
          content: userMessageContent,
        })
        .then(({ error }) => {
          if (error) {
            console.error("❌ [Stream API] Error saving user message:", error);
          }
        });

      // Save assistant message with product metadata
      await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: activeConversationId,
          role: "assistant",
          content: finalResponse,
          metadata: {
            toolCalls: allToolCalls,
            productIds, // For frontend to render product cards
            hasProducts: productIds.length > 0,
          },
        })
        .then(({ error }) => {
          if (error) {
            console.error("❌ [Stream API] Error saving assistant message:", error);
          }
        });

      // Track AI response
      await trackAIResponse({
        model: "gpt-4o-mini",
        completion_tokens: Math.ceil(finalResponse.length / 4),
        total_tokens: Math.ceil((userMessageContent.length + finalResponse.length) / 4),
        response_time_ms: aiResponseTime,
        conversation_id: activeConversationId || "unknown",
        success: true,
      });

      // Create a streaming-compatible response using OpenAIStream
      // We need to convert the complete response into a format that OpenAIStream can process

      // Create a fake OpenAI stream response
      const mockStreamResponse = (async function* () {
        // Split into words for progressive display
        const words = finalResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          const text = i < words.length - 1 ? words[i] + ' ' : words[i];
          yield {
            choices: [
              {
                delta: {
                  content: text,
                },
                index: 0,
                finish_reason: i === words.length - 1 ? 'stop' : null,
              },
            ],
          };
        }
      })();

      // Convert to ReadableStream using OpenAIStream
      const stream = OpenAIStream(mockStreamResponse as any);

      return new StreamingTextResponse(stream, {
        headers: {
          "X-Conversation-Id": activeConversationId || "",
          "X-Email": effectiveEmail,
          "X-Product-Ids": productIds.join(","),
        },
      });
    }

    // 10b) If no tools needed: Use streaming for better UX
    console.log("🤖 [Stream API] Using streamText (no tools, streaming enabled)");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...openaiMessages,
      ],
      temperature: 0.7,
      stream: true, // STREAMING enabled
    });

    // 11) Convert to AI SDK stream with callbacks
    let fullResponse = "";

    const stream = OpenAIStream(response as any, {
      async onStart() {
        console.log("🔄 [Stream API] Stream started");
      },
      async onToken(token: string) {
        fullResponse += token;
      },
      async onCompletion() {
        console.log("✅ [Stream API] Stream completed:", {
          textLength: fullResponse.length,
          conversationId: activeConversationId,
        });

        const aiResponseTime = Date.now() - aiStartTime;

        // Save user message
        await supabaseAdmin
          .from("messages")
          .insert({
            conversation_id: activeConversationId,
            role: "user",
            content: userMessageContent,
          })
          .then(({ error }) => {
            if (error) {
              console.error("❌ [Stream API] Error saving user message:", error);
            }
          });

        // Save assistant message
        await supabaseAdmin
          .from("messages")
          .insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: fullResponse,
          })
          .then(({ error }) => {
            if (error) {
              console.error("❌ [Stream API] Error saving assistant message:", error);
            }
          });

        // Track AI response
        await trackAIResponse({
          model: "gpt-4o-mini",
          completion_tokens: Math.ceil(fullResponse.length / 4),
          total_tokens: Math.ceil((userMessageContent.length + fullResponse.length) / 4),
          response_time_ms: aiResponseTime,
          conversation_id: activeConversationId || "unknown",
          success: true,
        });
      },
    });

    // 12) Return streaming response with metadata
    return new StreamingTextResponse(stream, {
      headers: {
        "X-Conversation-Id": activeConversationId || "",
        "X-Email": effectiveEmail,
      },
    });
  } catch (error: any) {
    console.error("❌ [Stream API] Error:", error?.message ?? error);

    try {
      await trackAIResponse({
        model: "gpt-4o-mini",
        completion_tokens: 0,
        total_tokens: 0,
        response_time_ms: 0,
        conversation_id: "error",
        success: false,
        error: error?.message ?? "unknown",
      });
    } catch (trackError) {
      console.error("❌ [Stream API] Error tracking failed:", trackError);
    }

    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        message: "Lo siento, hubo un error. Por favor intenta de nuevo.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "OK",
      message: "SNKHOUSE Widget Streaming API funcionando",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
