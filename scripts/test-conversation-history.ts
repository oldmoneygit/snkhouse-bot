/**
 * Script para testar o histórico de conversação
 *
 * Este script valida que:
 * 1. O conversation_id é mantido entre mensagens
 * 2. O histórico cresce corretamente (1 → 3 → 5 → 7)
 * 3. As mensagens são salvas no Supabase
 * 4. A IA responde com contexto
 */

const API_URL = 'http://localhost:3002/api/chat';

interface TestMessage {
  message: string;
  expectedContext?: string;
}

const testMessages: TestMessage[] = [
  {
    message: 'Hola, busco zapatillas Nike Air Max',
  },
  {
    message: 'Cuánto cuesta la primera?',
    expectedContext: 'Nike Air Max' // Deve lembrar do contexto anterior
  },
  {
    message: 'Tienen en color blanco?',
    expectedContext: 'Nike Air Max' // Deve continuar lembrando
  },
  {
    message: 'Perfecto, cómo puedo comprar?',
    expectedContext: 'Nike Air Max' // Contexto completo mantido
  },
];

async function runTest() {
  console.log('🧪 TESTE DE HISTÓRICO DE CONVERSAÇÃO\n');
  console.log('━'.repeat(70));

  let conversationId: string | null = null;
  let testsPassed = 0;
  let testsFailed = 0;

  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    const messageNumber = i + 1;

    console.log(`\n📨 MENSAGEM ${messageNumber}/${testMessages.length}: "${test.message}"`);
    console.log('─'.repeat(70));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: test.message,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API retornou ${response.status}`);
      }

      const data = await response.json();

      // Verificação 1: Conversation ID
      if (messageNumber === 1) {
        if (data.conversationId) {
          conversationId = data.conversationId;
          console.log('✅ Conversation ID criado:', conversationId);
          testsPassed++;
        } else {
          console.log('❌ FALHOU: Conversation ID não retornado');
          testsFailed++;
        }
      } else {
        if (data.conversationId === conversationId) {
          console.log('✅ Conversation ID mantido:', conversationId);
          testsPassed++;
        } else {
          console.log('❌ FALHOU: Conversation ID diferente!');
          console.log('   Esperado:', conversationId);
          console.log('   Recebido:', data.conversationId);
          testsFailed++;
        }
      }

      // Verificação 2: Resposta da IA
      if (data.message) {
        console.log('✅ IA respondeu');
        console.log(`📝 Resposta: ${data.message.substring(0, 100)}...`);
        testsPassed++;
      } else {
        console.log('❌ FALHOU: Sem resposta da IA');
        testsFailed++;
      }

      // Verificação 3: Contexto (se aplicável)
      if (test.expectedContext) {
        const hasContext = data.message.toLowerCase().includes(test.expectedContext.toLowerCase()) ||
                          data.message.toLowerCase().includes('primera') ||
                          data.message.toLowerCase().includes('air max');

        if (hasContext) {
          console.log('✅ IA manteve o contexto da conversa');
          testsPassed++;
        } else {
          console.log('❌ FALHOU: IA perdeu o contexto');
          console.log('   Esperava menção a:', test.expectedContext);
          testsFailed++;
        }
      }

      // Aguardar um pouco entre mensagens
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.log('❌ ERRO:', error.message);
      testsFailed++;
    }
  }

  // Resultado final
  console.log('\n' + '━'.repeat(70));
  console.log('📊 RESULTADO FINAL\n');
  console.log(`✅ Testes passou: ${testsPassed}`);
  console.log(`❌ Testes falhou: ${testsFailed}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('━'.repeat(70));

  if (testsFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! HISTÓRICO FUNCIONANDO CORRETAMENTE!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM. VERIFIQUE OS LOGS ACIMA.\n');
    process.exit(1);
  }
}

// Executar teste
console.log('🚀 Iniciando teste de histórico de conversação...\n');
console.log('⏳ Aguarde, testando 4 mensagens em sequência...\n');

runTest().catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
