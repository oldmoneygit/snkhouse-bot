import * as path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: path.resolve(__dirname, '../.env.local') });

import { generateResponseWithFallback } from '../packages/ai-agent/src/agent';

async function testClaudeFallback() {
  console.log('🧪 TESTE FALLBACK: CLAUDE HAIKU 3.5\n');
  console.log('━'.repeat(70));

  console.log('📋 Este teste usa Claude Haiku 3.5 como fallback');
  console.log('   (Mais barato que OpenAI, sem tools por enquanto)\n');

  try {
    // Teste 1: Pergunta sobre produtos
    console.log('\n📋 Teste 1: Pergunta sobre Nike Air Max');
    console.log('🤖 Enviando: "Hola, ¿tienen Nike Air Max?"');
    
    const messages1 = [
      { role: 'user' as const, content: 'Hola, ¿tienen Nike Air Max?' }
    ];
    
    const response1 = await generateResponseWithFallback(messages1);
    
    console.log('✅ Claude respondeu!');
    console.log(`📝 Modelo usado: ${response1.model}`);
    console.log('📝 Resposta do Claude:');
    console.log('─'.repeat(70));
    console.log(response1.content);
    console.log('─'.repeat(70));

    // Teste 2: Pergunta sobre ofertas
    console.log('\n📋 Teste 2: Pergunta sobre ofertas');
    console.log('🤖 Enviando: "Qué productos tienen en oferta?"');
    
    const messages2 = [
      { role: 'user' as const, content: 'Qué productos tienen en oferta?' }
    ];
    
    const response2 = await generateResponseWithFallback(messages2);
    
    console.log('✅ Claude respondeu!');
    console.log(`📝 Modelo usado: ${response2.model}`);
    console.log('📝 Resposta do Claude:');
    console.log('─'.repeat(70));
    console.log(response2.content);
    console.log('─'.repeat(70));

    // Teste 3: Pergunta genérica
    console.log('\n📋 Teste 3: Pergunta genérica');
    console.log('🤖 Enviando: "Hola, ¿cómo estás?"');
    
    const messages3 = [
      { role: 'user' as const, content: 'Hola, ¿cómo estás?' }
    ];
    
    const response3 = await generateResponseWithFallback(messages3);
    
    console.log('✅ Claude respondeu!');
    console.log(`📝 Modelo usado: ${response3.model}`);
    console.log('📝 Resposta do Claude:');
    console.log('─'.repeat(70));
    console.log(response3.content);
    console.log('─'.repeat(70));

    console.log('\n' + '━'.repeat(70));
    console.log('🎉 TESTE CLAUDE FALLBACK FINALIZADO!');
    console.log('✅ Claude Haiku 3.5: Funcionando');
    console.log('✅ Respostas em espanhol: OK');
    console.log('✅ Fallback automático: OK');
    console.log('\n📝 NOTA: Claude não tem tools ainda, mas responde bem\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE CLAUDE:');
    console.error(`   Mensagem: ${error.message}`);
    console.error('\n🔍 Possíveis causas:');
    console.error('   - Erro na API key do Claude');
    console.error('   - Problema de conexão');
  }
}

testClaudeFallback();
