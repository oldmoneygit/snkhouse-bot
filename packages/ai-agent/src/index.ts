export { generateResponse, generateResponseWithFallback } from "./agent";
export { generateWithOpenAI } from "./openai-agent";
export { generateWithAnthropic } from "./anthropic-agent";
export type {
  ConversationMessage,
  AgentResponse,
  AgentConfig,
  AgentContext,
} from "./types";
export { SYSTEM_PROMPT, buildSystemPrompt } from "./prompts";
export { buildWidgetSystemPrompt } from "./prompts/widget-specific";

// Exportar unified knowledge base (shared by Widget and WhatsApp)
export { STORE_KNOWLEDGE_BASE } from "./knowledge/store-knowledge";

// Exportar tools
export { TOOLS_DEFINITIONS } from "./tools/definitions";
export { executeToolCall } from "./tools/handlers";
export * from "./tools/handlers";
