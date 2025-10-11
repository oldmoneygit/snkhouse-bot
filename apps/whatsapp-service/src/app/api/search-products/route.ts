import { NextRequest, NextResponse } from 'next/server';
import { woocommerce, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, category, max_price, limit = 10 } = body;

    console.log('[search-products] Searching:', { query, category, max_price, limit });

    // Build WooCommerce query parameters
    const params: any = {
      search: query,
      per_page: Math.min(limit, 100),
      status: 'publish'
    };

    if (category) {
      params.category = category;
    }

    if (max_price) {
      params.max_price = max_price;
    }

    // Search products
    const response = await woocommerce.get('products', params);
    const products = response.data;

    // Format response
    const formattedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      on_sale: product.on_sale,
      stock_status: product.stock_status,
      image: product.images[0]?.src || null,
      categories: product.categories.map((cat: any) => cat.name),
      short_description: product.short_description
    }));

    console.log('[search-products] Found:', formattedProducts.length, 'products');

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });

  } catch (error: any) {
    console.error('[search-products] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al buscar productos'
      },
      { status: 500 }
    );
  }
}
