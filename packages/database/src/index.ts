import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Database operations will fail.');
}

// Cliente público (para uso no frontend)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente admin com service role (para uso no backend)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Types
export interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  channel: 'widget' | 'whatsapp';
  status: 'active' | 'resolved' | 'archived';
  language: string;
  thread_id?: string | null; // OpenAI Agent Builder thread ID for context persistence
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

