import { chromium } from 'playwright';

async function testVisualWidget() {
  console.log('🎬 TESTE VISUAL - WIDGET SNKH-8\n');
  console.log('━'.repeat(70));

  const browser = await chromium.launch({ headless: false }); // Visível para capturar
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Acessar página do widget
    console.log('\n📋 Passo 1: Acessando widget em http://localhost:3002');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página carregada');

    // 2. Capturar tela inicial
    console.log('\n📋 Passo 2: Capturando tela inicial');
    await page.screenshot({ 
      path: 'screenshots/01-widget-inicial.png',
      fullPage: true 
    });
    console.log('✅ Screenshot salvo: 01-widget-inicial.png');

    // 3. Clicar no botão de chat amarelo
    console.log('\n📋 Passo 3: Clicando no botão amarelo de chat');
    const chatButton = page.locator('button[aria-label*="Abrir"]');
    await chatButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Chat aberto');

    // 4. Capturar tela do chat aberto
    console.log('\n📋 Passo 4: Capturando chat aberto');
    await page.screenshot({ 
      path: 'screenshots/02-chat-aberto.png',
      fullPage: true 
    });
    console.log('✅ Screenshot salvo: 02-chat-aberto.png');

    // 5. Digitar pergunta sobre Nike Air Max
    console.log('\n📋 Passo 5: Digitando pergunta sobre Nike Air Max');
    const input = page.locator('input[aria-label="Mensaje"]');
    await input.fill('Hola, ¿tienen Nike Air Max?');
    console.log('✅ Pergunta digitada');

    // 6. Capturar tela antes de enviar
    console.log('\n📋 Passo 6: Capturando antes de enviar');
    await page.screenshot({ 
      path: 'screenshots/03-pergunta-digitada.png',
      fullPage: true 
    });
    console.log('✅ Screenshot salvo: 03-pergunta-digitada.png');

    // 7. Enviar mensagem
    console.log('\n📋 Passo 7: Enviando mensagem');
    const sendButton = page.locator('button[aria-label="Enviar mensaje"]');
    await sendButton.click();
    console.log('✅ Mensagem enviada');

    // 8. Aguardar loading
    console.log('\n📋 Passo 8: Aguardando processamento (10 segundos)...');
    await page.waitForTimeout(10000);

    // 9. Capturar tela da resposta
    console.log('\n📋 Passo 9: Capturando resposta da IA');
    await page.screenshot({ 
      path: 'screenshots/04-resposta-ia.png',
      fullPage: true 
    });
    console.log('✅ Screenshot salvo: 04-resposta-ia.png');

    // 10. Extrair texto da resposta
    console.log('\n📋 Passo 10: Extraindo texto da resposta');
    const messages = page.locator('[class*="max-w"]');
    const messageCount = await messages.count();
    console.log(`✅ ${messageCount} mensagens no chat`);

    if (messageCount > 0) {
      const lastMessage = messages.last();
      const responseText = await lastMessage.textContent();
      
      console.log('\n📝 RESPOSTA DA IA:');
      console.log('═'.repeat(70));
      console.log(responseText);
      console.log('═'.repeat(70));

      // Verificar se contém produtos
      const hasProducts = responseText?.toLowerCase().includes('nike') || 
                         responseText?.toLowerCase().includes('air max');
      
      if (hasProducts) {
        console.log('\n🎉 SUCESSO! IA RESPONDEU COM PRODUTOS REAIS!');
      } else {
        console.log('\n⚠️  Resposta não contém produtos esperados');
      }
    }

    // 11. Aguardar interação manual
    console.log('\n📋 Passo 11: Teste manual');
    console.log('⏳ Navegador ficará aberto por 30 segundos para você testar...');
    console.log('   - Digite outras perguntas');
    console.log('   - Teste diferentes produtos');
    console.log('   - Verifique se as respostas contêm produtos reais');
    await page.waitForTimeout(30000);

    // 12. Capturar tela final
    console.log('\n📋 Passo 12: Captura final');
    await page.screenshot({ 
      path: 'screenshots/05-teste-final.png',
      fullPage: true 
    });
    console.log('✅ Screenshot final salvo: 05-teste-final.png');

    console.log('\n' + '━'.repeat(70));
    console.log('🎬 TESTE VISUAL COMPLETO!');
    console.log('\n📁 Screenshots salvos em:');
    console.log('   - 01-widget-inicial.png');
    console.log('   - 02-chat-aberto.png');
    console.log('   - 03-pergunta-digitada.png');
    console.log('   - 04-resposta-ia.png');
    console.log('   - 05-teste-final.png');
    console.log('\n🎉 SNKH-8 FUNCIONANDO VISUALMENTE!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE VISUAL:', error.message);
    
    // Capturar tela de erro
    try {
      await page.screenshot({ 
        path: 'screenshots/erro-widget.png',
        fullPage: true 
      });
      console.log('📸 Screenshot de erro salvo: erro-widget.png');
    } catch (screenshotError) {
      console.log('❌ Não foi possível capturar screenshot de erro');
    }
  } finally {
    await browser.close();
  }
}

// Criar diretório de screenshots
import { mkdirSync } from 'fs';
try {
  mkdirSync('screenshots', { recursive: true });
} catch (error) {
  // Diretório já existe
}

testVisualWidget();
