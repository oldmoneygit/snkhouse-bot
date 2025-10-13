import { supabaseAdmin } from '@snkhouse/database';
import { getAIPerformanceMetrics, getWooCommerceMetrics } from './events/aggregator';

/**
 * Conversation data from Supabase with customer relation
 */
interface ConversationWithCustomer {
  customer_id: string;
  customers: {
    id: string;
    name: string | null;
    email: string;
  }[] | null;
  updated_at: string;
}

/**
 * Conversation status data
 */
interface ConversationStatus {
  status: string;
}

/**
 * Message data with timestamp
 */
interface MessageData {
  created_at: string;
}

/**
 * Message data with role for response time calculation
 */
interface MessageWithRole {
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  conversation_id: string;
}

export interface DashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalCustomers: number;
  averageMessagesPerConversation: number;
  conversationsLast24h: number;
  messagesLast24h: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    conversationCount: number;
    lastActivity: string;
  }>;
  conversationsByStatus: Array<{
    status: string;
    count: number;
  }>;
  messagesByHour: Array<{
    hour: number;
    count: number;
  }>;
  averageResponseTime: number;
  // Métricas de IA (expandidas com fallback e usage)
  aiSuccessRate: number;
  averageTokens: number;
  toolCallsTotal: number;
  // AI Fallback metrics (Claude vs ChatGPT)
  fallbackRate: number;
  claudeSuccessRate: number;
  chatgptFallbackCount: number;
  averageResponseTimeClaude: number;
  averageResponseTimeChatGPT: number;
  // Token usage metrics
  totalTokensUsed: number;
  averagePromptTokens: number;
  averageCompletionTokens: number;
  minTokens: number;
  maxTokens: number;
  estimatedCost: number;
  // Error metrics
  totalErrors: number;
  errorTypes: Array<{
    type: string;
    count: number;
  }>;
  overloadErrors: number;
  // Métricas de WooCommerce
  productsSearched: number;
  topSearchedProducts: Array<{
    name: string;
    count: number;
  }>;
}

