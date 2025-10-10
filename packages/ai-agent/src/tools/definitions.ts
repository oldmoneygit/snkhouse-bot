// =====================================================
// TOOLS DEFINITIONS PARA OPENAI FUNCTION CALLING
// =====================================================

export const TOOLS_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_products',
      description: 'Busca productos en la tienda por nombre, marca o categoría. Usar para encontrar zapatillas específicas.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Término de búsqueda (ej: "nike air max", "adidas yeezy", "jordan")',
          },
          limit: {
            type: 'number',
            description: 'Número máximo de resultados (por defecto: 5)',
            default: 5,
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_product_details',
      description: 'Obtiene detalles completos de un producto específico por ID',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'number',
            description: 'ID del producto en WooCommerce',
          },
        },
        required: ['product_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'check_stock',
      description: 'Verifica disponibilidad de stock de un producto',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'number',
            description: 'ID del producto en WooCommerce',
          },
        },
        required: ['product_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_categories',
      description: 'Lista todas las categorías de productos disponibles',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_products_on_sale',
      description: 'Lista productos en oferta o con descuento',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Número máximo de resultados',
            default: 10,
          },
        },
      },
    },
  },
  // =====================================================
  // ORDERS TOOLS - SNKH-16.5
  // =====================================================
  {
    type: 'function' as const,
    function: {
      name: 'get_order_status',
      description: 'Consulta el status actual de un pedido del cliente. Use cuando el cliente pregunte "donde está mi pedido", "status del pedido", etc.',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'number',
            description: 'ID numérico del pedido en WooCommerce (ej: 12345)',
          },
          customer_id: {
            type: 'number',
            description: 'ID del cliente que hizo el pedido (para validación de seguridad)',
          },
        },
        required: ['order_id', 'customer_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_customer_orders',
      description: 'Busca todos los pedidos de un cliente por email o customer_id. Use para preguntas como "mis pedidos", "histórico de compras", etc.',
      parameters: {
        type: 'object',
        properties: {
          email_or_customer_id: {
            type: ['string', 'number'],
            description: 'Email del cliente (ej: cliente@email.com) O customer_id numérico',
          },
          limit: {
            type: 'number',
            description: 'Número máximo de pedidos a retornar (padrão: 5, máximo: 10)',
            default: 5,
          },
        },
        required: ['email_or_customer_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_order_details',
      description: 'Retorna detalhes completos de un pedido: productos, valores, endereço de entrega, forma de pagamento, tracking. Use cuando cliente pida "detalhes do pedido", "o que comprei", etc.',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'number',
            description: 'ID numérico del pedido',
          },
          customer_id: {
            type: ['number', 'string'],
            description: 'ID numérico del cliente OU email del cliente (para validación de seguridad)',
          },
        },
        required: ['order_id', 'customer_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'track_shipment',
      description: 'Retorna código de rastreamento e informações de envío del pedido. Use cuando cliente pregunte "rastreamento", "tracking", "código de rastreio", etc.',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'number',
            description: 'ID numérico del pedido',
          },
          customer_id: {
            type: ['number', 'string'],
            description: 'ID numérico del cliente OU email del cliente (para validación de seguridad)',
          },
        },
        required: ['order_id', 'customer_id'],
      },
    },
  },
];
