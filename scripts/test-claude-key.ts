import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';
import * as path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function testClaudeKey() {
  console.log('🧪 TESTANDO CLAUDE API KEY (HAIKU 3.5)\n');
  console.log('━'.repeat(70));

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY não encontrada no .env.local');
    console.error('\n📝 COMO OBTER:');
    console.error('1. Acesse: https://console.anthropic.com/');
    console.error('2. Crie uma nova key');
    console.error('3. Adicione no .env.local: ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  console.log(`📋 API Key encontrada: ${apiKey.substring(0, 20)}...`);

  try {
    console.log('\n🔍 Testando conexão com Claude Haiku 3.5...');
    
    const anthropic = new Anthropic({ apiKey });

    // Teste simples
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Di "hola"' }],
    });

    const reply = response.content[0]?.text;

    console.log('✅ Claude Haiku 3.5 funcionando!');
    console.log(`📝 Resposta: ${reply}`);
    console.log(`💰 Tokens usados: ${response.usage?.input_tokens || 0} input + ${response.usage?.output_tokens || 0} output`);

    console.log('\n' + '━'.repeat(70));
    console.log('✅ CLAUDE HAIKU 3.5 FUNCIONANDO - MAIS BARATO QUE OPENAI!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO AO TESTAR CLAUDE API:');
    console.error(`   Status: ${error.status}`);
    console.error(`   Mensagem: ${error.message}`);

    if (error.status === 401) {
      console.error('\n🔑 A API KEY ESTÁ INVÁLIDA OU EXPIRADA!');
      console.error('\n📝 COMO CORRIGIR:');
      console.error('1. Acesse: https://console.anthropic.com/');
      console.error('2. Delete a key antiga');
      console.error('3. Crie uma nova key');
      console.error('4. Atualize no .env.local');
    } else if (error.status === 429) {
      console.error('\n⚠️  LIMITE DE RATE EXCEDIDO');
      console.error('   Aguarde alguns minutos e tente novamente');
    }

    process.exit(1);
  }
}

testClaudeKey();
