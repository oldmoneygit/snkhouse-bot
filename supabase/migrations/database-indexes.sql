-- ================================================
-- SPRINT 1: DATABASE PERFORMANCE INDEXES
-- ================================================
-- Este arquivo contém os índices para otimizar queries do Widget
-- Executar no Supabase SQL Editor
--
-- Impacto esperado:
-- - Customer lookup: 50ms → 15ms (-70%)
-- - Conversation query: 100ms → 30ms (-70%)
-- - Message history: 50ms → 20ms (-60%)
-- - Total DB time: 150ms → 50ms (-67%)
-- ================================================

-- 1. Índice para customer lookup por email (query mais frequente)
-- Uso: SELECT * FROM customers WHERE email = ?
CREATE INDEX IF NOT EXISTS idx_customers_email
ON customers(email);

-- 2. Índice composto para conversas (customer + channel + status)
-- Uso: SELECT * FROM conversations WHERE customer_id = ? AND channel = ? AND status = ? ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_conversations_customer_channel_status
ON conversations(customer_id, channel, status, updated_at DESC);

-- 3. Índice composto alternativo (otimizado para busca por ID + customer)
-- Uso: SELECT * FROM conversations WHERE id = ? AND customer_id = ?
CREATE INDEX IF NOT EXISTS idx_conversations_id_customer
ON conversations(id, customer_id);

-- 4. Índice para mensagens por conversa (ordenado por data)
-- Uso: SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);

-- 5. Índice para woocommerce_id (cache lookup)
-- Uso: SELECT * FROM customers WHERE woocommerce_id = ?
CREATE INDEX IF NOT EXISTS idx_customers_woocommerce_id
ON customers(woocommerce_id);

-- ================================================
-- VERIFICAR ÍNDICES CRIADOS
-- ================================================
-- Execute esta query para verificar que os índices foram criados corretamente

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'conversations', 'messages')
ORDER BY tablename, indexname;

-- ================================================
-- ANALISAR PERFORMANCE (OPCIONAL)
-- ================================================
-- Execute EXPLAIN ANALYZE para ver o impacto dos índices nas queries

-- Exemplo 1: Customer lookup
-- EXPLAIN ANALYZE
-- SELECT * FROM customers WHERE email = 'test@example.com';

-- Exemplo 2: Conversation lookup
-- EXPLAIN ANALYZE
-- SELECT * FROM conversations
-- WHERE customer_id = 'uuid-aqui'
--   AND channel = 'widget'
--   AND status = 'active'
-- ORDER BY updated_at DESC
-- LIMIT 1;

-- Exemplo 3: Message history
-- EXPLAIN ANALYZE
-- SELECT * FROM messages
-- WHERE conversation_id = 'uuid-aqui'
-- ORDER BY created_at DESC;

-- ================================================
-- NOTAS IMPORTANTES
-- ================================================
-- 1. Índices aumentam ligeiramente o tempo de INSERT/UPDATE (trade-off aceitável)
-- 2. Índices ocupam espaço em disco (mínimo para este volume de dados)
-- 3. PostgreSQL escolhe automaticamente o melhor índice para cada query
-- 4. Índices são mantidos automaticamente pelo PostgreSQL
-- ================================================
