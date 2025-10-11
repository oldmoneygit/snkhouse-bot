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

  constructor(config: WhatsAppClientConfig) {
    this.phoneNumberId = config.phoneNumberId;

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

      console.log('[WhatsAppClient] 📦 Preparing request payload...');
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: sanitizedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };

      console.log('[WhatsAppClient] 📊 Payload ready:', {
        to: sanitizedPhone.slice(0, 4) + '***',
        type: payload.type,
        bodyLength: payload.text.body.length
      });

      console.log('[WhatsAppClient] 🌐 Calling Meta Graph API...');
      console.log('[WhatsAppClient] 🔗 URL:', `/${this.phoneNumberId}/messages`);
      console.log('[WhatsAppClient] ⏱️  Timeout: 10000ms');

      const response = await this.api.post(`/${this.phoneNumberId}/messages`, payload);

      console.log('[WhatsAppClient] ✅ API Response received!');
      console.log('[WhatsAppClient] 📊 Response status:', response.status);
      console.log('[WhatsAppClient] 📊 Response data:', JSON.stringify(response.data, null, 2));

      const messageId = response.data.messages[0].id;
      console.log('[WhatsAppClient] ✅ Message sent successfully!');
      console.log('[WhatsAppClient] 🆔 Message ID:', messageId);

      return { messageId };

    } catch (error: any) {
      console.error('[WhatsAppClient] ❌ ERROR in sendMessage:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      console.error('[WhatsAppClient] 📋 Error details:', {
        responseData: error.response?.data,
        to: to.slice(0, 4) + '***',
      });

      if (error.code === 'ECONNABORTED') {
        console.error('[WhatsAppClient] ⏱️  TIMEOUT ERROR - API call exceeded 10s');
      }

      if (error.response?.data) {
        console.error('[WhatsAppClient] 📄 Full error response:', JSON.stringify(error.response.data, null, 2));
      }

      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
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
