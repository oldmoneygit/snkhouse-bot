import * as path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: path.resolve(__dirname, '../.env.local') });

async function testAPIRoute() {
  console.log('🧪 TESTANDO API ROUTE DO WIDGET\n');
  console.log('━'.repeat(70));

  try {
    console.log('📋 Testando: http://localhost:3002/api/chat');
    
    const response = await fetch('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Hola, ¿tienen Nike Air Max?' 
      }),
    });

    console.log(`✅ Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta da API:');
      console.log('═'.repeat(70));
      console.log(data.message);
      console.log('═'.repeat(70));
      console.log(`📝 Modelo usado: ${data.model}`);
    } else {
      const error = await response.text();
      console.log('❌ Erro na API:');
      console.log(error);
    }

  } catch (error: any) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testAPIRoute();
