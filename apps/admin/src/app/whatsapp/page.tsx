/**
 * Página de Envio Manual WhatsApp
 *
 * /admin/whatsapp
 *
 * Features:
 * - Enviar mensagens/fotos manualmente para clientes
 * - Templates pré-definidos
 * - Lista de conversas recentes
 */

import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { SendMessageForm } from '@/components/whatsapp/SendMessageForm';
import { ConversationList } from '@/components/whatsapp/ConversationList';
import { Suspense } from 'react';

export const metadata = {
  title: 'WhatsApp - SNKHOUSE Admin',
  description: 'Envio manual de mensagens WhatsApp',
};

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  WhatsApp
                </h1>
                <p className="text-sm text-gray-600">
                  Envio manual de mensagens e fotos
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Envio */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Enviar Mensagem
              </h2>
              <SendMessageForm />
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                ℹ️ Como usar
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • Digite o telefone com código do país (ex: 5491112345678)
                </li>
                <li>
                  • Selecione um template ou escreva sua mensagem do zero
                </li>
                <li>
                  • Use variáveis como {'{nome}'}, {'{numero}'} nas mensagens
                </li>
                <li>
                  • Opcionalmente, adicione uma foto (max 5MB, JPG/PNG)
                </li>
                <li>
                  • A mensagem será salva no histórico da conversa
                </li>
              </ul>
            </div>
          </div>

          {/* Lista de Conversas */}
          <div>
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mt-4"></div>
                  </div>
                </div>
              }
            >
              <ConversationList />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
