/**
 * FOLTZ AI Agent - Tool Handlers
 * Implements the logic for each tool using Shopify client
 */

import { getShopifyClient, type ShopifyProduct, type ShopifyOrder } from '@snkhouse/integrations';
import { ToolName } from './tools-definitions';

export interface ToolInput {
  // search_jerseys
  query?: string;
  limit?: number;
  // get_product_details, check_stock
  product_id?: number;
  size?: string;
  // get_order_status, get_customer_orders
  order_id?: number;
  email?: string;
  // calculate_shipping
  location?: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Execute a tool call
 * @param toolName Tool name
 * @param input Tool input parameters
 * @returns Tool result
 */
export async function executeToolCall(
  toolName: string,
  input: ToolInput,
): Promise<ToolResult> {
  console.log(`🔧 Executing tool: ${toolName}`, input);

  try {
    switch (toolName) {
      case ToolName.SEARCH_JERSEYS:
        return await handleSearchJerseys(input);

      case ToolName.GET_PRODUCT_DETAILS:
        return await handleGetProductDetails(input);

      case ToolName.CHECK_STOCK:
        return await handleCheckStock(input);

      case ToolName.GET_ORDER_STATUS:
        return await handleGetOrderStatus(input);

      case ToolName.GET_CUSTOMER_ORDERS:
        return await handleGetCustomerOrders(input);

      case ToolName.CALCULATE_SHIPPING:
        return await handleCalculateShipping(input);

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error) {
    console.error(`❌ Error executing tool ${toolName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Tool Handlers
// =====================================================

/**
 * Handler: search_jerseys
 * Search for jerseys by query
 */
async function handleSearchJerseys(input: ToolInput): Promise<ToolResult> {
  if (!input.query) {
    return { success: false, error: 'Query is required' };
  }

  const shopify = getShopifyClient();
  const limit = input.limit || 10;

  const products = await shopify.searchProducts(input.query, limit);

  // Format products for AI
  const formatted = products.map((product) => formatProductForAI(product));

  return {
    success: true,
    data: {
      query: input.query,
      count: formatted.length,
      products: formatted,
    },
  };
}

/**
 * Handler: get_product_details
 * Get detailed info about a product
 */
async function handleGetProductDetails(input: ToolInput): Promise<ToolResult> {
  if (!input.product_id) {
    return { success: false, error: 'Product ID is required' };
  }

  const shopify = getShopifyClient();
  const product = await shopify.getProductById(input.product_id);

  if (!product) {
    return {
      success: false,
      error: `Product ${input.product_id} not found`,
    };
  }

  return {
    success: true,
    data: formatProductDetailsForAI(product),
  };
}

/**
 * Handler: check_stock
 * Check product/variant stock availability
 */
async function handleCheckStock(input: ToolInput): Promise<ToolResult> {
  if (!input.product_id) {
    return { success: false, error: 'Product ID is required' };
  }

  const shopify = getShopifyClient();
  const product = await shopify.getProductById(input.product_id);

  if (!product) {
    return {
      success: false,
      error: `Product ${input.product_id} not found`,
    };
  }

  // If size specified, find that variant
  if (input.size) {
    const variant = product.variants.find(
      (v) => v.option1?.toUpperCase() === input.size?.toUpperCase() ||
             v.title?.toUpperCase().includes(input.size?.toUpperCase() || ''),
    );

    if (!variant) {
      return {
        success: true,
        data: {
          product_name: product.title,
          size: input.size,
          in_stock: false,
          message: `Tamanho ${input.size} não disponível`,
        },
      };
    }

    return {
      success: true,
      data: {
        product_name: product.title,
        size: input.size,
        in_stock: variant.inventory_quantity > 0,
        quantity: variant.inventory_quantity,
      },
    };
  }

  // No size specified, return all variants stock
  const variants = product.variants.map((v) => ({
    size: v.title,
    in_stock: v.inventory_quantity > 0,
    quantity: v.inventory_quantity,
  }));

  return {
    success: true,
    data: {
      product_name: product.title,
      variants,
    },
  };
}

/**
 * Handler: get_order_status
 * Get order status and tracking
 */
async function handleGetOrderStatus(input: ToolInput): Promise<ToolResult> {
  const shopify = getShopifyClient();

  // If order_id provided, fetch directly
  if (input.order_id) {
    const order = await shopify.getOrderById(input.order_id);

    if (!order) {
      return {
        success: false,
        error: `Pedido ${input.order_id} não encontrado`,
      };
    }

    return {
      success: true,
      data: formatOrderForAI(order),
    };
  }

  // If email provided, find customer orders
  if (input.email) {
    const orders = await shopify.getOrdersByEmail(input.email);

    if (orders.length === 0) {
      return {
        success: false,
        error: `Nenhum pedido encontrado para ${input.email}`,
      };
    }

    // Return most recent order
    const latestOrder = orders[0];
    if (!latestOrder) {
      return {
        success: false,
        error: 'Erro ao buscar pedido mais recente',
      };
    }

    return {
      success: true,
      data: formatOrderForAI(latestOrder),
    };
  }

  return {
    success: false,
    error: 'Order ID ou email é obrigatório',
  };
}

/**
 * Handler: get_customer_orders
 * Get all orders from a customer
 */
async function handleGetCustomerOrders(input: ToolInput): Promise<ToolResult> {
  if (!input.email) {
    return { success: false, error: 'Email is required' };
  }

  const shopify = getShopifyClient();
  const orders = await shopify.getOrdersByEmail(input.email);

  if (orders.length === 0) {
    return {
      success: true,
      data: {
        email: input.email,
        count: 0,
        orders: [],
        message: 'Nenhum pedido encontrado',
      },
    };
  }

  const formatted = orders.map((order) => formatOrderSummaryForAI(order));

  return {
    success: true,
    data: {
      email: input.email,
      count: formatted.length,
      orders: formatted,
    },
  };
}

/**
 * Handler: calculate_shipping
 * Calculate shipping time based on location
 */
async function handleCalculateShipping(input: ToolInput): Promise<ToolResult> {
  if (!input.location) {
    return { success: false, error: 'Location is required' };
  }

  const location = input.location.toLowerCase();

  // Shipping rules from knowledge base
  let days = '';
  let region = '';

  if (location.includes('buenos aires') || location.includes('caba')) {
    days = '3-5 días hábiles';
    region = 'Buenos Aires / CABA';
  } else if (location.includes('provincia')) {
    days = '5-7 días hábiles';
    region = 'Provincia de Buenos Aires';
  } else {
    days = '7-12 días hábiles';
    region = 'Interior de Argentina';
  }

  return {
    success: true,
    data: {
      location: input.location,
      region,
      estimated_delivery: days,
      shipping_cost: 'GRATIS',
      note: 'Días hábiles (seg-sex), não contam sábados, domingos e feriados',
    },
  };
}

// =====================================================
// Formatters
// =====================================================

/**
 * Format product for AI (search results)
 */
function formatProductForAI(product: ShopifyProduct): Record<string, unknown> {
  const mainImage = product.images[0]?.src ?? product.image?.src;
  const firstVariant = product.variants[0];

  return {
    id: product.id,
    name: product.title,
    price: firstVariant ? `ARS ${parseFloat(firstVariant.price).toFixed(2)}` : 'N/A',
    image: mainImage,
    type: product.product_type,
    tags: product.tags,
    status: product.status,
    variants_count: product.variants.length,
  };
}

/**
 * Format product details for AI (full info)
 */
function formatProductDetailsForAI(
  product: ShopifyProduct,
): Record<string, unknown> {
  const mainImage = product.images[0]?.src ?? product.image?.src;

  const variants = product.variants.map((v) => ({
    size: v.title,
    price: `ARS ${parseFloat(v.price).toFixed(2)}`,
    in_stock: v.inventory_quantity > 0,
    quantity: v.inventory_quantity,
  }));

  return {
    id: product.id,
    name: product.title,
    description: product.body_html
      ? product.body_html.replace(/<[^>]*>/g, '')
      : '', // Strip HTML
    type: product.product_type,
    tags: product.tags,
    images: product.images.map((img) => img.src),
    main_image: mainImage,
    variants,
    available_sizes: variants.map((v) => v.size),
    status: product.status,
  };
}

/**
 * Format order for AI (full details)
 */
function formatOrderForAI(order: ShopifyOrder): Record<string, unknown> {
  const tracking = order.fulfillments[0]?.tracking_number;
  const trackingUrl = order.fulfillments[0]?.tracking_url;

  return {
    order_number: order.name,
    order_id: order.id,
    status: order.financial_status,
    fulfillment_status: order.fulfillment_status || 'pending',
    total: `ARS ${parseFloat(order.total_price).toFixed(2)}`,
    currency: order.currency,
    created_at: order.created_at,
    items: order.line_items.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      price: `ARS ${parseFloat(item.price).toFixed(2)}`,
    })),
    shipping_address: order.shipping_address
      ? `${order.shipping_address.city}, ${order.shipping_address.province}`
      : 'N/A',
    tracking_number: tracking || 'Ainda não disponível',
    tracking_url: trackingUrl || null,
    email: order.email,
  };
}

/**
 * Format order summary for AI (list view)
 */
function formatOrderSummaryForAI(order: ShopifyOrder): Record<string, unknown> {
  return {
    order_number: order.name,
    order_id: order.id,
    status: order.financial_status,
    total: `ARS ${parseFloat(order.total_price).toFixed(2)}`,
    created_at: order.created_at,
    items_count: order.line_items.length,
  };
}
