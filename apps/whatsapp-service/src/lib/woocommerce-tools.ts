/**
 * WooCommerce Tools - Shared between Claude and ChatGPT processors
 *
 * These tools provide integration with WooCommerce API for:
 * - Product search
 * - Order details lookup
 * - Stock checking
 *
 * Both AI providers use the same tools to ensure consistent behavior.
 */

import { z } from "zod";
import { woocommerceClient } from "./woocommerce";

/**
 * Shared WooCommerce tools configuration for AI SDK
 * Compatible with both Anthropic (Claude) and OpenAI (ChatGPT)
 */
export const woocommerceTools = {
  // =====================================
  // TOOL 1: Search Products
  // =====================================
  searchProducts: {
    description:
      'Buscar productos en el catálogo por nombre, marca o modelo (ej: "jordan 1", "nike dunk", "yeezy"). Usa búsqueda inteligente con múltiples estrategias automáticas. Retorna hasta {limit} productos con ID, nombre, precio, stock y URL.',
    parameters: z.object({
      query: z
        .string()
        .describe(
          'Término de búsqueda (ej: "jordan 1", "nike dunk", "strangelove")',
        ),
      limit: z
        .number()
        .int()
        .optional()
        .default(5)
        .describe("Cantidad máxima de resultados (default 5)"),
    }),
    execute: async ({
      query,
      limit = 5,
    }: {
      query: string;
      limit?: number;
    }) => {
      console.log(
        `[WooCommerce Tool] 🔍 searchProducts (intelligent): "${query}", limit: ${limit}`,
      );

      /**
       * Estrategia de búsqueda inteligente con fallbacks:
       * 1. Busca con query original (ej: "strangelove")
       * 2. Si no encuentra, busca con últimas 2 palabras (para padrão "Nike SB Dunk Low STRANGE LOVE")
       * 3. Se no encuentra, busca con cada palabra individual
       * 4. Se no encuentra, busca con primeiras 3 letras de cada palavra
       * 5. Se no encuentra nada, retorna not found
       */

      const searchStrategies: string[] = [];
      const originalQuery = query.trim();

      // Estratégia 1: Query original
      searchStrategies.push(originalQuery);

      // Processar palavras
      const words = originalQuery.toLowerCase().split(/\s+/);

      // Estratégia 2: Últimas 2 palavras (padrão Nike SB Dunk Low STRANGE LOVE)
      if (words.length >= 2) {
        searchStrategies.push(words.slice(-2).join(" "));
      }

      // Estratégia 3: Última palavra (se houver múltiplas)
      if (words.length > 1) {
        const lastWord = words[words.length - 1];
        if (lastWord) {
          searchStrategies.push(lastWord);
        }
      }

      // Estratégia 4: Cada palavra individual (se ainda não tentou)
      words.forEach((word) => {
        if (word.length >= 3 && !searchStrategies.includes(word)) {
          searchStrategies.push(word);
        }
      });

      // Estratégia 5: Primeiras 3 letras de cada palavra (mínimo 4 letras)
      words.forEach((word) => {
        if (word.length >= 4) {
          const prefix = word.substring(0, 3);
          if (!searchStrategies.includes(prefix)) {
            searchStrategies.push(prefix);
          }
        }
      });

      console.log(
        `[WooCommerce Tool] 📋 Search strategies: ${searchStrategies.join(" → ")}`,
      );

      // Tentar cada estratégia até encontrar resultados
      for (let i = 0; i < searchStrategies.length; i++) {
        const searchTerm = searchStrategies[i];
        console.log(
          `[WooCommerce Tool] 🔎 Trying strategy ${i + 1}/${searchStrategies.length}: "${searchTerm}"`,
        );

        try {
          const response = await woocommerceClient.get("/products", {
            params: {
              search: searchTerm,
              per_page: limit,
              status: "publish",
              _fields: "id,name,price,images,stock_status,permalink",
            },
          });

          if (response.data && response.data.length > 0) {
            const products = response.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: `$${p.price} ARS`,
              stock: p.stock_status === "instock" ? "En stock" : "Sin stock",
              url: p.permalink,
              image: p.images?.[0]?.src || null,
            }));

            console.log(
              `[WooCommerce Tool] ✅ Found ${products.length} products with strategy "${searchTerm}"`,
            );

            return {
              found: true,
              count: products.length,
              products,
              search_used: searchTerm, // Para debug
              strategy_number: i + 1,
            };
          }

          console.log(
            `[WooCommerce Tool] ⚠️ No results with "${searchTerm}", trying next strategy...`,
          );
        } catch (error: any) {
          console.error(
            `[WooCommerce Tool] ❌ Error with strategy "${searchTerm}":`,
            error.message,
          );
          // Continue para próxima estratégia
        }
      }

      // Nenhuma estratégia funcionou
      console.log(
        `[WooCommerce Tool] ❌ No products found after ${searchStrategies.length} strategies`,
      );
      return {
        found: false,
        error:
          "No encontré ese producto en el catálogo. Podés consultar por otro modelo o verificar el nombre.",
      };
    },
  },

  // =====================================
  // TOOL 2: Get Order Details
  // =====================================
  getOrderDetails: {
    description:
      "Obtener detalles completos de un pedido usando número de pedido y email del cliente. IMPORTANTE: Requiere validación de email para proteger datos personales. Retorna estado, productos, dirección, tracking, fechas.",
    parameters: z.object({
      order_id: z.string().describe('Número del pedido (ej: "27072")'),
      email: z
        .string()
        .email()
        .describe("Email del cliente para validación de ownership"),
    }),
    execute: async ({
      order_id,
      email,
    }: {
      order_id: string;
      email: string;
    }) => {
      console.log(
        `[WooCommerce Tool] getOrderDetails: order=${order_id}, email=${email.substring(0, 5)}***`,
      );

      try {
        // Fetch order from WooCommerce
        const response = await woocommerceClient.get(`/orders/${order_id}`);
        const order = response.data;

        // 🔒 CRITICAL: Validate ownership (security)
        if (order.billing.email.toLowerCase() !== email.toLowerCase()) {
          console.warn("[WooCommerce Tool] ⚠️ Ownership validation failed");
          return {
            found: false,
            error: "No encontré ese pedido con ese email. Verificá los datos.",
          };
        }

        // Map status to Spanish
        const statusMap: Record<string, string> = {
          pending: "Pendiente de pago",
          processing: "En preparación",
          "on-hold": "En espera",
          completed: "Entregado",
          cancelled: "Cancelado",
          refunded: "Reembolsado",
          failed: "Pago fallido",
        };

        const orderDetails = {
          found: true,
          id: order.id,
          number: order.number,
          status: statusMap[order.status] || order.status,
          total: `$${order.total} ARS`,
          date: new Date(order.date_created).toLocaleDateString("es-AR"),
          products: order.line_items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: `$${item.price} ARS`,
          })),
          shipping_address: order.shipping
            ? {
                address: order.shipping.address_1,
                city: order.shipping.city,
                state: order.shipping.state,
                postcode: order.shipping.postcode,
              }
            : null,
          tracking:
            order.meta_data?.find((m: any) => m.key === "_tracking_number")
              ?.value || null,
        };

        console.log(
          `[WooCommerce Tool] ✅ Order found: #${order.number}, status: ${order.status}`,
        );

        return orderDetails;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn("[WooCommerce Tool] ⚠️ Order not found");
          return {
            found: false,
            error: "Pedido no encontrado",
          };
        }

        console.error(
          "[WooCommerce Tool] ❌ getOrderDetails error:",
          error.message,
        );
        return {
          found: false,
          error: "Error al consultar el pedido. Intentá de nuevo.",
        };
      }
    },
  },

  // =====================================
  // TOOL 3: Check Product Stock
  // =====================================
  checkProductStock: {
    description:
      "Verificar disponibilidad de stock de un producto específico y opcionalmente un talle. Retorna si está disponible, cantidad de unidades y precio.",
    parameters: z.object({
      product_id: z
        .string()
        .describe("ID del producto (viene de searchProducts)"),
      size: z
        .string()
        .optional()
        .describe('Talle específico a verificar (ej: "42", "M", "L")'),
    }),
    execute: async ({
      product_id,
      size,
    }: {
      product_id: string;
      size?: string;
    }) => {
      console.log(
        `[WooCommerce Tool] checkProductStock: product_id=${product_id}, size=${size || "N/A"}`,
      );

      try {
        const response = await woocommerceClient.get(`/products/${product_id}`);
        const product = response.data;

        const stockInfo = {
          in_stock: product.stock_status === "instock",
          quantity: product.stock_quantity || null,
          name: product.name,
          price: `$${product.price} ARS`,
          size_requested: size || null,
        };

        // TODO: Future enhancement - check specific size from variations
        // For now, return general stock info
        if (size) {
          console.log(
            `[WooCommerce Tool] ⚠️ Size-specific stock not implemented yet, returning general stock`,
          );
        }

        console.log(
          `[WooCommerce Tool] ✅ Stock check: ${stockInfo.in_stock ? "Available" : "Out of stock"}`,
        );

        return stockInfo;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn("[WooCommerce Tool] ⚠️ Product not found");
          return {
            error: "Producto no encontrado",
          };
        }

        console.error(
          "[WooCommerce Tool] ❌ checkProductStock error:",
          error.message,
        );
        return {
          error: "Error al verificar stock",
        };
      }
    },
  },
};

