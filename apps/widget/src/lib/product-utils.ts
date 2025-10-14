/**
 * Product utilities for Widget Product Cards feature
 *
 * Handles:
 * - Detection of product-related messages
 * - Extraction of product IDs from AI tool calls
 * - Type guards for product metadata
 */

/**
 * Tool keywords that indicate need for WooCommerce tools
 */
const TOOL_KEYWORDS = {
  // Product search (incluir conjugações argentinas com voseo)
  search: [
    'buscar', 'buscas', 'busca', 'buscás',
    'mostrar', 'mostras', 'mostra', 'mostrás', 'mostre',
    'encontrar', 'encontras', 'encuentra', 'encontrás',
    'recomendar', 'recomiendas', 'recomienda', 'recomendás',
    'ver', 'ves', 've', 'veo',
    'quiero', 'quieres', 'querés',
    'me interesa', 'te interesa',
    'nike', 'adidas', 'jordan', 'yeezy', 'dunk', 'air', 'zapatillas', 'sneakers'
  ],
  // Product details
  details: ['precio', 'cuesta', 'cuánto', 'cuanto', 'valor', 'vale', 'información', 'info', 'detalles'],
  // Stock check
  stock: ['stock', 'disponible', 'disponibilidad', 'hay', 'tienen', 'tenés', 'quedan', 'queda'],
  // Orders
  orders: ['pedido', 'orden', 'compra', 'comprá', 'tracking', 'seguimiento', 'envío', 'envio', 'entrega'],
};

/**
 * Determines if a user message requires WooCommerce tools
 * Used for smart routing between streaming and tool-enabled responses
 *
 * @param message - User message content
 * @returns true if message needs tools (search_products, get_product_details, etc.)
 */
export function shouldUseTool(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check all keyword categories
  const allKeywords = Object.values(TOOL_KEYWORDS).flat();
  return allKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Tool call structure from OpenAI API
 */
export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>; // INPUT parameters
  response?: any; // OUTPUT result (can be string, object, or structured data)
}

/**
 * Extracts product IDs from AI tool call responses
 *
 * Supports:
 * - search_products: extracts from products array
 * - get_product_details: extracts single product ID
 * - check_stock: extracts from product object
 *
 * @param toolCalls - Array of tool calls from AI response
 * @returns Array of unique product IDs
 */
export function extractProductIdsFromToolCalls(
  toolCalls: ToolCall[]
): number[] {
  const productIds: Set<number> = new Set();

  for (const call of toolCalls) {
    if (!call.response) {
      console.warn(`⚠️ Tool call ${call.name} has no response`);
      continue;
    }

    // search_products returns { formatted: string, products: [...] }
    if (call.name === "search_products" && call.response.products) {
      call.response.products.forEach((product: any) => {
        if (product.id && typeof product.id === "number") {
          productIds.add(product.id);
        }
      });
    }

    // get_product_details returns string (legacy format)
    // We can parse the string to extract ID, but for now skip
    if (call.name === "get_product_details") {
      // Extract ID from arguments instead (it's the input)
      const productId = (call.arguments as any).product_id;
      if (productId && typeof productId === "number") {
        productIds.add(productId);
      }
    }

    // check_stock returns string (legacy format)
    if (call.name === "check_stock") {
      // Extract ID from arguments instead (it's the input)
      const productId = (call.arguments as any).product_id;
      if (productId && typeof productId === "number") {
        productIds.add(productId);
      }
    }
  }

  return Array.from(productIds);
}

/**
 * Type guard for message metadata with product IDs
 */
export function hasProductMetadata(
  metadata: unknown
): metadata is { productIds: number[] } {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "productIds" in metadata &&
    Array.isArray((metadata as any).productIds)
  );
}
