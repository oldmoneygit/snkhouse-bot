import { supabase } from '@snkhouse/database';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
export const dynamic = 'force-dynamic';

async function getAllConversations() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const { data: conversations } = await (supabase as any)
      .from('conversations')
      .select(`
        id,
        channel,
        status,
        language,
        created_at,
        updated_at,
        customer:customers(name, email, phone)
      `)
      .order('updated_at', { ascending: false });

    return conversations || [];
  } catch {
    return [];
  }
}

export default async function ConversationsPage() {
  const conversations = await getAllConversations();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Todas as Conversas
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {conversations.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma conversa registrada ainda</p>
              </div>
            ) : (
              conversations.map((conv: any) => (
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
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        conv.channel === 'widget' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {conv.channel}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' :
                        conv.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {conv.status}
                      </span>
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
