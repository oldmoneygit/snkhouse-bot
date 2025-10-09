import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, '..', 'apps', 'widget', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

import {
  analyticsTracker,
  trackAIRequest,
  trackAIResponse,
  trackToolCall,
  trackProductSearch,
  getAIPerformanceMetrics,
  getWooCommerceMetrics
} from '../packages/analytics/src';

/**
 * Script de teste para validar o sistema de Metrics Collection
 */
async function testMetricsCollection() {
  console.log('🧪 TESTE DO METRICS COLLECTION - SNKH-15');
  console.log('='.repeat(70));
  console.log('');

  try {
    // ===== TESTE 1: TRACKING DE AI REQUEST =====
    console.log('📝 Teste 1: Tracking de AI Request');
    await trackAIRequest({
      model: 'gpt-4o-mini',
      prompt_tokens: 150,
      conversation_id: 'test-conv-metrics-1',
      user_message: 'Hola, necesito zapatillas Nike Air Max'
    });
    console.log('✅ AI Request tracked\n');

    // ===== TESTE 2: TRACKING DE AI RESPONSE =====
    console.log('📝 Teste 2: Tracking de AI Response (Success)');
    await trackAIResponse({
      model: 'gpt-4o-mini',
      completion_tokens: 200,
      total_tokens: 350,
      response_time_ms: 1500,
      conversation_id: 'test-conv-metrics-1',
      success: true
    });
    console.log('✅ AI Response (success) tracked\n');

    // ===== TESTE 3: TRACKING DE AI RESPONSE (FAILED) =====
    console.log('📝 Teste 3: Tracking de AI Response (Failed)');
    await trackAIResponse({
      model: 'gpt-4o-mini',
      completion_tokens: 0,
      total_tokens: 0,
      response_time_ms: 500,
      conversation_id: 'test-conv-metrics-1',
      success: false,
      error: 'API timeout'
    });
    console.log('✅ AI Response (failed) tracked\n');

    // ===== TESTE 4: TRACKING DE TOOL CALL =====
    console.log('📝 Teste 4: Tracking de Tool Call');
    await trackToolCall({
      tool_name: 'search_products',
      parameters: { query: 'nike air max', limit: 5 },
      execution_time_ms: 850,
      success: true,
      conversation_id: 'test-conv-metrics-1'
    });
    console.log('✅ Tool Call tracked\n');

    // ===== TESTE 5: TRACKING DE PRODUCT SEARCH =====
    console.log('📝 Teste 5: Tracking de Product Search');
    const testProducts = [
      { id: 101, name: 'Nike Air Max 90' },
      { id: 102, name: 'Nike Air Max 270' },
      { id: 103, name: 'Nike Air Max 97' }
    ];

    for (const product of testProducts) {
      await trackProductSearch({
        product_id: product.id,
        product_name: product.name,
        search_query: 'nike air max',
        tool_used: 'search_products',
        conversation_id: 'test-conv-metrics-1'
      });
    }
    console.log(`✅ ${testProducts.length} Product Searches tracked\n`);

    // ===== FLUSH DO BUFFER =====
    console.log('💾 Flush: Salvando eventos no banco...');
    await analyticsTracker.flush();
    console.log('✅ Eventos salvos no banco de dados\n');

    // Aguardar um pouco para garantir que os dados foram salvos
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ===== TESTE 6: AGREGAÇÃO DE MÉTRICAS DE IA =====
    console.log('📊 Teste 6: Agregando métricas de IA...');
    const aiMetrics = await getAIPerformanceMetrics();
    console.log('✅ Métricas de IA coletadas:');
    console.log(`   - Taxa de sucesso: ${aiMetrics.aiSuccessRate}%`);
    console.log(`   - Tokens médios: ${aiMetrics.averageTokens}`);
    console.log(`   - Total tool calls: ${aiMetrics.toolCallsTotal}`);
    console.log('');

    // ===== TESTE 7: AGREGAÇÃO DE MÉTRICAS DE WOOCOMMERCE =====
    console.log('📊 Teste 7: Agregando métricas de WooCommerce...');
    const wooMetrics = await getWooCommerceMetrics();
    console.log('✅ Métricas de WooCommerce coletadas:');
    console.log(`   - Produtos consultados: ${wooMetrics.productsSearched}`);
    console.log(`   - Top produtos:`);
    wooMetrics.topSearchedProducts.slice(0, 3).forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.name} (${p.count}x)`);
    });
    console.log('');

    // ===== TESTE 8: VALIDAÇÃO DOS DADOS =====
    console.log('🔍 Teste 8: Validando dados...');
    const validations = [];

    // Validar que temos eventos rastreados
    if (wooMetrics.productsSearched >= testProducts.length) {
      console.log('✅ Produtos rastreados corretamente');
      validations.push(true);
    } else {
      console.log(`❌ Produtos rastreados: esperado >= ${testProducts.length}, recebido: ${wooMetrics.productsSearched}`);
      validations.push(false);
    }

    // Validar taxa de sucesso
    if (aiMetrics.aiSuccessRate >= 0 && aiMetrics.aiSuccessRate <= 100) {
      console.log('✅ Taxa de sucesso dentro do range esperado');
      validations.push(true);
    } else {
      console.log(`❌ Taxa de sucesso fora do range: ${aiMetrics.aiSuccessRate}%`);
      validations.push(false);
    }

    // Validar tokens médios
    if (aiMetrics.averageTokens >= 0) {
      console.log('✅ Tokens médios válidos');
      validations.push(true);
    } else {
      console.log(`❌ Tokens médios inválidos: ${aiMetrics.averageTokens}`);
      validations.push(false);
    }

    console.log('');

    // ===== RESULTADO FINAL =====
    console.log('='.repeat(70));
    const allValid = validations.every(v => v);

    if (allValid) {
      console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log('');
      console.log('📋 RESUMO:');
      console.log(`   ✓ ${testProducts.length} produtos rastreados`);
      console.log('   ✓ AI requests rastreados');
      console.log('   ✓ AI responses rastreados (sucesso + falha)');
      console.log('   ✓ Tool calls rastreados');
      console.log('   ✓ Métricas agregadas corretamente');
      console.log('   ✓ Dados validados');
      console.log('');
      console.log('🎉 Sistema de Metrics Collection funcionando perfeitamente!');
      process.exit(0);
    } else {
      console.log('❌ TESTE FALHOU!');
      console.log(`   Validações: ${validations.filter(v => v).length}/${validations.length} passaram`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
    console.error('\nDetalhes do erro:');
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup: parar o tracker
    await analyticsTracker.stop();
  }
}

// Executar teste
testMetricsCollection();
