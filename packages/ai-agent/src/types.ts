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

export interface AgentContext {
  conversationId?: string;
  customerId?: string | number | null; // Supabase UUID (string) or legacy numeric ID
  customerEmail?: string | null;
}
