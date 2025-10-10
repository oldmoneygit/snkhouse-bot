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
    try {
      // Sanitizar número (remover caracteres não numéricos)
      const sanitizedPhone = to.replace(/\D/g, '');

      const response = await this.api.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: sanitizedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      });

      console.log(`[WhatsApp] Message sent to ${sanitizedPhone.slice(0, 4)}***`);

      return {
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error('[WhatsApp] Error sending message:', {
        error: error.response?.data || error.message,
        to: to.slice(0, 4) + '***', // Sanitizar phone no log
      });

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
