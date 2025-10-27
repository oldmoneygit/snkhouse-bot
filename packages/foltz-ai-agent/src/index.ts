/**
 * FOLTZ AI Agent Package
 * Exports all FOLTZ-specific AI functionality
 */

// System Prompts
export {
  buildFoltzSystemPrompt,
  buildFoltzWidgetPrompt,
  buildFoltzWhatsAppPrompt,
} from './system-prompt';
export type { SystemPromptContext } from './system-prompt';

// Knowledge Base
export { getFoltzKnowledgeBase, FOLTZ_KNOWLEDGE_BASE } from './knowledge-base';

// Tools
export {
  FOLTZ_TOOLS,
  ToolName,
  searchJerseysTool,
  getProductDetailsTool,
  checkStockTool,
  getOrderStatusTool,
  getCustomerOrdersTool,
  calculateShippingTool,
} from './tools-definitions';
export type { ToolDefinition } from './tools-definitions';

// Tool Handlers
export { executeToolCall } from './tool-handlers';
export type { ToolInput, ToolResult } from './tool-handlers';
