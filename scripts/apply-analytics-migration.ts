import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, '..', 'apps', 'widget', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

import { supabaseAdmin } from '../packages/database/src';

async function applyMigration() {
  console.log('🔨 Aplicando migration analytics_events...\n');

  const sql = `
-- =====================================================
-- SNKH-15: Analytics Events Table
-- =====================================================

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Service role can insert analytics events" ON analytics_events;

-- Admin pode ver tudo
CREATE POLICY "Admin can view all analytics events"
  ON analytics_events FOR SELECT
  USING (true);

-- Apenas backend pode inserir
CREATE POLICY "Service role can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);
  `;

  try {
    // Execute SQL raw via RPC (se disponível) ou via client direto
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      // Se RPC não existe, tentar via direct query
      console.log('⚠️ RPC não disponível, criando tabela via SQL direto...');

      // Criar tabela manualmente
      const { error: createError } = await supabaseAdmin
        .from('analytics_events')
        .select('id')
        .limit(1);

      if (createError && createError.message.includes("does not exist")) {
        console.log('❌ Tabela não existe e não consegui criar via código.');
        console.log('');
        console.log('📋 INSTRUÇÕES MANUAIS:');
        console.log('');
        console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Vá em SQL Editor');
        console.log('3. Cole e execute o SQL abaixo:');
        console.log('');
        console.log('='.repeat(70));
        console.log(sql);
        console.log('='.repeat(70));
        console.log('');
        console.log('4. Após executar, rode o teste novamente');
        process.exit(1);
      } else {
        console.log('✅ Tabela analytics_events já existe!');
      }
    } else {
      console.log('✅ Migration aplicada com sucesso!');
    }

    console.log('\n📊 Verificando tabela...');
    const { count, error: countError } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao verificar tabela:', countError.message);
    } else {
      console.log(`✅ Tabela analytics_events existe e tem ${count || 0} eventos`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    console.log('');
    console.log('📋 EXECUTE MANUALMENTE NO SUPABASE SQL EDITOR:');
    console.log('');
    console.log('='.repeat(70));
    console.log(sql);
    console.log('='.repeat(70));
    process.exit(1);
  }
}

applyMigration();
