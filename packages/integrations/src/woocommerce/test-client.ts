import { config } from 'dotenv';
import { resolve } from 'path';
import { getWooCommerceClient } from './client';

// Carregar .env.local da raiz do projeto
config({ path: resolve(process.cwd(), '../../.env.local') });

async function testWooCommerceClient() {
  console.log('🧪 TESTANDO WOOCOMMERCE CLIENT\n');
  console.log('━'.repeat(70));

  try {
    const client = getWooCommerceClient();

    // Teste 1: Listar produtos
    console.log('\n📋 Teste 1: Listar produtos');
    console.log('─'.repeat(70));
    const products = await client.getProducts({ per_page: 5 });
    console.log(`✅ ${products.length} produtos encontrados`);
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - R$ ${p.price} (${p.stock_status})`);
    });

    // Teste 2: Buscar produto específico
    if (products.length > 0) {
      console.log('\n📋 Teste 2: Buscar produto por ID');
      console.log('─'.repeat(70));
      const product = await client.getProduct(products[0].id);
      if (product) {
        console.log(`✅ Produto: ${product.name}`);
        console.log(`   Preço: R$ ${product.price}`);
        console.log(`   Estoque: ${product.stock_status}`);
        console.log(`   Categorias: ${product.categories.map(c => c.name).join(', ')}`);
      }
    }

    // Teste 3: Pesquisar produtos
    console.log('\n📋 Teste 3: Pesquisar "nike"');
    console.log('─'.repeat(70));
    const searchResults = await client.searchProducts('nike', 3);
    console.log(`✅ ${searchResults.length} resultados encontrados`);
    searchResults.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
    });

    // Teste 4: Listar categorias
    console.log('\n📋 Teste 4: Listar categorias');
    console.log('─'.repeat(70));
    const categories = await client.getCategories();
    console.log(`✅ ${categories.length} categorias encontradas`);
    categories.slice(0, 5).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.count} produtos)`);
    });

    // Teste 5: Cache
    console.log('\n📋 Teste 5: Testar cache');
    console.log('─'.repeat(70));
    console.log('Primeira busca (sem cache):');
    await client.getProducts({ per_page: 3 });
    console.log('Segunda busca (com cache):');
    await client.getProducts({ per_page: 3 });

    // Stats
    console.log('\n📊 Cache Stats:');
    console.log(client.getCacheStats());

    console.log('\n' + '━'.repeat(70));
    console.log('✅ TODOS OS TESTES PASSARAM!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testWooCommerceClient();
