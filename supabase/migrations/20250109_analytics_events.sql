-- =====================================================
-- SNKH-15: Analytics Events Table
-- =====================================================
-- Tabela para tracking de eventos de analytics em tempo real

-- Tabela principal de eventos
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_conversation ON analytics_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_metadata ON analytics_events USING gin(metadata);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Admin pode ver tudo
CREATE POLICY "Admin can view all analytics events"
  ON analytics_events FOR SELECT
  USING (true);

-- Apenas backend pode inserir
CREATE POLICY "Service role can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE analytics_events IS 'Tabela de eventos de analytics para tracking de métricas da IA';
COMMENT ON COLUMN analytics_events.event_type IS 'Tipo do evento: ai_request, tool_call, product_search, etc.';
COMMENT ON COLUMN analytics_events.event_data IS 'Dados do evento em formato JSON';
COMMENT ON COLUMN analytics_events.conversation_id IS 'ID da conversa relacionada (opcional)';
COMMENT ON COLUMN analytics_events.metadata IS 'Metadados adicionais em formato JSON';
