/**
 * Script de teste para validar o fluxo de atualização dinâmica de email
 *
 * Testa:
 * 1. Conversa com email inicial incorreto
 * 2. Detecção de novo email na mensagem do usuário
 * 3. Busca no WooCommerce com email correto
 * 4. Resposta com dados do pedido
 */

import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

const WIDGET_API_URL = 'http://localhost:3002/api/chat';

interface TestMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function testEmailUpdateFlow() {
  console.log('🧪 [Test] Iniciando teste de atualização dinâmica de email\n');

  const testScenarios = [
    {
      name: 'Cenário 1: Email inicial errado, depois correto',
      initialEmail: 'cliente1@teste.com',
      messages: [
        { role: 'user' as const, content: 'Hola! Donde está mi pedido #23716?' },
        { role: 'user' as const, content: 'Mi email es suporte@stealthify.ai' }
      ]
    },
    {
      name: 'Cenário 2: Perguntar por pedido sem email correto',
      initialEmail: 'outro@teste.com',
      messages: [
        { role: 'user' as const, content: 'Quiero saber sobre mi pedido' },
        { role: 'user' as const, content: 'Usé el email suporte@stealthify.ai para comprar' }
      ]
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 ${scenario.name}`);
    console.log(`${'='.repeat(70)}\n`);

    let conversationId: string | null = null;
    let currentEmail = scenario.initialEmail;
    const conversationHistory: TestMessage[] = [];

    for (let i = 0; i < scenario.messages.length; i++) {
      const userMessage = scenario.messages[i];
      conversationHistory.push(userMessage);

      console.log(`👤 [${i + 1}] Usuário (${currentEmail.split('@')[0]}***):`);
      console.log(`   "${userMessage.content}"\n`);

      try {
        const response = await fetch(WIDGET_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: conversationHistory,
            conversationId,
            customerEmail: currentEmail,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`❌ Erro na API:`, error);
          continue;
        }

        const data = await response.json();

        // Verificar se email foi atualizado
        if (data.emailUpdated && data.newEmail) {
          console.log(`🔄 Email atualizado automaticamente:`);
          console.log(`   De: ${currentEmail}`);
          console.log(`   Para: ${data.newEmail}\n`);
          currentEmail = data.newEmail;
        }

        if (data.conversationId) {
          conversationId = data.conversationId;
        }

        console.log(`🤖 [${i + 1}] Assistente:`);
        console.log(`   "${data.message}"\n`);

        conversationHistory.push({
          role: 'assistant',
          content: data.message
        });

        // Análise da resposta
        if (data.message.toLowerCase().includes('email')) {
          console.log(`✅ Bot pediu confirmação de email (comportamento esperado)\n`);
        }

        if (data.message.includes('#23716') || data.message.includes('pedido')) {
          console.log(`✅ Bot conseguiu acessar informações do pedido\n`);
        }

        // Aguardar um pouco entre mensagens
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`❌ Erro no teste:`, error.message);
      }
    }

    console.log(`\n📊 Resumo do cenário:`);
    console.log(`   - Email inicial: ${scenario.initialEmail}`);
    console.log(`   - Email final: ${currentEmail}`);
    console.log(`   - Mensagens trocadas: ${conversationHistory.length}`);
    console.log(`   - Conversation ID: ${conversationId || 'não criado'}`);
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('✅ Teste completo!');
  console.log(`${'='.repeat(70)}\n`);
}

// Executar teste
testEmailUpdateFlow().catch((error) => {
  console.error('❌ Erro fatal no teste:', error);
  process.exit(1);
});
