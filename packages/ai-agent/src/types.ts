// =====================================================
// TYPES PARA AI AGENT - SNKHOUSE BOT
// =====================================================

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentResponse {
  content: string;
  model?: string;
  tokensUsed?: number;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}