/**
 * Coleta todas as métricas do dashboard em uma única chamada otimizada
 *
 * @returns {Promise<DashboardMetrics>} Objeto contendo todas as métricas do dashboard
 * @throws {Error} Se houver erro ao buscar dados do Supabase
 *
 * @example
 * ```typescript
 * const metrics = await getDashboardMetrics();
 * console.log(`Total conversas: ${metrics.totalConversations}`);
 * ```
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    console.log('📊 [Analytics] Coletando métricas do dashboard...');

    // 1. Total de conversas
    const { count: totalConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // 2. Conversas ativas (ativas na última 1 hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: activeConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', oneHourAgo);

    // 3. Total de mensagens
    const { count: totalMessages } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // 4. Total de clientes
    const { count: totalCustomers } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // 5. Média de mensagens por conversa
    const averageMessagesPerConversation =
      totalConversations && totalConversations > 0
        ? Math.round((totalMessages || 0) / totalConversations)
        : 0;

    // 6. Conversas nas últimas 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: conversationsLast24h } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);

    // 7. Mensagens nas últimas 24h
    const { count: messagesLast24h } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);

    // 8. Top 5 clientes mais ativos
    const { data: topCustomersData } = await supabaseAdmin
      .from('conversations')
      .select('customer_id, customers(id, name, email), updated_at')
      .not('customer_id', 'is', null)
      .order('updated_at', { ascending: false });

    // Processar top customers
    const customerMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      conversationCount: number;
      lastActivity: string;
    }>();

    topCustomersData?.forEach((conv: ConversationWithCustomer) => {
      if (conv.customer_id && conv.customers && conv.customers[0]) {
        const customer = conv.customers[0];
        const existing = customerMap.get(conv.customer_id);
        if (existing) {
          existing.conversationCount++;
          if (new Date(conv.updated_at) > new Date(existing.lastActivity)) {
            existing.lastActivity = conv.updated_at;
          }
        } else {
          customerMap.set(conv.customer_id, {
            id: customer.id,
            name: customer.name || 'Cliente sem nome',
            email: customer.email,
            conversationCount: 1,
            lastActivity: conv.updated_at,
          });
        }
      }
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.conversationCount - a.conversationCount)
      .slice(0, 5);

    // 9. Conversas por status
    const { data: statusData } = await supabaseAdmin
      .from('conversations')
      .select('status');

    const statusMap = new Map<string, number>();
    statusData?.forEach((conv: ConversationStatus) => {
      const status = conv.status || 'unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const conversationsByStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    // 10. Mensagens por hora (últimas 24h)
    const { data: recentMessages } = await supabaseAdmin
      .from('messages')
      .select('created_at')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: true });

    const hourMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, 0);
    }

    recentMessages?.forEach((msg: MessageData) => {
      const hour = new Date(msg.created_at).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const messagesByHour = Array.from(hourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);

    // 11. Tempo médio de resposta (simplificado)
    // Calcula a diferença média entre mensagens do usuário e do assistente
    const { data: messagesForResponseTime } = await supabaseAdmin
      .from('messages')
      .select('role, created_at, conversation_id')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: true });

    let totalResponseTime = 0;
    let responseCount = 0;

    if (messagesForResponseTime && messagesForResponseTime.length > 1) {
      for (let i = 1; i < messagesForResponseTime.length; i++) {
        const current = messagesForResponseTime[i] as MessageWithRole;
        const previous = messagesForResponseTime[i - 1] as MessageWithRole;

        // Se anterior é user e atual é assistant, na mesma conversa
        if (
          previous.role === 'user' &&
          current.role === 'assistant' &&
          previous.conversation_id === current.conversation_id
        ) {
          const responseTime =
            new Date(current.created_at).getTime() -
            new Date(previous.created_at).getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }

    const averageResponseTime =
      responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000) : 0; // em segundos

    // 12. Métricas de IA (DADOS REAIS!)
    const aiMetrics = await getAIPerformanceMetrics();

    // 13. Métricas de WooCommerce (DADOS REAIS!)
    const wooMetrics = await getWooCommerceMetrics();

    console.log('✅ [Analytics] Métricas coletadas com sucesso (incluindo dados REAIS de IA e WooCommerce)');

    return {
      totalConversations: totalConversations || 0,
      activeConversations: activeConversations || 0,
      totalMessages: totalMessages || 0,
      totalCustomers: totalCustomers || 0,
      averageMessagesPerConversation,
      conversationsLast24h: conversationsLast24h || 0,
      messagesLast24h: messagesLast24h || 0,
      topCustomers,
      conversationsByStatus,
      messagesByHour,
      averageResponseTime,
      // Métricas de IA (REAIS)
      aiSuccessRate: aiMetrics.aiSuccessRate,
      averageTokens: aiMetrics.averageTokens,
      toolCallsTotal: aiMetrics.toolCallsTotal,
      // AI Fallback metrics
      fallbackRate: aiMetrics.fallbackRate,
      claudeSuccessRate: aiMetrics.claudeSuccessRate,
      chatgptFallbackCount: aiMetrics.chatgptFallbackCount,
      averageResponseTimeClaude: aiMetrics.averageResponseTimeClaude,
      averageResponseTimeChatGPT: aiMetrics.averageResponseTimeChatGPT,
      // Token usage metrics
      totalTokensUsed: aiMetrics.totalTokensUsed,
      averagePromptTokens: aiMetrics.averagePromptTokens,
      averageCompletionTokens: aiMetrics.averageCompletionTokens,
      minTokens: aiMetrics.minTokens,
      maxTokens: aiMetrics.maxTokens,
      estimatedCost: aiMetrics.estimatedCost,
      // Error metrics
      totalErrors: aiMetrics.totalErrors,
      errorTypes: aiMetrics.errorTypes,
      overloadErrors: aiMetrics.overloadErrors,
      // Métricas de WooCommerce (REAIS)
      productsSearched: wooMetrics.productsSearched,
      topSearchedProducts: wooMetrics.topSearchedProducts,
    };
  } catch (error) {
    console.error('❌ [Analytics] Erro ao coletar métricas:', error);
    throw error;
  }
}
