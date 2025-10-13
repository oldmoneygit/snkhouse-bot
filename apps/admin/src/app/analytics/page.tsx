import { getDashboardMetrics } from '@snkhouse/analytics';
import type { DashboardMetrics } from '@snkhouse/analytics';

export const revalidate = 60; // ISR: revalidar a cada 60 segundos

export default async function AnalyticsPage() {
  let metrics: DashboardMetrics | null = null;
  let error: string | null = null;

  try {
    metrics = await getDashboardMetrics();
  } catch (err) {
    console.error('Erro ao carregar métricas:', err);
    error = 'Erro ao carregar métricas. Tente novamente mais tarde.';
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            {error || 'Erro desconhecido ao carregar métricas'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Métricas em tempo real do seu ecossistema SNKHOUSE</p>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Conversas"
            value={metrics.totalConversations.toString()}
            subtitle={`${metrics.conversationsLast24h} nas últimas 24h`}
            icon="💬"
            color="blue"
          />
          <MetricCard
            title="Conversas Ativas"
            value={metrics.activeConversations.toString()}
            subtitle={`${Math.round((metrics.activeConversations / Math.max(metrics.totalConversations, 1)) * 100)}% do total`}
            icon="🔥"
            color="green"
          />
          <MetricCard
            title="Total de Mensagens"
            value={metrics.totalMessages.toString()}
            subtitle={`${metrics.messagesLast24h} nas últimas 24h`}
            icon="✉️"
            color="purple"
          />
          <MetricCard
            title="Total de Clientes"
            value={metrics.totalCustomers.toString()}
            subtitle={`Média ${metrics.averageMessagesPerConversation} msgs/conversa`}
            icon="👥"
            color="orange"
          />
        </div>

        {/* AI Performance Metrics (NEW) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Taxa de Sucesso Claude"
            value={`${metrics.claudeSuccessRate}%`}
            subtitle={`${metrics.chatgptFallbackCount} fallbacks para ChatGPT`}
            icon="🤖"
            color="blue"
          />
          <MetricCard
            title="Taxa de Fallback"
            value={`${metrics.fallbackRate}%`}
            subtitle="Usando ChatGPT (gpt-4o-mini)"
            icon="🔄"
            color="orange"
          />
          <MetricCard
            title="Tokens Utilizados"
            value={metrics.totalTokensUsed.toLocaleString()}
            subtitle={`Custo estimado: $${metrics.estimatedCost.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <MetricCard
            title="Total de Erros"
            value={metrics.totalErrors.toString()}
            subtitle={`${metrics.overloadErrors} overload errors`}
            icon="⚠️"
            color="red"
          />
        </div>

        {/* AI Performance Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Response Time Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">⚡ Tempo de Resposta (IA)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Claude (Haiku)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {metrics.averageResponseTimeClaude}ms
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((metrics.averageResponseTimeClaude / 5000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">ChatGPT (gpt-4o-mini)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {metrics.averageResponseTimeChatGPT}ms
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min((metrics.averageResponseTimeChatGPT / 5000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">WhatsApp (User → Bot)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {metrics.averageResponseTime}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min((30 / Math.max(metrics.averageResponseTime, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Usage Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🎯 Uso de Tokens</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Tokens Médios por Mensagem</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {metrics.averageTokens.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min((metrics.averageTokens / 2000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Prompt (avg)</p>
                  <p className="font-semibold text-gray-900">{metrics.averagePromptTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Completion (avg)</p>
                  <p className="font-semibold text-gray-900">{metrics.averageCompletionTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Mínimo</p>
                  <p className="font-semibold text-gray-900">{metrics.minTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Máximo</p>
                  <p className="font-semibold text-gray-900">{metrics.maxTokens.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Types and Conversations Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Error Types */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🐛 Tipos de Erros</h2>
            </div>
            <div className="space-y-3">
              {metrics.errorTypes.length > 0 ? (
                metrics.errorTypes.map((errorType) => (
                  <div key={errorType.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-700">{errorType.type}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{errorType.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum erro registrado 🎉</p>
              )}
            </div>
          </div>

          {/* Conversation Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📊 Conversas por Status</h2>
            </div>
            <div className="space-y-3">
              {metrics.conversationsByStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                    <span className="text-sm text-gray-700 capitalize">{status.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WooCommerce Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Products Searched */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🛍️ WooCommerce - Produtos</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Buscas</span>
                <span className="text-2xl font-bold text-gray-900">{metrics.productsSearched}</span>
              </div>
              {metrics.topSearchedProducts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Produtos Mais Buscados:</p>
                  <div className="space-y-2">
                    {metrics.topSearchedProducts.slice(0, 5).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600 font-semibold">
                            {idx + 1}
                          </div>
                          <span className="text-sm text-gray-700">{product.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{product.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {metrics.topSearchedProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhuma busca registrada ainda</p>
              )}
            </div>
          </div>

          {/* Error Logs Viewer */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📋 Logs de Erros (últimos 30 dias)</h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metrics.errorTypes.length > 0 ? (
                <>
                  <div className="text-xs text-gray-500 mb-2">
                    Total: {metrics.totalErrors} erros | {metrics.overloadErrors} overload
                  </div>
                  {metrics.errorTypes.map((errorType, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 border border-red-100 rounded text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-red-700">{errorType.type}</span>
                        <span className="text-red-600 text-xs">{errorType.count}x</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {errorType.type === 'AI_RetryError' && 'Falha após múltiplas tentativas (Claude API)'}
                        {errorType.type === 'ApiCallError' && 'Erro na chamada da API'}
                        {errorType.type === 'TimeoutError' && 'Timeout na requisição'}
                        {errorType.type === 'Unknown' && 'Erro não classificado'}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm">Nenhum erro registrado nos últimos 30 dias!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages by Hour Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📈 Mensagens por Hora (últimas 24h)</h2>
          <div className="h-64">
            <BarChart data={metrics.messagesByHour} />
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🏆 Top 5 Clientes Mais Ativos</h2>
          <div className="space-y-4">
            {metrics.topCustomers.map((customer, idx) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full text-black font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{customer.conversationCount} conversas</p>
                  <p className="text-sm text-gray-600">
                    Última: {new Date(customer.lastActivity).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {metrics.topCustomers.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhum cliente com conversas ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// Bar Chart Component
interface BarChartProps {
  data: Array<{ hour: number; count: number }>;
}

function BarChart({ data }: BarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 200;

  return (
    <div className="flex items-end justify-between h-full space-x-1">
      {data.map((item) => {
        const barHeight = (item.count / maxCount) * chartHeight;
        return (
          <div key={item.hour} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: chartHeight }}>
              {/* Tooltip */}
              {item.count > 0 && (
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.count} msgs
                </div>
              )}
              {/* Bar */}
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-colors"
                style={{ height: `${barHeight}px`, minHeight: item.count > 0 ? '2px' : '0px' }}
              ></div>
            </div>
            {/* Label */}
            <div className="text-xs text-gray-600 mt-2">{item.hour}h</div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    resolved: 'bg-blue-500',
    pending: 'bg-yellow-500',
    closed: 'bg-gray-500',
  };
  return colors[status.toLowerCase()] || 'bg-gray-400';
}
