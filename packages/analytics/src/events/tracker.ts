import { supabaseAdmin } from '@snkhouse/database';
import type { AnalyticsEvent, EventType, EventData } from './types';

/**
 * Sistema de tracking de eventos de analytics
 *
 * Implementa buffering para otimizar performance e reduzir
 * chamadas ao banco de dados.
 *
 * @module events/tracker
 */

class AnalyticsTracker {
  private buffer: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 50;
  private readonly FLUSH_INTERVAL_MS = 5000; // 5 segundos

  constructor() {
    // Iniciar flush automático
    this.startAutoFlush();
  }

  /**
   * Registra um evento de analytics
   *
   * @param event_type - Tipo do evento
   * @param event_data - Dados do evento
   * @param conversation_id - ID da conversa (opcional)
   * @param metadata - Metadados adicionais (opcional)
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await tracker.track('ai_request', {
   *   model: 'gpt-4o-mini',
   *   prompt_tokens: 150,
   *   conversation_id: 'abc-123',
   *   user_message_length: 50
   * });
   * ```
   */
  async track(
    event_type: EventType,
    event_data: EventData,
    conversation_id?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        event_type,
        event_data,
        conversation_id,
        metadata: {
          ...metadata,
          tracked_at: new Date().toISOString()
        }
      };

      // Adicionar ao buffer
      this.buffer.push(event);

      // Flush se buffer cheio
      if (this.buffer.length >= this.BUFFER_SIZE) {
        await this.flush();
      }

      console.log(`📊 [Analytics] Event tracked: ${event_type}`);
    } catch (error) {
      console.error('❌ [Analytics] Error tracking event:', error);
      // Não fazer throw - tracking não deve quebrar o fluxo principal
    }
  }

  /**
   * Força flush do buffer para o banco
   *
   * @returns Promise<void>
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const eventsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      const { error } = await supabaseAdmin
        .from('analytics_events')
        .insert(eventsToFlush);

      if (error) throw error;

      console.log(`✅ [Analytics] Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      console.error('❌ [Analytics] Error flushing events:', error);
      // Re-adicionar ao buffer em caso de erro
      this.buffer.push(...eventsToFlush);
    }
  }

  /**
   * Inicia flush automático periódico
   */
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Para flush automático (cleanup)
   *
   * @returns Promise<void>
   */
  async stop(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flush(); // Flush final
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();

/**
 * Helpers para tracking específico
 */

/**
 * Rastreia uma requisição para a IA
 *
 * @param data - Dados da requisição
 * @returns Promise<void>
 */
export async function trackAIRequest(data: {
  model: string;
  prompt_tokens: number;
  conversation_id: string;
  user_message: string;
}): Promise<void> {
  await analyticsTracker.track('ai_request', {
    model: data.model,
    prompt_tokens: data.prompt_tokens,
    conversation_id: data.conversation_id,
    user_message_length: data.user_message.length
  }, data.conversation_id);
}

/**
 * Rastreia uma resposta da IA
 *
 * @param data - Dados da resposta
 * @returns Promise<void>
 */
export async function trackAIResponse(data: {
  model: string;
  completion_tokens: number;
  total_tokens: number;
  response_time_ms: number;
  conversation_id: string;
  success: boolean;
  error?: string;
}): Promise<void> {
  await analyticsTracker.track('ai_response', data, data.conversation_id);
}

/**
 * Rastreia execução de uma tool
 *
 * @param data - Dados da tool call
 * @returns Promise<void>
 */
export async function trackToolCall(data: {
  tool_name: string;
  parameters: Record<string, unknown>;
  execution_time_ms: number;
  success: boolean;
  error?: string;
  conversation_id: string;
}): Promise<void> {
  await analyticsTracker.track('tool_call', data, data.conversation_id);
}

/**
 * Rastreia busca de produto
 *
 * @param data - Dados da busca
 * @returns Promise<void>
 */
export async function trackProductSearch(data: {
  product_id?: number;
  product_name?: string;
  search_query?: string;
  tool_used: string;
  conversation_id: string;
}): Promise<void> {
  await analyticsTracker.track('product_search', data, data.conversation_id);
}

/**
 * Rastreia visualização de product card
 *
 * @param data - Dados do produto exibido
 * @returns Promise<void>
 */
export async function trackProductCardViewed(data: {
  product_id: number;
  product_name: string;
  product_price: string;
  in_stock: boolean;
  conversation_id?: string;
  source: 'widget' | 'whatsapp';
}): Promise<void> {
  await analyticsTracker.track('product_card_viewed', data, data.conversation_id);
}

/**
 * Rastreia clique em product card
 *
 * @param data - Dados do produto clicado
 * @returns Promise<void>
 */
export async function trackProductCardClicked(data: {
  product_id: number;
  product_name: string;
  product_price: string;
  in_stock: boolean;
  conversation_id?: string;
  source: 'widget' | 'whatsapp';
}): Promise<void> {
  await analyticsTracker.track('product_card_clicked', data, data.conversation_id);
}

/**
 * Rastreia adição ao carrinho
 *
 * @param data - Dados do produto adicionado
 * @returns Promise<void>
 */
export async function trackProductAddToCart(data: {
  product_id: number;
  product_name: string;
  product_price: string;
  in_stock: boolean;
  conversation_id?: string;
  source: 'widget' | 'whatsapp';
}): Promise<void> {
  await analyticsTracker.track('product_add_to_cart', data, data.conversation_id);
}
