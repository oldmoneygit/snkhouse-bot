import { NextRequest, NextResponse } from 'next/server';
import { woocommerce, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, size } = body;

    console.log('[check-product-stock] Checking stock for:', product_id, 'size:', size);

    // Get product
    const response = await woocommerce.get(`products/${product_id}`);
    const product = response.data;

    let stockInfo: any = {
      product_id: product.id,
      product_name: product.name,
      available: false,
      quantity: 0,
      size: size
    };

    // Check if product is variable (has variations with sizes)
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      // Get all variations
      const variationsResponse = await woocommerce.get(`products/${product_id}/variations`, {
        per_page: 100
      });

      const variations = variationsResponse.data;

      // Find variation matching the size
      const matchingVariation = variations.find((variation: any) => {
        const sizeAttribute = variation.attributes.find((attr: any) =>
          attr.name.toLowerCase().includes('size') || attr.name.toLowerCase().includes('talla')
        );
        return sizeAttribute && sizeAttribute.option.toLowerCase() === size.toLowerCase();
      });

      if (matchingVariation) {
        stockInfo.available = matchingVariation.stock_status === 'instock';
        stockInfo.quantity = matchingVariation.stock_quantity || 0;
        stockInfo.variation_id = matchingVariation.id;
        stockInfo.price = matchingVariation.price;
      }
    } else {
      // Simple product (no variations)
      stockInfo.available = product.stock_status === 'instock';
      stockInfo.quantity = product.stock_quantity || 0;
      stockInfo.price = product.price;
    }

    console.log('[check-product-stock] Stock info:', stockInfo);

    return NextResponse.json({
      success: true,
      stock: stockInfo
    });

  } catch (error: any) {
    console.error('[check-product-stock] Error:', error);

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al verificar stock' },
      { status: 500 }
    );
  }
}
