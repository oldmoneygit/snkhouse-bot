import { getWooCommerceClient, WooCommerceProduct } from '@snkhouse/integrations';
import { trackToolCall, trackProductSearch } from '@snkhouse/analytics';

// =====================================================
// TOOLS HANDLERS - IMPLEMENTAÇÃO DAS FERRAMENTAS
// =====================================================

export async function searchProducts(query: string, limit: number = 5, conversationId?: string): Promise<string> {
  console.log(`🔍 [Tool] Buscando productos: "${query}"`);
  const toolStartTime = Date.now();

  try {
    const client = getWooCommerceClient();
    const products = await client.searchProducts(query, limit);

    if (products.length === 0) {
      return `No encontré productos para "${query}". Podés intentar con otros términos de búsqueda.`;
    }

    // Formatar resultados para a IA
    const formatted = products.map((p, i) => {
      const stock = p.stock_status === 'instock' ? '✅ En stock' : '❌ Sin stock';
      const price = p.price ? `$${parseFloat(p.price).toLocaleString('es-AR')}` : 'Precio no disponible';
      const sale = p.on_sale ? ' 🔥 EN OFERTA' : '';
      
      return `${i + 1}. **${p.name}**${sale}
   - ID: ${p.id}
   - Precio: ${price}
   - Stock: ${stock}
   - Link: ${p.permalink}`;
    }).join('\n\n');

    console.log(`✅ [Tool] ${products.length} productos encontrados`);

    // TRACKING: Tool Call & Product Search
    if (conversationId) {
      const executionTime = Date.now() - toolStartTime;
      await trackToolCall({
        tool_name: 'search_products',
        parameters: { query, limit },
        execution_time_ms: executionTime,
        success: true,
        conversation_id: conversationId
      });

      // Track cada produto encontrado
      for (const product of products) {
        await trackProductSearch({
          product_id: product.id,
          product_name: product.name,
          search_query: query,
          tool_used: 'search_products',
          conversation_id: conversationId
        });
      }
    }

    return `Encontré ${products.length} productos:\n\n${formatted}`;

  } catch (error: any) {
    console.error('❌ [Tool] Error en searchProducts:', error.message);

    // TRACKING: Tool Call Failed
    if (conversationId) {
      await trackToolCall({
        tool_name: 'search_products',
        parameters: { query, limit },
        execution_time_ms: Date.now() - toolStartTime,
        success: false,
        error: error.message,
        conversation_id: conversationId
      });
    }

    return 'Hubo un error al buscar productos. Por favor intentá de nuevo.';
  }
}

export async function getProductDetails(productId: number, conversationId?: string): Promise<string> {
  console.log(`🔍 [Tool] Obteniendo detalles del producto ID: ${productId}`);
  const toolStartTime = Date.now();

  try {
    const client = getWooCommerceClient();
    const product = await client.getProduct(productId);

    if (!product) {
      return `No encontré el producto con ID ${productId}.`;
    }

    // Formatar detalhes
    const stock = product.stock_status === 'instock' ? '✅ En stock' : '❌ Sin stock';
    const price = product.price ? `$${parseFloat(product.price).toLocaleString('es-AR')}` : 'Consultar';
    const regularPrice = product.regular_price ? `$${parseFloat(product.regular_price).toLocaleString('es-AR')}` : price;
    const sale = product.on_sale ? `\n   - Precio anterior: ${regularPrice}\n   - 🔥 OFERTA: ${price}` : '';
    const categories = product.categories.map(c => c.name).join(', ');
    const description = product.short_description 
      ? product.short_description.replace(/<[^>]*>/g, '').substring(0, 200)
      : 'Sin descripción';

    const details = `**${product.name}**

📋 Detalles:
   - SKU: ${product.sku || 'N/A'}
   - Categorías: ${categories}${sale}
   ${!product.on_sale ? `- Precio: ${price}` : ''}
   - Stock: ${stock}
   ${product.stock_quantity ? `- Cantidad disponible: ${product.stock_quantity}` : ''}
   
📝 Descripción:
${description}

🔗 Ver más: ${product.permalink}`;

    console.log(`✅ [Tool] Detalles obtenidos para: ${product.name}`);

    // TRACKING: Tool Call & Product Search
    if (conversationId) {
      const executionTime = Date.now() - toolStartTime;
      await trackToolCall({
        tool_name: 'get_product_details',
        parameters: { productId },
        execution_time_ms: executionTime,
        success: true,
        conversation_id: conversationId
      });

      await trackProductSearch({
        product_id: product.id,
        product_name: product.name,
        tool_used: 'get_product_details',
        conversation_id: conversationId
      });
    }

    return details;

  } catch (error: any) {
    console.error('❌ [Tool] Error en getProductDetails:', error.message);

    // TRACKING: Tool Call Failed
    if (conversationId) {
      await trackToolCall({
        tool_name: 'get_product_details',
        parameters: { productId },
        execution_time_ms: Date.now() - toolStartTime,
        success: false,
        error: error.message,
        conversation_id: conversationId
      });
    }

    return 'Hubo un error al obtener los detalles del producto.';
  }
}

