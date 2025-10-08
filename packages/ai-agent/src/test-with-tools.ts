import * as path from 'path';
import { config } from 'dotenv';

// Carregar .env.local da raiz do projeto
config({ path: path.resolve(__dirname, '../../../.env.local') });

import { generateResponse } from './agent';

async function testWithTools() {
  console.log('🧪 TESTE DO AGENTE IA COM TOOLS\n');
  console.log('━'.repeat(70));

  const testQueries = [
    'Hola, ¿tienen Nike Air Max?',
    'Qué productos tienen en oferta?',
    'Qué categorías de zapatillas tienen?',
    'Busco zapatillas Jordan, ¿tienen?',
  ];

  for (const query of testQueries) {
    console.log(`\n📋 Query: "${query}"`);
    console.log('─'.repeat(70));

    try {
      const response = await generateResponse([
        { role: 'user', content: query }
      ]);

      console.log('\n✅ Respuesta:');
      console.log(response.content);
      console.log('\n📊 Info:');
      console.log(`   Modelo: ${response.model}`);
      console.log(`   Tokens: ${response.tokensUsed || 'N/A'}`);
      console.log('\n' + '─'.repeat(70));

    } catch (error: any) {
      console.error('❌ Erro:', error.message);
    }
  }

  console.log('\n' + '━'.repeat(70));
  console.log('✅ TESTES COMPLETOS!\n');
}

testWithTools();
