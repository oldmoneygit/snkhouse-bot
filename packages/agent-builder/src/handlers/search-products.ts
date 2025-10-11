import { getWooCommerceClient } from '@snkhouse/integrations';

export interface SearchProductsInput {
  query: string;
  category?: string;
  max_price?: number;
  limit?: number;
}

export async function searchProductsHandler(input: SearchProductsInput) {
  try {
    console.log('🔍 [SearchProducts] Searching for:', input.query);

    const wc = getWooCommerceClient();

    const params: any = {
      search: input.query,
      per_page: Math.min(input.limit || 5, 10),
      status: 'publish',
      stock_status: 'instock'
    };

    if (input.max_price) {
      params.max_price = input.max_price.toString();
    }

    if (input.category) {
      // Map category names to IDs (adjust based on your WC setup)
      const categoryMap: Record<string, number> = {
        'hombre': 1,
        'mujer': 2,
        'niño': 3,
        'nino': 3,
        'deportivo': 4,
        'casual': 5,
        'running': 6,
        'basketball': 7,
        'lifestyle': 8
      };

      const categoryId = categoryMap[input.category.toLowerCase()];
      if (categoryId) {
        params.category = categoryId;
      }
    }

    console.log('📋 [SearchProducts] Query params:', params);

    const response = await wc.get('products', params);
    const products = response.data;

    console.log(`✅ [SearchProducts] Found ${products.length} products`);

    const results = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      regular_price: parseFloat(product.regular_price),
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      on_sale: product.on_sale,
      image_url: product.images[0]?.src || null,
      in_stock: product.stock_status === 'instock',
      short_description: stripHtml(product.short_description),
      categories: product.categories.map((cat: any) => cat.name),
      sku: product.sku
    }));

    return {
      success: true,
      total: results.length,
      results: results
    };

  } catch (error: any) {
    console.error('❌ [SearchProducts] Error:', error.message);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}
