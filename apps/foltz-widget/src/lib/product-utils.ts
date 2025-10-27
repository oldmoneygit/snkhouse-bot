/**
 * Product utilities for FOLTZ widget
 * Tool detection and product ID extraction
 */

/**
 * Keywords that trigger tool usage (Shopify search)
 */
const TOOL_KEYWORDS = {
  search: [
    // Spanish search terms
    'buscar',
    'mostrar',
    'mostrame',
    'enseñar',
    'encontrar',
    'quiero ver',
    'ver',
    'cuales',
    'qué',
    'productos',
    'camisetas',
    'jerseys',
    // Team names (examples - add more as needed)
    'real madrid',
    'barcelona',
    'river',
    'boca',
    'manchester',
    'psg',
    'bayern',
    // Leagues
    'premier',
    'liga',
    'libertadores',
    'champions',
    // Players (examples)
    'messi',
    'cristiano',
    'neymar',
    'mbappé',
  ],
  details: ['precio', 'cuesta', 'cuánto', 'información', 'detalles', 'info'],
  stock: ['stock', 'disponible', 'hay', 'tenés', 'tienen', 'disponibilidad'],
  orders: [
    'pedido',
    'compra',
    'orden',
    'tracking',
    'rastreo',
    'envío',
    'seguimiento',
  ],
};

/**
 * Check if message should use tools
 * @param message User message
 * @returns boolean
 */
export function shouldUseTool(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check all keyword categories
  const hasSearchKeyword = TOOL_KEYWORDS.search.some((keyword) =>
    lowerMessage.includes(keyword),
  );
  const hasDetailsKeyword = TOOL_KEYWORDS.details.some((keyword) =>
    lowerMessage.includes(keyword),
  );
  const hasStockKeyword = TOOL_KEYWORDS.stock.some((keyword) =>
    lowerMessage.includes(keyword),
  );
  const hasOrderKeyword = TOOL_KEYWORDS.orders.some((keyword) =>
    lowerMessage.includes(keyword),
  );

  return (
    hasSearchKeyword || hasDetailsKeyword || hasStockKeyword || hasOrderKeyword
  );
}

/**
 * Extract product IDs from AI response or tool calls
 * @param content AI response content
 * @param toolCalls Array of tool calls (if any)
 * @returns Array of product IDs
 */
export function extractProductIds(
  content: string,
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>,
): number[] {
  const productIds: Set<number> = new Set();

  // Extract from tool calls (if present)
  if (toolCalls) {
    for (const tool of toolCalls) {
      // search_jerseys tool
      if (tool.name === 'search_jerseys' && tool.result) {
        const result = tool.result as {
          products?: Array<{ id: number }>;
        };
        if (result.products) {
          for (const product of result.products) {
            if (typeof product.id === 'number') {
              productIds.add(product.id);
            }
          }
        }
      }

      // get_product_details tool
      if (tool.name === 'get_product_details') {
        const productId = tool.arguments.product_id;
        if (typeof productId === 'number') {
          productIds.add(productId);
        }
      }
    }
  }

  // Extract from content (if product IDs mentioned)
  // Pattern: "Product ID: 1234" or "id: 1234" or "#1234"
  const idPattern = /(?:id|ID|#)[\s:]+(\d+)/g;
  let match;
  while ((match = idPattern.exec(content)) !== null) {
    const id = parseInt(match[1] ?? '', 10);
    if (!isNaN(id) && id > 0) {
      productIds.add(id);
    }
  }

  return Array.from(productIds);
}

/**
 * Format price for display
 * @param price Price value
 * @param currency Currency code (default: ARS)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Check if message is greeting
 * @param message User message
 * @returns boolean
 */
export function isGreeting(message: string): boolean {
  const greetings = [
    'hola',
    'buenos dias',
    'buenas tardes',
    'buenas noches',
    'hey',
    'saludos',
    'ola',
  ];
  const lowerMessage = message.toLowerCase().trim();
  return greetings.some((greeting) => lowerMessage.startsWith(greeting));
}

/**
 * Extract email from message
 * @param message User message
 * @returns Email or null
 */
export function extractEmail(message: string): string | null {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const match = message.match(emailRegex);
  return match ? match[0] : null;
}

/**
 * Type guard for message metadata with product IDs
 */
export function hasProductMetadata(
  metadata: unknown,
): metadata is { productIds: number[] } {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'productIds' in metadata &&
    Array.isArray((metadata as { productIds?: unknown }).productIds)
  );
}
