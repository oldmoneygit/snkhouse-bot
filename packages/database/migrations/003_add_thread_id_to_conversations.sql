-- Migration: Add thread_id column to conversations table
-- Purpose: Store OpenAI thread IDs for persistent conversation context
-- Date: 2025-10-11

-- Add thread_id column to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS thread_id TEXT;

-- Create index for faster lookups by thread_id
CREATE INDEX IF NOT EXISTS idx_conversations_thread_id ON conversations(thread_id);

-- Add comment explaining the column
COMMENT ON COLUMN conversations.thread_id IS 'OpenAI Agent Builder thread ID for maintaining conversation context across multiple messages';
