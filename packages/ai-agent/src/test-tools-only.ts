import * as path from 'path';
import { config } from 'dotenv';

// Carregar .env.local da raiz do projeto
config({ path: path.resolve(__dirname, '../../../.env.local') });

import { searchProducts, getCategories, getProductsOnSale } from './tools/handlers';

async function testToolsOnly() {
  console.log('🧪 TESTE DAS TOOLS (SEM IA)\n');
  console.log('━'.repeat(70));

  try {
    // Teste 1: Buscar produtos Nike
    console.log('\n📋 Teste 1: Buscar produtos Nike');
    console.log('─'.repeat(50));
    const nikeProducts = await searchProducts('nike', 3);
    console.log('✅ Resultado:');
    console.log(nikeProducts);

    // Teste 2: Listar categorias
    console.log('\n📋 Teste 2: Listar categorias');
    console.log('─'.repeat(50));
    const categories = await getCategories();
    console.log('✅ Resultado:');
    console.log(categories);

    // Teste 3: Produtos em oferta
    console.log('\n📋 Teste 3: Produtos em oferta');
    console.log('─'.repeat(50));
    const saleProducts = await getProductsOnSale(5);
    console.log('✅ Resultado:');
    console.log(saleProducts);

    console.log('\n' + '━'.repeat(70));
    console.log('✅ TODOS OS TESTES DAS TOOLS PASSARAM!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
  }
}

testToolsOnly();
