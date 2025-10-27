/**
 * FOLTZ AI Agent - Tools Definitions
 * Tools for Shopify integration (products, orders, inventory)
 */

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Tool: search_jerseys
 * Search for jerseys by team, player, or league
 */
export const searchJerseysTool: ToolDefinition = {
  name: 'search_jerseys',
  description:
    'Busca camisetas de futebol por equipe, jogador, liga ou palavra-chave. Use quando o cliente perguntar sobre produtos disponíveis, times específicos, ou quiser ver opções.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Termo de busca: nome do time (Real Madrid, Barcelona), jogador (Messi, Cristiano), liga (Premier League, La Liga), ou palavra-chave genérica',
      },
      limit: {
        type: 'number',
        description: 'Máximo de resultados a retornar (padrão: 10)',
      },
    },
    required: ['query'],
  },
};

/**
 * Tool: get_product_details
 * Get detailed information about a specific product
 */
export const getProductDetailsTool: ToolDefinition = {
  name: 'get_product_details',
  description:
    'Obtém informações detalhadas sobre um produto específico: preço, tamanhos disponíveis, imagens, descrição completa. Use quando cliente pedir detalhes de um produto específico ou perguntar sobre disponibilidade de tamanhos.',
  input_schema: {
    type: 'object',
    properties: {
      product_id: {
        type: 'number',
        description: 'ID do produto no Shopify',
      },
    },
    required: ['product_id'],
  },
};

/**
 * Tool: check_stock
 * Check inventory availability for a product/variant
 */
export const checkStockTool: ToolDefinition = {
  name: 'check_stock',
  description:
    'Verifica disponibilidade de estoque de um produto ou tamanho específico. Use quando cliente perguntar "Tem em estoque?", "Tem tamanho M?", "Está disponível?".',
  input_schema: {
    type: 'object',
    properties: {
      product_id: {
        type: 'number',
        description: 'ID do produto no Shopify',
      },
      size: {
        type: 'string',
        description: 'Tamanho específico: S, M, L, XL, XXL, 3XL, 4XL',
      },
    },
    required: ['product_id'],
  },
};

/**
 * Tool: get_order_status
 * Get order status and tracking information
 */
export const getOrderStatusTool: ToolDefinition = {
  name: 'get_order_status',
  description:
    'Consulta status de um pedido: pagamento confirmado, preparando envio, enviado, código de rastreamento, previsão de entrega. Use quando cliente perguntar sobre pedido, envio, rastreamento.',
  input_schema: {
    type: 'object',
    properties: {
      order_id: {
        type: 'number',
        description: 'ID do pedido no Shopify (número do pedido)',
      },
      email: {
        type: 'string',
        description:
          'Email do cliente (alternativa ao order_id, busca últimos pedidos)',
      },
    },
  },
};

/**
 * Tool: get_customer_orders
 * Get all orders from a customer
 */
export const getCustomerOrdersTool: ToolDefinition = {
  name: 'get_customer_orders',
  description:
    'Busca todos os pedidos de um cliente pelo email. Use quando cliente perguntar "Quais são meus pedidos?", "Já comprei antes?", "Histórico de compras".',
  input_schema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email do cliente',
      },
    },
    required: ['email'],
  },
};

/**
 * Tool: calculate_shipping
 * Calculate shipping time based on customer location
 */
export const calculateShippingTool: ToolDefinition = {
  name: 'calculate_shipping',
  description:
    'Calcula prazo de entrega com base na localização do cliente (Buenos Aires, Provincia, Interior). Use quando cliente perguntar "Quanto tempo demora?", "Quando chega?".',
  input_schema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description:
          'Localização: "Buenos Aires", "CABA", "Provincia", "Interior", ou cidade específica',
      },
    },
    required: ['location'],
  },
};

/**
 * All tools combined
 */
export const FOLTZ_TOOLS: ToolDefinition[] = [
  searchJerseysTool,
  getProductDetailsTool,
  checkStockTool,
  getOrderStatusTool,
  getCustomerOrdersTool,
  calculateShippingTool,
];

/**
 * Tool names enum for type safety
 */
export enum ToolName {
  SEARCH_JERSEYS = 'search_jerseys',
  GET_PRODUCT_DETAILS = 'get_product_details',
  CHECK_STOCK = 'check_stock',
  GET_ORDER_STATUS = 'get_order_status',
  GET_CUSTOMER_ORDERS = 'get_customer_orders',
  CALCULATE_SHIPPING = 'calculate_shipping',
}
