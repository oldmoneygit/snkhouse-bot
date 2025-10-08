import { chromium } from 'playwright';

async function testLogoVisual() {
  console.log('🎨 TESTE VISUAL - LOGO NO BOTÃO\n');
  console.log('━'.repeat(70));

  const browser = await chromium.launch({ headless: false }); // Visível para ver
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Acessar página
    console.log('\n📋 Passo 1: Acessando widget em http://localhost:3002');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página carregada');

    // 2. Capturar tela inicial com logo no botão
    console.log('\n📋 Passo 2: Capturando botão com logo da SNKHOUSE');
    await page.screenshot({ path: 'logo-botao-inicial.png' });
    console.log('✅ Screenshot salvo: logo-botao-inicial.png');

    // 3. Aguardar 5 segundos para visualização
    console.log('\n📋 Passo 3: Aguardando 5 segundos para visualização...');
    await page.waitForTimeout(5000);

    // 4. Captura final
    console.log('\n📋 Passo 4: Captura final');
    await page.screenshot({ path: 'logo-botao-final.png' });
    console.log('✅ Screenshot final salvo: logo-botao-final.png');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 TESTE VISUAL DA LOGO COMPLETO!\n');
    console.log('📁 Screenshots salvos em:');
    console.log('   - logo-botao-inicial.png');
    console.log('   - logo-botao-final.png\n');
    console.log('🎉 LOGO DA SNKHOUSE NO BOTÃO DE CHAT!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE VISUAL:', error.message);
    await page.screenshot({ path: 'erro-logo.png' });
    console.log('📸 Screenshot de erro salvo: erro-logo.png');
  } finally {
    await browser.close();
  }
}

testLogoVisual();
