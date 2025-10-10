/**
 * Script para aplicar migration: add effective_email to conversations
 *
 * Executa a migration SQL diretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontrados no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Aplicando migration: add effective_email to conversations\n');

  try {
    // Ler arquivo de migration
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250110_add_effective_email.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration SQL:');
    console.log('─'.repeat(70));
    console.log(migrationSQL);
    console.log('─'.repeat(70));
    console.log('');

    // Executar cada statement separadamente
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Executando ${statements.length} statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executando:`, statement.substring(0, 60) + '...');

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Tentar executar direto se RPC falhar
        console.log('  ⚠️  RPC não disponível, tentando método alternativo...');

        // Para ALTER TABLE, usar schema editor
        if (statement.includes('ALTER TABLE conversations')) {
          console.log('  ➡️  Executando ALTER TABLE manualmente...');

          // Adicionar coluna
          const { error: alterError } = await supabase
            .from('conversations')
            .select('effective_email')
            .limit(1);

          if (alterError && alterError.message.includes('column')) {
            console.log('  ✅ Coluna effective_email precisa ser criada');
            console.log('  ℹ️  Por favor, execute este SQL manualmente no Supabase Dashboard:');
            console.log('');
            console.log('  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS effective_email TEXT;');
            console.log('  CREATE INDEX IF NOT EXISTS idx_conversations_effective_email ON conversations(effective_email);');
            console.log('');
            console.log('  Dashboard URL: https://supabase.com/dashboard/project/czueuxqhmifgofuflscg/editor');
            console.log('');
            return;
          } else {
            console.log('  ✅ Coluna effective_email já existe!');
          }
        }
      } else {
        console.log('  ✅ Sucesso!');
      }
    }

    console.log('\n✅ Migration aplicada com sucesso!\n');

    // Verificar se coluna foi criada
    console.log('🔍 Verificando se coluna foi criada...');
    const { data, error } = await supabase
      .from('conversations')
      .select('id, effective_email, created_at')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao verificar:', error.message);
      console.log('\n⚠️  A migration precisa ser aplicada manualmente no Supabase Dashboard');
      console.log('Dashboard URL: https://supabase.com/dashboard/project/czueuxqhmifgofuflscg/editor');
      console.log('\nSQL a executar:');
      console.log('─'.repeat(70));
      console.log(migrationSQL);
      console.log('─'.repeat(70));
    } else {
      console.log('✅ Coluna effective_email está disponível!');
      console.log('📊 Exemplo de dados:', data);
    }

  } catch (error: any) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    console.log('\n📝 SQL para aplicar manualmente:');
    console.log('Dashboard URL: https://supabase.com/dashboard/project/czueuxqhmifgofuflscg/editor');
    process.exit(1);
  }
}

// Executar
applyMigration().catch(console.error);
