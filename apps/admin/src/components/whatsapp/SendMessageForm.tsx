'use client';

/**
 * Formulário de Envio de Mensagem WhatsApp
 *
 * Features:
 * - Input de telefone
 * - Seleção de template
 * - Textarea para mensagem
 * - Upload de imagem (opcional)
 * - Envio via API
 * - Estados de loading/success/error
 */

import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { TemplateSelector } from './TemplateSelector';
import { MessageTemplate } from '@/lib/templates';

export function SendMessageForm() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateSelect = (template: MessageTemplate) => {
    setMessage(template.message);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    try {
      let imageUrl: string | undefined;

      // Step 1: Upload imagem se fornecida
      if (imageFile) {
        console.log('📤 Uploading image...');
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
        console.log('✅ Image uploaded:', imageUrl);
      }

      // Step 2: Enviar mensagem WhatsApp
      console.log('📤 Sending WhatsApp message...');
      const sendResponse = await fetch('/api/admin/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          message,
          imageUrl,
        }),
      });

      if (!sendResponse.ok) {
        const errorData = await sendResponse.json();
        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }

      const sendData = await sendResponse.json();
      console.log('✅ Message sent:', sendData);

      // Sucesso!
      setSuccess(true);
      setPhone('');
      setMessage('');
      setImageFile(null);

      // Resetar sucesso após 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = phone.trim().length > 0 && message.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selector */}
      <TemplateSelector
        onTemplateSelect={handleTemplateSelect}
        disabled={isLoading}
      />

      {/* Phone Input */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Telefone do Cliente *
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
          placeholder="Ex: 5491112345678 (apenas números)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <p className="mt-2 text-xs text-gray-500">
          Incluir código do país (ex: 54 para Argentina)
        </p>
      </div>

      {/* Message Textarea */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mensagem *
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          placeholder="Escreva sua mensagem aqui... Você pode usar variáveis como {nome}, {numero}, etc."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          required
        />
        <p className="mt-2 text-xs text-gray-500">
          Caracteres: {message.length}
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem (opcional)
        </label>
        <ImageUpload onImageSelect={setImageFile} disabled={isLoading} />
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Mensagem enviada com sucesso!
            </p>
            <p className="text-xs text-green-700 mt-1">
              A mensagem foi entregue ao cliente via WhatsApp
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Erro ao enviar</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full px-6 py-3 bg-[#FFED00] text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Enviar Mensagem
          </>
        )}
      </button>
    </form>
  );
}
