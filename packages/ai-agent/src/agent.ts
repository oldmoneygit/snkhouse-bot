import { ConversationMessage, AgentResponse, AgentContext } from "./types";
import { generateWithOpenAI } from "./openai-agent";
import { generateWithAnthropic } from "./anthropic-agent";
import { FALLBACK_RESPONSE } from "./prompts";

/**
 * Gera resposta com TRIPLE FALLBACK
 * 1. OpenAI (primeiro - TEM TOOLS!)
 * 2. Claude (se OpenAI falhar)
 * 3. Mock básico (se ambos falharem)
 */
export async function generateResponseWithFallback(
  messages: ConversationMessage[],
  context: AgentContext = {},
): Promise<AgentResponse> {
  console.log("🤖 [Agent] Iniciando geração...");
  console.log(
    "🔄 [Agent] Trying OpenAI first (with tools), Claude as fallback...",
  );

  let response: AgentResponse;

  // ===========================================
  // 1️⃣ TENTAR OPENAI PRIMEIRO (COM TOOLS!)
  // ===========================================
  try {
    console.log("[Agent] 🚀 Attempting OpenAI (with WooCommerce tools)...");

    response = await Promise.race([
      generateWithOpenAI(messages, {}, context),
      new Promise<AgentResponse>((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI overall timeout")), 20000),
      ),
    ]);

    console.log("[Agent] ✅ OpenAI succeeded!");
    return response;
  } catch (openaiError: any) {
    console.error("[Agent] ❌ OpenAI failed:", openaiError.message);

    // ===========================================
    // 2️⃣ FALLBACK PARA CLAUDE
    // ===========================================
    try {
      console.log("[Agent] 🔄 Trying Claude as fallback...");

      response = await Promise.race([
        generateWithAnthropic(messages, {
          model: "claude-3-5-haiku-20241022",
        }),
        new Promise<AgentResponse>((_, reject) =>
          setTimeout(() => reject(new Error("Claude overall timeout")), 12000),
        ),
      ]);

      console.log("[Agent] ✅ Claude succeeded!");
      return response;
    } catch (claudeError: any) {
      console.error("[Agent] ❌ Claude also failed:", claudeError.message);

      // ===========================================
      // 3️⃣ ÚLTIMO FALLBACK: MOCK BÁSICO
      // ===========================================
      console.log("[Agent] ⚠️ Both AIs failed, using emergency fallback");

      return {
        content:
          "¡Hola! Soy el asistente de SNKHOUSE. Actualmente estoy experimentando problemas técnicos, pero estoy aquí para ayudarte. ¿En qué puedo asistirte?",
        model: "emergency-fallback",
      };
    }
  }
}

/**
 * Gera resposta usando apenas OpenAI (com tools)
 */
export async function generateResponse(
  messages: ConversationMessage[],
  context: AgentContext = {},
): Promise<AgentResponse> {
  console.log("🤖 [Agent] Iniciando geração com OpenAI...");
  return await generateWithOpenAI(messages, {}, context);
}
