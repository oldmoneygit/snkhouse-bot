-- Migration: Add effective_email to conversations table
-- Purpose: Persist email used in conversation to avoid asking user repeatedly
-- Date: 2025-01-10

-- Add effective_email column to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS effective_email TEXT;

-- Create index for performance (common query pattern)
CREATE INDEX IF NOT EXISTS idx_conversations_effective_email
ON conversations(effective_email);

-- Add comment explaining the column
COMMENT ON COLUMN conversations.effective_email IS
'Email efetivo usado nesta conversa. Pode ser diferente do customer.email se atualizado durante a conversa. Persiste entre mensagens para evitar pedir email repetidamente.';

-- Update existing conversations to use customer email as default
UPDATE conversations c
SET effective_email = cu.email
FROM customers cu
WHERE c.customer_id = cu.id
  AND c.effective_email IS NULL;
