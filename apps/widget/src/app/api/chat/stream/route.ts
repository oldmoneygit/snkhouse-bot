import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { supabaseAdmin } from "@snkhouse/database";
import { buildWidgetSystemPrompt } from "@snkhouse/ai-agent";
import { findCustomerByEmail } from "@snkhouse/integrations";

// CRITICAL: Edge runtime required for streaming
export const runtime = "edge";

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

/**
 * POST /api/chat/stream
 *
 * Streaming endpoint for real-time AI responses (word-by-word)
 * Uses Server-Sent Events (SSE) via Vercel AI SDK
 *
 * Flow:
 * 1. Load conversation history
 * 2. Build system prompt (widget-specific)
 * 3. Stream AI response (Claude 3.5 Haiku primary, GPT-4o-mini fallback)
 * 4. Return StreamingTextResponse
 *
 * Note: Messages are saved AFTER streaming completes via /api/chat/save-message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      message,
      customerEmail,
      conversationId,
      pageContext,
    }: {
      message: string;
      customerEmail: string;
      conversationId?: string;
      pageContext?: any;
    } = body;

    // Validation
    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "Mensaje requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email del cliente requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const originalEmail = customerEmail.trim().toLowerCase();
    console.log("📡 [Stream API] Starting stream for:", originalEmail);

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
    const emailMatch = message.match(EMAIL_REGEX);
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

    // 5) Load conversation history
    const { data: conversationMessages } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(10);

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

    // 7) Prepare messages for AI
    const messages = [
      ...(conversationMessages ?? []).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // 8) Stream with Claude (primary) or OpenAI (fallback)
    let streamResult;
    try {
      console.log("🤖 [Stream API] Using Claude 3.5 Haiku (primary)");

      streamResult = streamText({
        model: anthropic("claude-3-5-haiku-20241022"),
        system: systemPrompt,
        messages,
        temperature: 0.7,
      });
    } catch (error) {
      console.error(
        "⚠️ [Stream API] Claude failed, falling back to OpenAI:",
        error,
      );

      streamResult = streamText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        messages,
        temperature: 0.7,
      });
    }

    // 9) Return streaming response
    // Client will receive tokens word-by-word via SSE
    // After completion, client calls /api/chat/save-message to persist
    // Note: conversationId and other metadata passed via useChat() body

    return streamResult.toTextStreamResponse();
  } catch (error) {
    console.error("❌ [Stream API] Error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
