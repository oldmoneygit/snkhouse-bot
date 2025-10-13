import OpenAI from "openai";
import {
  ConversationMessage,
  AgentResponse,
  AgentConfig,
  AgentContext,
} from "./types";
import { buildSystemPrompt } from "./prompts";
import { TOOLS_DEFINITIONS } from "./tools/definitions";
import { executeToolCall } from "./tools/handlers";

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

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const DEFAULT_CONFIG: AgentConfig = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1000,
};

export async function generateWithOpenAI(
  messages: ConversationMessage[],
  config: Partial<AgentConfig> = {},
  context: AgentContext = {},
): Promise<AgentResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const runtimeContext: AgentContext = {
    conversationId: context.conversationId,
    customerId: context.customerId ?? null,
    customerEmail: context.customerEmail ?? null,
  };

  console.log("🚀 [OpenAI] Starting OpenAI processing...");
  console.log("🔑 [OpenAI] Checking API Key...");

  // Validar API Key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ [OpenAI] OPENAI_API_KEY not found in environment!");
    throw new Error("OpenAI API Key is missing");
  }

  if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
    console.error(
      "❌ [OpenAI] OPENAI_API_KEY format invalid (should start with sk-)",
    );
    throw new Error("OpenAI API Key format is invalid");
  }

  console.log(
    "✅ [OpenAI] API Key found:",
    process.env.OPENAI_API_KEY.substring(0, 15) + "...",
  );
  console.log("🤖 [OpenAI] Iniciando geração com tools habilitadas...");
  console.log("📊 [OpenAI] Mensagens no histórico:", messages.length);
  console.log("🔧 [OpenAI] Tools disponíveis:", TOOLS_DEFINITIONS.length);

  try {
    // Build dynamic system prompt from unified Knowledge Base (same as WhatsApp)
    const systemPrompt = buildSystemPrompt({
      hasOrdersAccess: Boolean(runtimeContext.customerId),
    });

    console.log("[OpenAI] System prompt built from unified Knowledge Base");

    if (!runtimeContext.customerId) {
      console.log(
        "[OpenAI] Tools de pedidos desabilitadas (sem customer_id no contexto)",
      );
    }
    let currentMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    // Loop para lidar com tool calls (máximo 5 iterações)
    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`🔄 [OpenAI] Iteração ${iteration}/${maxIterations}`);

      const openai = getOpenAIClient();

      console.log("[OpenAI] 🕐 Calling OpenAI API...");
      console.log("[OpenAI] 📊 Config:", {
        model: finalConfig.model,
        messagesCount: currentMessages.length,
        toolsCount: TOOLS_DEFINITIONS.length,
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
      });

      let response;
      try {
        // Criar promise com timeout de 20 segundos
        const apiCall = openai.chat.completions.create({
          model: finalConfig.model,
          messages: currentMessages as any,
          tools: TOOLS_DEFINITIONS as any,
          tool_choice: "auto",
          temperature: finalConfig.temperature,
          max_tokens: finalConfig.maxTokens,
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error("OpenAI API timeout after 20 seconds"));
          }, 20000);
        });

        console.log("[OpenAI] ⏳ Waiting for response (20s timeout)...");
        response = await Promise.race([apiCall, timeoutPromise]);
        console.log("[OpenAI] ✅ Response received from API!");
      } catch (error: any) {
        console.error("[OpenAI] ❌ API Call ERROR:", {
          name: error.name,
          message: error.message,
          apiKeyPresent: !!process.env.OPENAI_API_KEY,
        });
        throw error; // Re-throw para cair no fallback do agent.ts
      }

      const choice = response.choices[0];
      if (!choice) {
        throw new Error("OpenAI returned no choices");
      }

      const finishReason = choice.finish_reason;

      console.log(`📍 [OpenAI] Finish reason: ${finishReason}`);

      // Se não há tool calls, retornar a resposta
      if (finishReason === "stop" || !choice.message.tool_calls) {
        const content = choice.message.content || "Sin respuesta";

        console.log("✅ [OpenAI] Resposta final gerada");
        console.log("📝 [OpenAI] Preview:", content.substring(0, 100) + "...");
        console.log(
          "🎯 [OpenAI] Tokens usados:",
          response.usage?.total_tokens || 0,
        );

        return {
          content,
          model: finalConfig.model,
          tokensUsed: response.usage?.total_tokens,
        };
      }

      // Executar tool calls
      console.log(
        `🔧 [OpenAI] ${choice.message.tool_calls.length} tool calls detectadas`,
      );

      // Adicionar a mensagem do assistente (com tool calls)
      currentMessages.push(choice.message as any);

      // Executar cada tool call
      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`\n🔧 === TOOL CALL DEBUG ===`);
        console.log(`📍 Tool name: ${toolName}`);
        console.log(`📦 Original args from AI:`, toolArgs);

        const ORDERS_TOOLS = [
          "get_order_status",
          "search_customer_orders",
          "get_order_details",
          "track_shipment",
        ];
        if (ORDERS_TOOLS.includes(toolName)) {
          console.log(`🔍 This is an ORDER tool - checking context...`);
          console.log(`   Context available:`, {
            customerId: runtimeContext.customerId,
            customerEmail: runtimeContext.customerEmail
              ? sanitizeEmail(runtimeContext.customerEmail)
              : null,
          });

          if (!toolArgs.customer_id && runtimeContext.customerId) {
            // Tem customer_id numérico, usar
            toolArgs.customer_id = runtimeContext.customerId;
            console.log(
              `   ✅ Injected customer_id=${runtimeContext.customerId}`,
            );
          } else if (!toolArgs.customer_id && runtimeContext.customerEmail) {
            // Não tem customer_id mas tem email, usar email como fallback
            toolArgs.customer_id = runtimeContext.customerEmail;
            console.log(
              `   ✅ Injected customerEmail as fallback: ${sanitizeEmail(runtimeContext.customerEmail)}`,
            );
          } else if (!toolArgs.customer_id) {
            console.log(
              `   ⚠️  No customer_id in args and no context available!`,
            );
          } else {
            console.log(
              `   ℹ️  customer_id already in args: ${toolArgs.customer_id}`,
            );
          }
        }

        // Injetar conversation_id em TODAS as tools se disponível
        if (runtimeContext.conversationId && !toolArgs.conversation_id) {
          toolArgs.conversation_id = runtimeContext.conversationId;
          console.log(`   ✅ Injected conversation_id`);
        }

        console.log(`📤 Final args being passed to tool:`, toolArgs);

        try {
          console.log(`⏳ Calling executeToolCall("${toolName}", ...)...`);
          const toolResult = await executeToolCall(toolName, toolArgs);

          console.log(`✅ Tool executed successfully!`);
          console.log(`📊 Result length: ${toolResult.length} chars`);
          console.log(
            `📄 Result preview: ${toolResult.substring(0, 200)}${toolResult.length > 200 ? "..." : ""}`,
          );
          console.log(`🔧 === END TOOL CALL ===\n`);

          // Adicionar resultado da tool
          currentMessages.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: toolResult,
          } as any);
        } catch (error: any) {
          console.error(`❌ Tool execution FAILED!`);
          console.error(`   Error name: ${error.name}`);
          console.error(`   Error message: ${error.message}`);
          console.error(`   Error stack:`, error.stack);
          console.log(`🔧 === END TOOL CALL (with error) ===\n`);

          currentMessages.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: `Error ejecutando ${toolName}: ${error.message}`,
          } as any);
        }
      }
    }

    // Se chegou no máximo de iterações
    console.warn("⚠️  [OpenAI] Máximo de iterações atingido");
    return {
      content:
        "Disculpá, hubo un problema procesando tu consulta. ¿Podés reformular tu pregunta?",
      model: finalConfig.model,
    };
  } catch (error: any) {
    console.error("❌ [OpenAI] Erro:", error.message);
    throw new Error(`OpenAI Error: ${error.message}`);
  }
}
