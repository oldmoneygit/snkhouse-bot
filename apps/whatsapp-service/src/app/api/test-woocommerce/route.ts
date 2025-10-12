import { NextResponse } from 'next/server';
import { woocommerceClient } from '@/lib/woocommerce';

/**
 * Endpoint de diagnóstico para testar conexão WooCommerce
 * GET /api/test-woocommerce
 */
export async function GET() {
  console.log('[WooCommerce Test] Testing connection...');

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      WOOCOMMERCE_URL: process.env.WOOCOMMERCE_URL || 'NOT_SET',
      WOOCOMMERCE_CONSUMER_KEY: process.env.WOOCOMMERCE_CONSUMER_KEY ?
        `${process.env.WOOCOMMERCE_CONSUMER_KEY.substring(0, 10)}...` : 'NOT_SET',
      WOOCOMMERCE_CONSUMER_SECRET: process.env.WOOCOMMERCE_CONSUMER_SECRET ?
        `${process.env.WOOCOMMERCE_CONSUMER_SECRET.substring(0, 10)}...` : 'NOT_SET',
    },
    tests: {}
  };

  // Test 1: List products (simple GET)
  try {
    console.log('[WooCommerce Test] Test 1: Listing products...');

    const response = await woocommerceClient.get('/products', {
      params: {
        per_page: 3,
        status: 'publish',
        _fields: 'id,name,price'
      }
    });

    diagnostics.tests.listProducts = {
      status: 'SUCCESS',
      count: response.data.length,
      products: response.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price
      }))
    };

    console.log('[WooCommerce Test] ✅ Test 1 passed:', diagnostics.tests.listProducts);

  } catch (error: any) {
    diagnostics.tests.listProducts = {
      status: 'FAILED',
      error: error.message,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    };

    console.error('[WooCommerce Test] ❌ Test 1 failed:', diagnostics.tests.listProducts);
  }

  // Test 2: Search products
  try {
    console.log('[WooCommerce Test] Test 2: Searching products...');

    const response = await woocommerceClient.get('/products', {
      params: {
        search: 'jordan',
        per_page: 3,
        status: 'publish',
        _fields: 'id,name,price,stock_status'
      }
    });

    diagnostics.tests.searchProducts = {
      status: 'SUCCESS',
      query: 'jordan',
      count: response.data.length,
      products: response.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock_status
      }))
    };

    console.log('[WooCommerce Test] ✅ Test 2 passed:', diagnostics.tests.searchProducts);

  } catch (error: any) {
    diagnostics.tests.searchProducts = {
      status: 'FAILED',
      error: error.message,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    };

    console.error('[WooCommerce Test] ❌ Test 2 failed:', diagnostics.tests.searchProducts);
  }

  // Summary
  const successCount = Object.values(diagnostics.tests).filter(
    (t: any) => t.status === 'SUCCESS'
  ).length;
  const totalTests = Object.keys(diagnostics.tests).length;

  diagnostics.summary = {
    total: totalTests,
    passed: successCount,
    failed: totalTests - successCount,
    allPassed: successCount === totalTests
  };

  console.log('[WooCommerce Test] Summary:', diagnostics.summary);

  return NextResponse.json(diagnostics, {
    status: diagnostics.summary.allPassed ? 200 : 500
  });
}
