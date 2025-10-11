import { getWooCommerceClient } from '@snkhouse/integrations';

export interface CheckStockInput {
  product_id: number;
}

export async function checkStockHandler(input: CheckStockInput) {
  try {
    console.log(`📦 [CheckStock] Checking stock for product ${input.product_id}`);

    const wc = getWooCommerceClient();

    const response = await wc.get(`products/${input.product_id}`);
    const product = response.data;

    console.log(`📋 [CheckStock] Product type: ${product.type}`);

    // Variable product (con tallas/variaciones)
    if (product.type === 'variable') {
      const variationsResponse = await wc.get(
        `products/${input.product_id}/variations`,
        { per_page: 100 }
      );
      const variations = variationsResponse.data;

      console.log(`📊 [CheckStock] Found ${variations.length} variations`);

      const stockByVariation = variations
        .filter((v: any) => v.stock_status === 'instock')
        .map((variation: any) => {
          // Buscar atributo de talla/size
          const sizeAttr = variation.attributes.find(
            (attr: any) =>
              attr.name.toLowerCase().includes('talla') ||
              attr.name.toLowerCase().includes('size') ||
              attr.name.toLowerCase().includes('talle')
          );

          return {
            variation_id: variation.id,
            size: sizeAttr ? sizeAttr.option : 'N/A',
            quantity: variation.stock_quantity || 999,
            price: parseFloat(variation.price),
            sku: variation.sku,
            in_stock: variation.stock_status === 'instock'
          };
        });

      console.log(`✅ [CheckStock] ${stockByVariation.length} variations in stock`);

      return {
        success: true,
        product_id: input.product_id,
        product_name: product.name,
        type: 'variable',
        in_stock: stockByVariation.length > 0,
        total_stock: stockByVariation.reduce((sum: number, v: any) => sum + v.quantity, 0),
        variations: stockByVariation,
        sizes_available: stockByVariation.map((v: any) => v.size).filter((s: string) => s !== 'N/A')
      };

    } else {
      // Simple product
      console.log(`✅ [CheckStock] Simple product, stock: ${product.stock_quantity || 'unlimited'}`);

      return {
        success: true,
        product_id: input.product_id,
        product_name: product.name,
        type: 'simple',
        in_stock: product.stock_status === 'instock',
        quantity: product.stock_quantity || 999,
        price: parseFloat(product.price),
        sku: product.sku
      };
    }

  } catch (error: any) {
    console.error('❌ [CheckStock] Error:', error.message);
    return {
      success: false,
      error: error.message,
      in_stock: false
    };
  }
}
