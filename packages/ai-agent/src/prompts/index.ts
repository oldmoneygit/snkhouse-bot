/**
 * Prompts Module - SNKHOUSE Agent
 *
 * Exports:
 * - buildSystemPrompt: Builds comprehensive system prompt from Knowledge Base (general)
 * - buildSimpleSystemPrompt: Builds simplified system prompt (fallback/testing)
 * - buildWidgetSystemPrompt: Builds Widget-specific system prompt (optimized for web chat)
 *
 * @module prompts
 * @version 2.0.0
 * @since 2025-01-09
 * @updated 2025-01-13
 */

export { buildSystemPrompt, buildSimpleSystemPrompt } from "./system";
export { buildWidgetSystemPrompt } from "./widget-specific";
