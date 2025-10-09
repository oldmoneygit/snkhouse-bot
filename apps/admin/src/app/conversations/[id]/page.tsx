import { supabase } from '@snkhouse/database';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, MessageSquare } from 'lucide-react';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

async function getConversation(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const { data: conversation } = await (supabase as any)
      .from('conversations')
      .select(`
        *,
        customer:customers(*),
        messages:messages(*)
      `)
      .eq('id', id)
      .single();

    return conversation;
  } catch {
    return null;
  }
}

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const conversation = await getConversation(params.id);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Link href="/conversations" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Conversa não encontrada</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">Sem dados para esta conversa.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/conversations" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Conversa com {conversation.customer?.name || 'Cliente Anônimo'}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {conversation.customer?.email || 'Sem email'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(conversation.created_at).toLocaleDateString('es-AR')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  conversation.status === 'active' ? 'bg-green-100 text-green-700' :
                  conversation.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mensagens ({(conversation as any).messages.length})
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {(conversation as any).messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma mensagem ainda
              </p>
            ) : (
              (conversation as any).messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#FFED00] text-black'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'Cliente' : 'Assistente'}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(message.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
