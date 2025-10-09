/**
 * Tipos de eventos de analytics
 *
 * @module events/types
 */

/**
 * Tipos de eventos suportados pelo sistema de analytics
 */
export type EventType =
  | 'ai_request'           // Request enviado para IA
  | 'ai_response'          // Resposta da IA
  | 'tool_call'            // Tool executado
  | 'product_search'       // Produto consultado
  | 'conversation_started' // Nova conversa
  | 'conversation_ended'   // Conversa finalizada
  | 'error'                // Erro ocorrido
  | 'user_feedback';       // Feedback do usuário

/**
 * Dados de evento: AI Request
 */
export interface AIRequestEvent {
  model: string;
  prompt_tokens: number;
  conversation_id: string;
  user_message_length: number;
}

/**
 * Dados de evento: AI Response
 */
export interface AIResponseEvent {
  model: string;
  completion_tokens: number;
  total_tokens: number;
  response_time_ms: number;
  conversation_id: string;
  success: boolean;
  error?: string;
}

/**
 * Dados de evento: Tool Call
 */
export interface ToolCallEvent {
  tool_name: string;
  parameters: Record<string, unknown>;
  execution_time_ms: number;
  success: boolean;
  error?: string;
  conversation_id: string;
}

/**
 * Dados de evento: Product Search
 */
export interface ProductSearchEvent {
  product_id?: number;
  product_name?: string;
  search_query?: string;
  tool_used: string; // search_products, get_product_details, etc.
  conversation_id: string;
}

/**
 * União de todos os tipos de evento
 */
export type EventData =
  | AIRequestEvent
  | AIResponseEvent
  | ToolCallEvent
  | ProductSearchEvent
  | Record<string, unknown>;

/**
 * Interface principal de evento
 */
export interface AnalyticsEvent {
  event_type: EventType;
  event_data: EventData;
  conversation_id?: string;
  metadata?: Record<string, unknown>;
}
