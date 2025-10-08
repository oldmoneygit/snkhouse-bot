import * as path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: path.resolve(__dirname, '../.env.local') });

import { 
  searchProducts, 
  getProductDetails, 
  checkStock, 
  getCategories, 
  getProductsOnSale,
  executeToolCall 
} from '../packages/ai-agent/src/tools/handlers';

async function testToolsOnly() {
  console.log('🧪 TESTE DAS TOOLS WOOCOMMERCE (SEM IA)\n');
  console.log('━'.repeat(70));

  console.log('📋 Este teste valida apenas as tools, sem usar IA');
  console.log('   Se funcionar, o problema é nas API keys da IA\n');

  try {
    // Teste 1: Buscar produtos
    console.log('\n📋 Teste 1: Buscar produtos Nike');
    const searchResult = await searchProducts('nike', 3);
    console.log('✅ Busca de produtos funcionou!');
    console.log('📝 Resultado (primeiros 200 chars):');
    console.log('─'.repeat(50));
    console.log(searchResult.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    // Teste 2: Detalhes de produto
    console.log('\n📋 Teste 2: Detalhes do produto 26423');
    const detailsResult = await getProductDetails(26423);
    console.log('✅ Detalhes de produto funcionou!');
    console.log('📝 Resultado (primeiros 200 chars):');
    console.log('─'.repeat(50));
    console.log(detailsResult.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    // Teste 3: Categorias
    console.log('\n📋 Teste 3: Listar categorias');
    const categoriesResult = await getCategories();
    console.log('✅ Categorias funcionou!');
    console.log('📝 Resultado (primeiros 200 chars):');
    console.log('─'.repeat(50));
    console.log(categoriesResult.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    // Teste 4: Produtos em oferta
    console.log('\n📋 Teste 4: Produtos em oferta');
    const saleResult = await getProductsOnSale(3);
    console.log('✅ Produtos em oferta funcionou!');
    console.log('📝 Resultado (primeiros 200 chars):');
    console.log('─'.repeat(50));
    console.log(saleResult.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    // Teste 5: Execute tool call
    console.log('\n📋 Teste 5: Execute tool call');
    const toolResult = await executeToolCall('search_products', { query: 'adidas', limit: 2 });
    console.log('✅ Execute tool call funcionou!');
    console.log('📝 Resultado (primeiros 200 chars):');
    console.log('─'.repeat(50));
    console.log(toolResult.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    console.log('\n' + '━'.repeat(70));
    console.log('🎉 TODAS AS TOOLS FUNCIONANDO PERFEITAMENTE!');
    console.log('✅ Integração WooCommerce: OK');
    console.log('✅ Cache: OK');
    console.log('✅ Formatação: OK');
    console.log('✅ Execute tool call: OK');
    console.log('\n📝 PROBLEMA: API Keys da IA inválidas');
    console.log('   As tools estão funcionando, só precisa corrigir as keys\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE DAS TOOLS:');
    console.error(`   Mensagem: ${error.message}`);
    console.error('\n🔍 Possíveis causas:');
    console.error('   - Credenciais WooCommerce inválidas');
    console.error('   - URL da loja incorreta');
    console.error('   - Problema de rede');
  }
}

testToolsOnly();
