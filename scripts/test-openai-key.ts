import OpenAI from 'openai';
import 'dotenv/config';
import * as path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function testOpenAIKey() {
  console.log('🧪 TESTANDO OPENAI API KEY\n');
  console.log('━'.repeat(70));

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY não encontrada no .env.local');
    console.error('\n📝 COMO OBTER:');
    console.error('1. Acesse: https://platform.openai.com/api-keys');
    console.error('2. Crie uma nova key');
    console.error('3. Adicione no .env.local: OPENAI_API_KEY=sk-proj-...');
    process.exit(1);
  }

  console.log(`📋 API Key encontrada: ${apiKey.substring(0, 20)}...`);

  try {
    console.log('\n🔍 Testando conexão com OpenAI...');
    
    const openai = new OpenAI({ apiKey });

    // Teste simples
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Di "hola"' }],
      max_tokens: 10,
    });

    const reply = response.choices[0]?.message?.content;

    console.log('✅ OpenAI API funcionando!');
    console.log(`📝 Resposta: ${reply}`);
    console.log(`💰 Tokens usados: ${response.usage?.total_tokens || 0}`);

    console.log('\n' + '━'.repeat(70));
    console.log('✅ OPENAI API KEY VÁLIDA E FUNCIONANDO!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO AO TESTAR OPENAI API:');
    console.error(`   Status: ${error.status}`);
    console.error(`   Mensagem: ${error.message}`);

    if (error.status === 401) {
      console.error('\n🔑 A API KEY ESTÁ INVÁLIDA OU EXPIRADA!');
      console.error('\n📝 COMO CORRIGIR:');
      console.error('1. Acesse: https://platform.openai.com/api-keys');
      console.error('2. Delete a key antiga');
      console.error('3. Crie uma nova key');
      console.error('4. Atualize no .env.local');
      console.error('5. Configure billing limit: https://platform.openai.com/settings/organization/billing/limits');
    } else if (error.status === 429) {
      console.error('\n⚠️  LIMITE DE RATE EXCEDIDO');
      console.error('   Aguarde alguns minutos e tente novamente');
    } else if (error.status === 500) {
      console.error('\n⚠️  ERRO NO SERVIDOR OPENAI');
      console.error('   Problema temporário, tente novamente');
    }

    process.exit(1);
  }
}

testOpenAIKey();
