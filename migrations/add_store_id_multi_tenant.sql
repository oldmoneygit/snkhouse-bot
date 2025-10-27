-- =====================================================
-- MIGRATION: Add Multi-Store Support (Tenant Isolation)
-- Date: 2025-01-27
-- Purpose: Add store_id column to support FOLTZ + SNKHOUSE
-- =====================================================

-- IMPORTANT: Run this migration in Supabase SQL Editor
-- This will NOT break existing SNKHOUSE data

BEGIN;

-- =====================================================
-- STEP 1: Add store_id column to customers table
-- =====================================================
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS store_id TEXT NOT NULL DEFAULT 'snkhouse';

-- Backfill existing data
UPDATE customers
SET store_id = 'snkhouse'
WHERE store_id IS NULL OR store_id = '';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_customers_store
ON customers(store_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_customers_store_email
ON customers(store_id, email);

-- Add comment
COMMENT ON COLUMN customers.store_id IS 'Store identifier: snkhouse | foltz';


-- =====================================================
-- STEP 2: Add store_id column to conversations table
-- =====================================================
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS store_id TEXT NOT NULL DEFAULT 'snkhouse';

-- Backfill existing data
UPDATE conversations
SET store_id = 'snkhouse'
WHERE store_id IS NULL OR store_id = '';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_store
ON conversations(store_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_store_status
ON conversations(store_id, status);

CREATE INDEX IF NOT EXISTS idx_conversations_store_customer
ON conversations(store_id, customer_id);

-- Add comment
COMMENT ON COLUMN conversations.store_id IS 'Store identifier: snkhouse | foltz';


-- =====================================================
-- STEP 3: Add store_id column to messages table
-- =====================================================
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS store_id TEXT NOT NULL DEFAULT 'snkhouse';

-- Backfill existing data (join with conversations to get store_id)
UPDATE messages m
SET store_id = c.store_id
FROM conversations c
WHERE m.conversation_id = c.id;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_store
ON messages(store_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_messages_store_conversation
ON messages(store_id, conversation_id);

-- Add comment
COMMENT ON COLUMN messages.store_id IS 'Store identifier: snkhouse | foltz';


-- =====================================================
-- STEP 4: Optional - Row Level Security (RLS)
-- =====================================================
-- Uncomment this section if you want database-level isolation
-- For now, we'll handle isolation in application code

/*
-- Enable RLS on tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (example for service role - adjust as needed)
CREATE POLICY "Service role can access all stores" ON customers
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can access all stores" ON conversations
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can access all stores" ON messages
  FOR ALL
  TO service_role
  USING (true);
*/


-- =====================================================
-- STEP 5: Verification Queries
-- =====================================================
-- Run these after migration to verify:

-- Check customers distribution
-- SELECT store_id, COUNT(*) as count FROM customers GROUP BY store_id;

-- Check conversations distribution
-- SELECT store_id, COUNT(*) as count FROM conversations GROUP BY store_id;

-- Check messages distribution
-- SELECT store_id, COUNT(*) as count FROM messages GROUP BY store_id;

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('customers', 'conversations', 'messages');

COMMIT;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS idx_customers_store;
DROP INDEX IF EXISTS idx_customers_store_email;
DROP INDEX IF EXISTS idx_conversations_store;
DROP INDEX IF EXISTS idx_conversations_store_status;
DROP INDEX IF EXISTS idx_conversations_store_customer;
DROP INDEX IF EXISTS idx_messages_store;
DROP INDEX IF EXISTS idx_messages_store_conversation;

-- Remove columns
ALTER TABLE customers DROP COLUMN IF EXISTS store_id;
ALTER TABLE conversations DROP COLUMN IF EXISTS store_id;
ALTER TABLE messages DROP COLUMN IF EXISTS store_id;

COMMIT;
*/
