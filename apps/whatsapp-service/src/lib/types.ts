// Tipos baseados na documentação Meta Cloud API v18.0

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: WebhookValue;
  field: string;
}

export interface WebhookValue {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Contact[];
  messages?: Message[];
  statuses?: Status[];
}

export interface Contact {
  profile: {
    name: string;
  };
  wa_id: string; // WhatsApp ID (número)
}

export interface Message {
  from: string; // Número do remetente
  id: string; // ID único da mensagem
  timestamp: string; // Unix timestamp em string
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts';
  text?: {
    body: string;
  };
  // Outros tipos de mensagem podem ser adicionados depois
}

export interface Status {
  id: string; // ID da mensagem
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

export interface WebhookPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}
