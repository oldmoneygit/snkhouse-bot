import axios, { AxiosInstance } from 'axios';

interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

interface SendTextMessageParams {
  number: string; // Com código país (ex: 5592916206740)
  text: string;
}

export class EvolutionAPIClient {
  private api: AxiosInstance;
  private instanceName: string;

  constructor(config: EvolutionConfig) {
    this.instanceName = config.instanceName;

    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Envia mensagem de texto
   */
  async sendTextMessage({ number, text }: SendTextMessageParams) {
    try {
      const response = await this.api.post(
        `/message/sendText/${this.instanceName}`,
        {
          number: number,
          options: {
            delay: 1200,
            presence: 'composing',
          },
          textMessage: {
            text: text,
          },
        }
      );

      console.log('[EvolutionAPI] Message sent to', number.slice(0, 4) + '***');

      return {
        success: true,
        messageId: response.data?.key?.id,
      };
    } catch (error: any) {
      console.error('[EvolutionAPI] Error sending message:', {
        error: error.response?.data || error.message,
        to: number.slice(0, 4) + '***',
      });

      throw new Error(`Failed to send Evolution message: ${error.message}`);
    }
  }

  /**
   * Verifica status da instância
   */
  async getInstanceStatus() {
    try {
      const response = await this.api.get(`/instance/connectionState/${this.instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error('[EvolutionAPI] Error getting status:', error.message);
      throw error;
    }
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageKey: any) {
    try {
      await this.api.post(`/chat/markMessageAsRead/${this.instanceName}`, {
        readMessages: [messageKey],
      });
      console.log('[EvolutionAPI] Message marked as read');
    } catch (error: any) {
      console.error('[EvolutionAPI] Error marking as read:', error.message);
      // Não crítico - não lançar erro
    }
  }
}