/**
 * Convert tools to Claude SDK format (inputSchema)
 */
export function getClaudeTools() {
  return {
    searchProducts: {
      description: woocommerceTools.searchProducts.description,
      inputSchema: woocommerceTools.searchProducts.parameters,
      execute: woocommerceTools.searchProducts.execute,
    },
    getOrderDetails: {
      description: woocommerceTools.getOrderDetails.description,
      inputSchema: woocommerceTools.getOrderDetails.parameters,
      execute: woocommerceTools.getOrderDetails.execute,
    },
    checkProductStock: {
      description: woocommerceTools.checkProductStock.description,
      inputSchema: woocommerceTools.checkProductStock.parameters,
      execute: woocommerceTools.checkProductStock.execute,
    },
  };
}

/**
 * Convert tools to OpenAI SDK format (uses inputSchema like Claude)
 * Note: Vercel AI SDK uses 'inputSchema' for both providers
 */
export function getOpenAITools() {
  return {
    searchProducts: {
      description: woocommerceTools.searchProducts.description,
      inputSchema: woocommerceTools.searchProducts.parameters,
      execute: woocommerceTools.searchProducts.execute,
    },
    getOrderDetails: {
      description: woocommerceTools.getOrderDetails.description,
      inputSchema: woocommerceTools.getOrderDetails.parameters,
      execute: woocommerceTools.getOrderDetails.execute,
    },
    checkProductStock: {
      description: woocommerceTools.checkProductStock.description,
      inputSchema: woocommerceTools.checkProductStock.parameters,
      execute: woocommerceTools.checkProductStock.execute,
    },
  };
}
