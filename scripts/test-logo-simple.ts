import { chromium } from 'playwright';

async function testLogoSimple() {
  console.log('🎨 TESTE SIMPLES - LOGO NO BOTÃO\n');
  console.log('━'.repeat(70));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('\n📋 Acessando widget...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página carregada');

    console.log('\n📋 Capturando screenshot da logo...');
    await page.screenshot({ path: 'snkhouse-logo-botao.png' });
    console.log('✅ Screenshot salvo: snkhouse-logo-botao.png');

    console.log('\n🎉 TESTE COMPLETO!');
    console.log('📁 Verifique o arquivo: snkhouse-logo-botao.png');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
  } finally {
    await browser.close();
  }
}

testLogoSimple();
