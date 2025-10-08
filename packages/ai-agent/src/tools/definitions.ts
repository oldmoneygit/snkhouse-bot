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
];
