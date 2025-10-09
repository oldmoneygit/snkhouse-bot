import { supabase } from '@snkhouse/database';
import { MessageSquare, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

async function getDashboardStats() {
  // Total de conversas
  const { count: totalConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  // Conversas ativas
  const { count: activeConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Total de mensagens
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  // Conversas recentes
  const { data: recentConversations } = await supabase
    .from('conversations')
    .select(`
      id,
      channel,
      status,
      created_at,
      customer:customers(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    totalConversations: totalConversations || 0,
    activeConversations: activeConversations || 0,
    totalMessages: totalMessages || 0,
    recentConversations: recentConversations || [],
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFED00] rounded-lg flex items-center justify-center font-bold text-black">
                S
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                SNKHOUSE Admin
              </h1>
            </div>
            <nav className="flex gap-6">
              <Link
                href="/"
                className="text-gray-900 font-medium hover:text-[#FFED00]"
              >
                Dashboard
              </Link>
              <Link
                href="/conversations"
                className="text-gray-600 hover:text-gray-900"
              >
                Conversas
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Conversas"
            value={stats.totalConversations}
            icon={<MessageSquare className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Conversas Ativas"
            value={stats.activeConversations}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Total Mensagens"
            value={stats.totalMessages}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Taxa Resolução"
            value="87%"
            icon={<CheckCircle className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversas Recentes
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentConversations.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Nenhuma conversa ainda
              </div>
            ) : (
              stats.recentConversations.map((conv: any) => (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {conv.customer?.name || 'Cliente Anônimo'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {conv.customer?.email || 'Sem email'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          conv.channel === 'widget'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {conv.channel}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          conv.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : conv.status === 'resolved'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {conv.status}
                      </span>
                      <p className="text-sm text-gray-500">
                        {formatDate(conv.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Helper function
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Há poucos minutos';
  if (hours < 24) return `Há ${hours}h`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `Há ${days}d`;
  
  return date.toLocaleDateString('es-AR');
}

