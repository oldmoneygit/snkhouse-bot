/**
 * FOLTZ Widget - Product Details API
 * Fetch single product from Shopify for product cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient } from '@snkhouse/integrations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const productId = parseInt(params.id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 },
      );
    }

    console.log(`🛍️ Fetching product ${productId} from Shopify`);

    const shopify = getShopifyClient();
    const product = await shopify.getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    // Get main variant and image
    const mainImage = product.images[0]?.src || product.image?.src;
    const firstVariant = product.variants[0];

    if (!firstVariant) {
      return NextResponse.json(
        { error: 'Product has no variants' },
        { status: 500 },
      );
    }

    // Format for product card
    const formatted = {
      id: product.id,
      name: product.title,
      price: parseFloat(firstVariant.price),
      salePrice: firstVariant.compare_at_price
        ? parseFloat(firstVariant.compare_at_price)
        : null,
      image: mainImage || '/foltz-logo.png',
      category: product.product_type || 'Jersey',
      inStock: (firstVariant.inventory_quantity || 0) > 0,
      link: `https://foltzoficial.com/products/${product.handle}`,
      shortDescription: product.body_html
        ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 150)
        : '',
      variants: product.variants.length,
    };

    console.log(`✅ Product formatted:`, formatted);

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