export async function checkStock(productId: number): Promise<string> {
  console.log(`🔍 [Tool] Verificando stock del producto ID: ${productId}`);

  try {
    const client = getWooCommerceClient();
    const product = await client.getProduct(productId);

    if (!product) {
      return `No encontré el producto con ID ${productId}.`;
    }

    const inStock = product.stock_status === 'instock';
    const quantity = product.stock_quantity;

    let stockMessage = `**${product.name}**\n\n`;

    if (inStock) {
      stockMessage += quantity 
        ? `✅ **Disponible** - Hay ${quantity} unidades en stock`
        : `✅ **Disponible** - En stock`;
    } else if (product.stock_status === 'onbackorder') {
      stockMessage += `⏳ **Por encargo** - Se puede pedir pero demora en llegar`;
    } else {
      stockMessage += `❌ **Sin stock** - No disponible en este momento`;
    }

    console.log(`✅ [Tool] Stock verificado: ${product.stock_status}`);
    return stockMessage;

  } catch (error: any) {
    console.error('❌ [Tool] Error en checkStock:', error.message);
    return 'Hubo un error al verificar el stock.';
  }
}

export async function getCategories(): Promise<string> {
  console.log('🔍 [Tool] Listando categorías');

  try {
    const client = getWooCommerceClient();
    const categories = await client.getCategories();

    if (categories.length === 0) {
      return 'No encontré categorías disponibles.';
    }

    // Filtrar categorias principais (parent = 0)
    const mainCategories = categories.filter(c => c.parent === 0);

    const formatted = mainCategories
      .slice(0, 10) // Primeiras 10 categorias
      .map((c, i) => `${i + 1}. ${c.name} (${c.count} productos)`)
      .join('\n');

    console.log(`✅ [Tool] ${mainCategories.length} categorías encontradas`);
    return `Categorías disponibles:\n\n${formatted}`;

  } catch (error: any) {
    console.error('❌ [Tool] Error en getCategories:', error.message);
    return 'Hubo un error al listar las categorías.';
  }
}

export async function getProductsOnSale(limit: number = 10): Promise<string> {
  console.log(`🔍 [Tool] Buscando productos en oferta (límite: ${limit})`);

  try {
    const client = getWooCommerceClient();
    const products = await client.getProducts({ 
      on_sale: true, 
      per_page: limit 
    });

    if (products.length === 0) {
      return 'No hay productos en oferta en este momento.';
    }

    const formatted = products.map((p, i) => {
      const regularPrice = parseFloat(p.regular_price).toLocaleString('es-AR');
      const salePrice = parseFloat(p.price).toLocaleString('es-AR');
      const discount = Math.round(((parseFloat(p.regular_price) - parseFloat(p.price)) / parseFloat(p.regular_price)) * 100);

      return `${i + 1}. **${p.name}**
   - Antes: $${regularPrice}
   - Ahora: $${salePrice}
   - Descuento: ${discount}% OFF 🔥
   - ID: ${p.id}`;
    }).join('\n\n');

    console.log(`✅ [Tool] ${products.length} productos en oferta`);
    return `🔥 Productos en oferta:\n\n${formatted}`;

  } catch (error: any) {
    console.error('❌ [Tool] Error en getProductsOnSale:', error.message);
    return 'Hubo un error al buscar productos en oferta.';
  }
}

// Tool executor - chama a função correta baseado no nome
export async function executeToolCall(toolName: string, args: any): Promise<string> {
  console.log(`🔧 [Tool] Executando: ${toolName}`, args);

  switch (toolName) {
    case 'search_products':
      return searchProducts(args.query, args.limit);
    
    case 'get_product_details':
      return getProductDetails(args.product_id);
    
    case 'check_stock':
      return checkStock(args.product_id);
    
    case 'get_categories':
      return getCategories();
    
    case 'get_products_on_sale':
      return getProductsOnSale(args.limit);
    
    default:
      console.error(`❌ [Tool] Tool desconhecida: ${toolName}`);
      return `Error: Tool "${toolName}" no encontrada.`;
  }
}
