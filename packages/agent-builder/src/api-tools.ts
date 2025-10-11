import { tool } from "@openai/agents";
import { z } from "zod";

// ========================================
// API TOOLS - WooCommerce Integration
// ========================================

const API_BASE_URL = 'https://snkhouse-bot.vercel.app/api';

// FUNCTION 1: searchProducts
export const searchProducts = tool({
  name: "searchProducts",
  description: "Busca productos en el catálogo de WooCommerce por palabras clave. Retorna hasta 10 resultados con información básica (ID, nombre, precio, imagen).",
  parameters: z.object({
    query: z.string(),
    category: z.string(),
    max_price: z.number(),
    limit: z.number().int()
  }),
  execute: async (input: {query: string, category: string, max_price: number, limit: number}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] searchProducts:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al buscar productos'
      });
    }
  },
});

// FUNCTION 2: getOrderDetails
export const getOrderDetails = tool({
  name: "getOrderDetails",
  description: "Consulta los detalles completos de un pedido por número de pedido. Incluye: estado, productos, dirección de envío, tracking, fechas. IMPORTANTE: Requiere validación de email del cliente para proteger datos personales.",
  parameters: z.object({
    order_id: z.string(),
    customer_email: z.string()
  }),
  execute: async (input: {order_id: string, customer_email: string}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-order-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] getOrderDetails:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al consultar pedido'
      });
    }
  },
});

// FUNCTION 3: getCustomerOrders
export const getCustomerOrders = tool({
  name: "getCustomerOrders",
  description: "Lista todos los pedidos de un cliente específico por email. Retorna: números de pedido, fechas, estados, totales. Útil para ver historial de compras.",
  parameters: z.object({
    customer_email: z.string(),
    status: z.string(),
    limit: z.number().int()
  }),
  execute: async (input: {customer_email: string, status: string, limit: number}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-customer-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] getCustomerOrders:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al consultar pedidos del cliente'
      });
    }
  },
});

// FUNCTION 4: updateShippingAddress
export const updateShippingAddress = tool({
  name: "updateShippingAddress",
  description: "Actualiza la dirección de envío de un pedido que NO ha sido despachado todavía. IMPORTANTE: Requiere validación del email del cliente. Solo funciona si el estado del pedido es 'pending', 'processing' o 'on-hold'. Si ya fue enviado, retornará error.",
  parameters: z.object({
    order_id: z.string(),
    customer_email: z.string(),
    new_address: z.object({
      address_1: z.string(),
      address_2: z.string(),
      city: z.string(),
      state: z.string(),
      postcode: z.string()
    })
  }),
  execute: async (input: {order_id: string, customer_email: string, new_address: object}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-shipping-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] updateShippingAddress:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar dirección'
      });
    }
  },
});

// FUNCTION 5: getTrackingInfo
export const getTrackingInfo = tool({
  name: "getTrackingInfo",
  description: "Obtiene el código de tracking y estado de envío de un pedido. Retorna el código de seguimiento, URL para rastrear el paquete y fecha estimada de entrega. Requiere email de validación.",
  parameters: z.object({
    order_id: z.string(),
    customer_email: z.string()
  }),
  execute: async (input: {order_id: string, customer_email: string}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-tracking-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] getTrackingInfo:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tracking'
      });
    }
  },
});

// FUNCTION 6: createReturnRequest
export const createReturnRequest = tool({
  name: "createReturnRequest",
  description: "Crea una solicitud de devolución/cambio por producto defectuoso o incorrecto. Genera etiqueta de devolución GRATIS. IMPORTANTE: Solo aplicable para defectos o errores de SNKHOUSE, NO para cambios de opinión o talla incorrecta elegida por el cliente.",
  parameters: z.object({
    order_id: z.string(),
    customer_email: z.string(),
    reason: z.string(),
    description: z.string(),
    has_photos: z.boolean()
  }),
  execute: async (input: {order_id: string, customer_email: string, reason: string, description: string, has_photos: boolean}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-return-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] createReturnRequest:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear solicitud de devolución'
      });
    }
  },
});

// FUNCTION 7: checkProductStock
export const checkProductStock = tool({
  name: "checkProductStock",
  description: "Verifica la disponibilidad de stock de un producto específico y talla. Retorna si está disponible y cuántas unidades hay. Útil cuando el cliente pregunta por una talla específica.",
  parameters: z.object({
    product_id: z.string(),
    size: z.string()
  }),
  execute: async (input: {product_id: string, size: string}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-product-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] checkProductStock:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar stock'
      });
    }
  },
});

// FUNCTION 8: updateCustomerInfo
export const updateCustomerInfo = tool({
  name: "updateCustomerInfo",
  description: "Actualiza información de contacto del cliente (email, teléfono, dirección de facturación). Requiere email actual para validación. Útil cuando el cliente quiere cambiar sus datos de cuenta.",
  parameters: z.object({
    current_email: z.string(),
    updates: z.object({
      new_email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      billing_address: z.object({
        address_1: z.string(),
        city: z.string(),
        state: z.string(),
        postcode: z.string()
      }).nullable().optional()
    })
  }),
  execute: async (input: {current_email: string, updates: object}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-customer-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] updateCustomerInfo:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar información del cliente'
      });
    }
  },
});

// FUNCTION 9: getActivePromotions
export const getActivePromotions = tool({
  name: "getActivePromotions",
  description: "Obtiene lista de promociones activas vigentes (descuentos, 'Compra 1 Toma 2', etc). Retorna nombre, descripción, tipo de promoción y fecha de validez. Útil cuando el cliente pregunta por ofertas o descuentos.",
  parameters: z.object({
    promotion_type: z.string()
  }),
  execute: async (input: {promotion_type: string}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-active-promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] getActivePromotions:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener promociones'
      });
    }
  },
});

// FUNCTION 10: checkVipStatus
export const checkVipStatus = tool({
  name: "checkVipStatus",
  description: "Consulta el estado del programa VIP de un cliente: número de compras realizadas, cuántas compras faltan para el próximo premio (3 compras = 1 producto gratis hasta $50,000 ARS), historial de rewards. Programa sin expiración.",
  parameters: z.object({
    customer_email: z.string()
  }),
  execute: async (input: {customer_email: string}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-vip-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AGENT_API_KEY || ''
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.stringify(data);

    } catch (error) {
      console.error('[ERROR] checkVipStatus:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al consultar estado VIP'
      });
    }
  },
});
