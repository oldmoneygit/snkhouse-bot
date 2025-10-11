import axios, { AxiosInstance } from 'axios';

export interface SendMessageParams {
  to: string; // Número de telefone no formato internacional (sem +)
  message: string;
}

export interface MarkAsReadParams {
  messageId: string;
}

export interface WhatsAppClientConfig {
  phoneNumberId: string;
  accessToken: string;
}

export class WhatsAppClient {
  private api: AxiosInstance;
  private phoneNumberId: string;
  private accessToken: string;

  constructor(config: WhatsAppClientConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.accessToken = config.accessToken;

    this.api = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos
    });
  }

  /**
   * Envia uma mensagem de texto para um número WhatsApp
   * USANDO FETCH NATIVO COM TIMEOUT AGRESSIVO
   */
  async sendMessage({ to, message }: SendMessageParams): Promise<{ messageId: string }> {
    console.log('[WhatsAppClient] 📤 sendMessage called');
    console.log('[WhatsAppClient] 📋 Parameters:', {
      to: to.slice(0, 4) + '***',
      messageLength: message.length,
      messagePreview: message.substring(0, 50) + '...'
    });

    try {
      // Sanitizar número (remover caracteres não numéricos)
      console.log('[WhatsAppClient] 🧹 Sanitizing phone number...');
      const sanitizedPhone = to.replace(/\D/g, '');
      console.log('[WhatsAppClient] ✅ Sanitized phone:', sanitizedPhone.slice(0, 4) + '***');

      // Validar phoneNumberId
      console.log('[WhatsAppClient] 🔍 Validating phoneNumberId...');
      console.log('[WhatsAppClient] 📋 phoneNumberId:', this.phoneNumberId);

      if (!this.phoneNumberId) {
        throw new Error('phoneNumberId is missing!');
      }

      // Validar access token
      console.log('[WhatsAppClient] 🔍 Validating access token...');
      console.log('[WhatsAppClient] 📋 Token length:', this.accessToken.length);
      console.log('[WhatsAppClient] 📋 Token preview:', this.accessToken.substring(0, 20) + '...');

      if (!this.accessToken) {
        throw new Error('Access token is missing!');
      }

      if (!this.accessToken.startsWith('EAA')) {
        console.warn('[WhatsAppClient] ⚠️ Token does not start with EAA (unusual)');
      }

      // Preparar payload
      console.log('[WhatsAppClient] 📦 Preparing request payload...');
      const payload = {
        messaging_product: 'whatsapp',
        to: sanitizedPhone,
        type: 'text',
        text: {
          body: message,
        },
      };

      console.log('[WhatsAppClient] 📊 Final payload:', JSON.stringify(payload, null, 2));

      // Preparar URL
      const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
      console.log('[WhatsAppClient] 🔗 Full URL:', url);

      // Criar AbortController para timeout agressivo
      const controller = new AbortController();
      const TIMEOUT_MS = 8000; // 8 segundos

      const timeoutId = setTimeout(() => {
        console.error('[WhatsAppClient] ⏱️ TIMEOUT! Aborting request after', TIMEOUT_MS, 'ms');
        controller.abort();
      }, TIMEOUT_MS);

      console.log('[WhatsAppClient] ⏱️ Timeout set to:', TIMEOUT_MS, 'ms');

      // Preparar headers
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      console.log('[WhatsAppClient] 📋 Headers:', {
        'Authorization': `Bearer ${this.accessToken.substring(0, 20)}...`,
        'Content-Type': 'application/json',
      });

      // Log do comando curl equivalente
      const curlCommand = `curl -X POST "${url}" \\
  -H "Authorization: Bearer ${this.accessToken.substring(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`;

      console.log('[WhatsAppClient] 🧪 Equivalent curl command:');
      console.log(curlCommand);

      // FAZER A CHAMADA FETCH
      console.log('[WhatsAppClient] 🚀 Making fetch request NOW...');
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      console.log('[WhatsAppClient] ✅ Response received in', duration, 'ms');
      console.log('[WhatsAppClient] 📊 Status:', response.status, response.statusText);

      // Ler response body
      const responseText = await response.text();
      console.log('[WhatsAppClient] 📄 Response body:', responseText);

      // Verificar se foi sucesso
      if (!response.ok) {
        console.error('[WhatsAppClient] ❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });
        throw new Error(`Meta API error: ${response.status} - ${responseText}`);
      }

      // Parse JSON
      const data = JSON.parse(responseText);
      console.log('[WhatsAppClient] 📊 Parsed response data:', JSON.stringify(data, null, 2));

      // Extrair messageId
      const messageId = data.messages?.[0]?.id;

      if (!messageId) {
        console.error('[WhatsAppClient] ❌ No messageId in response!');
        throw new Error('No messageId in Meta API response');
      }

      console.log('[WhatsAppClient] ✅✅✅ MESSAGE SENT SUCCESSFULLY! ✅✅✅');
      console.log('[WhatsAppClient] 🆔 Message ID:', messageId);

      return { messageId };

    } catch (error: any) {
      console.error('[WhatsAppClient] ❌ FETCH ERROR:', {
        name: error.name,
        message: error.message,
        code: error.code,
        cause: error.cause,
        isAbortError: error.name === 'AbortError',
        isTimeout: error.message?.includes('timeout'),
      });

      if (error.name === 'AbortError') {
        console.error('[WhatsAppClient] ⏱️ REQUEST ABORTED - Meta API timeout (8s exceeded)');
        throw new Error('Meta API timeout - request took too long (8s)');
      }

      console.error('[WhatsAppClient] 📋 Full error:', error);
      throw error;
    }
  }

  /**
   * Marca uma mensagem como lida
   */
  async markAsRead({ messageId }: MarkAsReadParams): Promise<void> {
    try {
      await this.api.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });

      console.log(`[WhatsApp] Message marked as read: ${messageId}`);
    } catch (error: any) {
      console.error('[WhatsApp] Error marking message as read:', {
        error: error.response?.data || error.message,
        messageId,
      });

      // Não lançar erro - marking as read não é crítico
    }
  }

  /**
   * Valida se um número de telefone é válido para WhatsApp
   */
  isValidPhone(phone: string): boolean {
    // Deve ter entre 10 e 15 dígitos (padrão internacional)
    const sanitized = phone.replace(/\D/g, '');
    return sanitized.length >= 10 && sanitized.length <= 15;
  }
}
