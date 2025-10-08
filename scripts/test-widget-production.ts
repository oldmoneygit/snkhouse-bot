import { chromium } from 'playwright';

async function testWidgetProduction() {
  console.log('🧪 TESTE DE PRODUÇÃO - WIDGET COMPLETO\n');
  console.log('━'.repeat(70));

  const browser = await chromium.launch({ headless: false }); // Visível para ver
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Acessar página
    console.log('\n📋 Teste 1: Acessar página');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página carregada');

    // 2. Clicar no botão de chat
    console.log('\n📋 Teste 2: Abrir chat');
    const chatButton = page.locator('button[aria-label*="Abrir"]');
    await chatButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Chat aberto');

    // 3. Enviar pergunta sobre produto
    console.log('\n📋 Teste 3: Perguntar sobre Nike Air Max');
    const input = page.locator('input[aria-label="Mensaje"]');
    await input.fill('Hola, ¿tienen Nike Air Max?');
    
    const sendButton = page.locator('button[aria-label="Enviar mensaje"]');
    await sendButton.click();
    console.log('✅ Mensagem enviada');

    // 4. Aguardar resposta da IA
    console.log('\n📋 Teste 4: Aguardando resposta da IA...');
    await page.waitForTimeout(8000); // 8s para IA + tools

    // 5. Verificar se recebeu resposta
    const messages = page.locator('[class*="max-w"]');
    const count = await messages.count();
    console.log(`✅ ${count} mensagens no chat`);

    // 6. Capturar última resposta
    const lastMessage = messages.last();
    const responseText = await lastMessage.textContent();
    console.log('\n📝 Resposta da IA:');
    console.log('─'.repeat(70));
    console.log(responseText);
    console.log('─'.repeat(70));

    // 7. Verificar se a resposta contém produtos
    const hasProducts = responseText?.toLowerCase().includes('nike') || 
                       responseText?.toLowerCase().includes('producto');
    
    if (hasProducts) {
      console.log('\n✅ RESPOSTA CONTÉM PRODUTOS REAIS!');
      console.log('✅ INTEGRAÇÃO IA + WOOCOMMERCE FUNCIONANDO!');
    } else {
      console.log('\n⚠️  Resposta não contém produtos');
      console.log('   Pode ser resposta genérica ou erro');
    }

    // 8. Testar segunda pergunta
    console.log('\n📋 Teste 5: Perguntar sobre ofertas');
    await input.fill('Qué productos tienen en oferta?');
    await sendButton.click();
    await page.waitForTimeout(8000);
    console.log('✅ Segunda pergunta enviada');

    // 9. Aguardar interação manual
    console.log('\n📋 Teste 6: Interação manual');
    console.log('⏳ Teste você mesmo enviando mensagens...');
    console.log('   (O navegador ficará aberto por 2 minutos)');
    await page.waitForTimeout(120000); // 2 minutos

    console.log('\n' + '━'.repeat(70));
    console.log('✅ TESTES COMPLETOS!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  } finally {
    await browser.close();
  }
}

testWidgetProduction();
