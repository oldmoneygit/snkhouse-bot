import { config } from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// Carregar .env.local da raiz do projeto
config({ path: resolve(process.cwd(), '../../.env.local') });

async function testSimpleWooCommerce() {
  console.log('🧪 TESTE SIMPLES WOOCOMMERCE API\n');
  console.log('━'.repeat(70));

  const url = process.env.WOOCOMMERCE_URL || 'https://snkhouse.com';
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

  console.log('🔍 Configuração:');
  console.log(`   URL: ${url}`);
  console.log(`   Consumer Key: ${consumerKey.substring(0, 10)}...`);
  console.log(`   Consumer Secret: ${consumerSecret.substring(0, 10)}...`);

  try {
    // Teste 1: Verificar se a API REST está acessível
    console.log('\n📋 Teste 1: Verificar API REST');
    console.log('─'.repeat(70));
    
    const apiUrl = `${url}/wp-json/wc/v3/system_status`;
    console.log(`   URL: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ API REST acessível! Status: ${response.status}`);
    console.log(`   WooCommerce Version: ${response.data.environment?.version || 'N/A'}`);

    // Teste 2: Tentar listar produtos com permissões limitadas
    console.log('\n📋 Teste 2: Listar produtos (público)');
    console.log('─'.repeat(70));
    
    const productsUrl = `${url}/wp-json/wc/v3/products?per_page=3`;
    console.log(`   URL: ${productsUrl}`);
    
    const productsResponse = await axios.get(productsUrl, {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Produtos acessíveis! ${productsResponse.data.length} encontrados`);
    productsResponse.data.forEach((product: any, i: number) => {
      console.log(`   ${i + 1}. ${product.name} - R$ ${product.price}`);
    });

    console.log('\n' + '━'.repeat(70));
    console.log('✅ TESTE SIMPLES PASSOU!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n💡 SOLUÇÃO:');
        console.error('   1. Verifique se as credenciais estão corretas');
        console.error('   2. Verifique se a API REST está habilitada no WooCommerce');
        console.error('   3. Verifique se as chaves têm permissão de leitura');
        console.error('   4. Acesse: WooCommerce > Configurações > Avançado > API REST');
      }
    }
    
    process.exit(1);
  }
}

testSimpleWooCommerce();
