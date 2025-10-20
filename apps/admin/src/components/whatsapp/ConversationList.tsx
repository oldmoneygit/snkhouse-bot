/**
 * Lista de Conversas WhatsApp
 *
 * Mostra conversas recentes do canal WhatsApp
 * (Server Component - busca dados direto do Supabase)
 */

import { supabase } from '@snkhouse/database';
import { MessageSquare, Phone } from 'lucide-react';
import Link from 'next/link';

async function getWhatsAppConversations() {
  const { data: conversations } = await supabase
    .from('conversations')
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      customer:customers(name, whatsapp_name, phone)
    `
    )
    .eq('channel', 'whatsapp')
    .order('updated_at', { ascending: false })
    .limit(10);

  return conversations || [];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Agora';
  if (hours < 24) return `Há ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Há ${days}d`;

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export async function ConversationList() {
  const conversations = await getWhatsAppConversations();

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 text-sm">
          Nenhuma conversa no WhatsApp ainda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Conversas Recentes
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Últimas 10 conversas do WhatsApp
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {conversations.map((conv: any) => {
          const customerName =
            conv.customer?.whatsapp_name ||
            conv.customer?.name ||
            'Cliente Anônimo';
          const phone = conv.customer?.phone || 'Sem telefone';

          return (
            <Link
              key={conv.id}
              href={`/conversations/${conv.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {customerName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-600">{phone}</p>
                  </div>
                </div>

                {/* Status & Time */}
                <div className="flex items-center gap-3 ml-4">
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
                  <p className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(conv.updated_at)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Ver Todas */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Link
          href="/conversations?channel=whatsapp"
          className="text-sm font-medium text-gray-900 hover:text-[#FFED00] transition-colors"
        >
          Ver todas as conversas →
        </Link>
      </div>
    </div>
  );
}
