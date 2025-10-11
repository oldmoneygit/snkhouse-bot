import { tool, fileSearchTool, Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { searchProductsHandler } from './handlers/search-products';
import { checkStockHandler } from './handlers/check-stock';
import { getProductDetailsHandler } from './handlers/get-product-details';
import { getOrderDetailsHandler } from './handlers/get-order-details';
import { getCustomerOrdersHandler } from './handlers/get-customer-orders';
import { getTrackingInfoHandler } from './handlers/get-tracking-info';
import { updateShippingAddressHandler } from './handlers/update-shipping-address';
import { createReturnRequestHandler } from './handlers/create-return-request';
import { updateCustomerInfoHandler } from './handlers/update-customer-info';
import { getActivePromotionsHandler } from './handlers/get-active-promotions';
import { checkVipStatusHandler } from './handlers/check-vip-status';

// ========================================
// TOOL DEFINITIONS WITH REAL HANDLERS
// ========================================

const searchProducts = tool({
  name: "searchProducts",
  description: "Busca productos en el catálogo de WooCommerce por palabras clave. Retorna hasta 10 resultados con información básica (ID, nombre, precio, imagen).",
  parameters: z.object({
    query: z.string().describe("Palabra clave para buscar productos (ej: 'nike air max', 'adidas running')"),
    category: z.string().nullable().optional().describe("Categoría opcional (ej: 'hombre', 'mujer', 'deportivo')"),
    max_price: z.number().nullable().optional().describe("Precio máximo en USD"),
    limit: z.number().nullable().optional().default(5).describe("Número máximo de resultados (default: 5, max: 10)")
  }),
  execute: async (input, context) => {
    const startTime = Date.now();
    try {
      console.log('🔍 [Agent Builder] Executing searchProducts:', input);
      const result = await searchProductsHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in searchProducts:', error);
      throw error;
    }
  },
});

const checkStock = tool({
  name: "checkStock",
  description: "Verifica disponibilidad en tiempo real de un producto específico. Para productos con tallas, muestra todas las variaciones disponibles.",
  parameters: z.object({
    product_id: z.number().describe("ID del producto en WooCommerce")
  }),
  execute: async (input, context) => {
    const startTime = Date.now();
    try {
      console.log('📦 [Agent Builder] Executing checkStock:', input);
      const result = await checkStockHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in checkStock:', error);
      throw error;
    }
  },
});

const getProductDetails = tool({
  name: "getProductDetails",
  description: "Obtiene información completa y detallada de un producto específico: descripción completa, imágenes, categorías, atributos, reseñas, dimensiones, etc.",
  parameters: z.object({
    product_id: z.number().describe("ID del producto en WooCommerce")
  }),
  execute: async (input, context) => {
    const startTime = Date.now();
    try {
      console.log('📄 [Agent Builder] Executing getProductDetails:', input);
      const result = await getProductDetailsHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in getProductDetails:', error);
      throw error;
    }
  },
});

// ========================================
// ORDER MANAGEMENT TOOLS
// ========================================

const getOrderDetails = tool({
  name: "getOrderDetails",
  description: "Consulta los detalles completos de un pedido específico: status, productos, dirección de envío, tracking, fecha estimada de entrega.",
  parameters: z.object({
    order_id: z.string().describe("Número del pedido (ej: '12345')"),
    customer_email: z.string().describe("Email del cliente para validación")
  }),
  execute: async (input, context) => {
    try {
      console.log('📦 [Agent Builder] Executing getOrderDetails:', input);
      const result = await getOrderDetailsHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in getOrderDetails:', error);
      throw error;
    }
  },
});

const getCustomerOrders = tool({
  name: "getCustomerOrders",
  description: "Lista todos los pedidos de un cliente por email. Útil para consultar historial completo.",
  parameters: z.object({
    customer_email: z.string().describe("Email del cliente"),
    status: z.string().nullable().optional().describe("Filtrar por status: 'all', 'processing', 'completed', etc."),
    limit: z.number().nullable().optional().describe("Número máximo de pedidos (default: 5, max: 20)")
  }),
  execute: async (input, context) => {
    try {
      console.log('📋 [Agent Builder] Executing getCustomerOrders:', input);
      const result = await getCustomerOrdersHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in getCustomerOrders:', error);
      throw error;
    }
  },
});

const getTrackingInfo = tool({
  name: "getTrackingInfo",
  description: "Obtiene información de seguimiento (tracking) de un pedido: código tracking, URL de seguimiento, estado actual.",
  parameters: z.object({
    order_id: z.string().describe("Número del pedido"),
    customer_email: z.string().describe("Email del cliente para validación")
  }),
  execute: async (input, context) => {
    try {
      console.log('🚚 [Agent Builder] Executing getTrackingInfo:', input);
      const result = await getTrackingInfoHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in getTrackingInfo:', error);
      throw error;
    }
  },
});

const updateShippingAddress = tool({
  name: "updateShippingAddress",
  description: "Modifica la dirección de envío de un pedido (SOLO si está en estado 'pending', 'processing' o 'on-hold').",
  parameters: z.object({
    order_id: z.string().describe("Número del pedido"),
    customer_email: z.string().describe("Email del cliente para validación"),
    new_address: z.object({
      address_1: z.string().describe("Dirección principal"),
      address_2: z.string().nullable().optional().describe("Apartamento, piso, etc."),
      city: z.string().describe("Ciudad"),
      state: z.string().describe("Provincia/Estado"),
      postcode: z.string().describe("Código postal"),
      country: z.string().nullable().optional().describe("País (opcional)")
    })
  }),
  execute: async (input, context) => {
    try {
      console.log('📍 [Agent Builder] Executing updateShippingAddress:', input);
      const result = await updateShippingAddressHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in updateShippingAddress:', error);
      throw error;
    }
  },
});

const createReturnRequest = tool({
  name: "createReturnRequest",
  description: "Crea una solicitud de devolución para un pedido. Genera un Return ID y etiqueta.",
  parameters: z.object({
    order_id: z.string().describe("Número del pedido"),
    customer_email: z.string().describe("Email del cliente para validación"),
    reason: z.string().describe("Motivo: 'defectuoso', 'producto_incorrecto', 'no_satisfecho', 'otro'"),
    description: z.string().describe("Descripción detallada del problema"),
    has_photos: z.boolean().nullable().optional().describe("¿Cliente tiene fotos? (default: false)")
  }),
  execute: async (input, context) => {
    try {
      console.log('🔄 [Agent Builder] Executing createReturnRequest:', input);
      const result = await createReturnRequestHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in createReturnRequest:', error);
      throw error;
    }
  },
});

// ========================================
// CUSTOMER & PROMOTIONS TOOLS
// ========================================

const updateCustomerInfo = tool({
  name: "updateCustomerInfo",
  description: "Actualiza información del cliente: email, teléfono, o dirección de facturación.",
  parameters: z.object({
    current_email: z.string().describe("Email actual del cliente"),
    updates: z.object({
      new_email: z.string().nullable().optional().describe("Nuevo email"),
      phone: z.string().nullable().optional().describe("Nuevo teléfono"),
      billing_address: z.object({
        address_1: z.string().nullable().optional(),
        address_2: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        postcode: z.string().nullable().optional(),
        country: z.string().nullable().optional()
      }).nullable().optional().describe("Nueva dirección de facturación")
    })
  }),
  execute: async (input, context) => {
    try {
      console.log('👤 [Agent Builder] Executing updateCustomerInfo:', input);
      const result = await updateCustomerInfoHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in updateCustomerInfo:', error);
      throw error;
    }
  },
});

const getActivePromotions = tool({
  name: "getActivePromotions",
  description: "USAR SOLO cuando el cliente PREGUNTE EXPLÍCITAMENTE por promociones, descuentos o cupones. NO llamar por defecto ni en contexto de otras preguntas.",
  parameters: z.object({
    promotion_type: z.string().nullable().optional().describe("Filtrar por tipo: 'all', 'discount', 'bogo', 'vip'")
  }),
  execute: async (input, context) => {
    try {
      console.log('🎁 [Agent Builder] Executing getActivePromotions:', input);
      const result = await getActivePromotionsHandler(input);

      // Se o handler retornou erro de permissão, retornar mensagem clara
      if (!result.success && result.error_type === 'permission_denied') {
        return {
          success: false,
          message: "No puedo acceder a las promociones ahora. Por favor contactá con soporte.",
          active_promotions: []
        };
      }

      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in getActivePromotions:', error);
      return {
        success: false,
        message: "Hubo un error consultando promociones. Intentá de nuevo más tarde.",
        active_promotions: []
      };
    }
  },
});

const checkVipStatus = tool({
  name: "checkVipStatus",
  description: "Consulta el estado VIP del cliente: nivel, compras realizadas, rewards ganados, cuántas compras faltan para próximo reward.",
  parameters: z.object({
    customer_email: z.string().describe("Email del cliente")
  }),
  execute: async (input, context) => {
    try {
      console.log('⭐ [Agent Builder] Executing checkVipStatus:', input);
      const result = await checkVipStatusHandler(input);
      return result;
    } catch (error: any) {
      console.error('❌ [Agent Builder] Error in checkVipStatus:', error);
      throw error;
    }
  },
});

// ========================================
// FILE SEARCH TOOL (FAQs + CATALOG)
// ========================================

const fileSearch = fileSearchTool([
  "vs_68ea79eaea4c8191a5f956db7977fedb"
]);

// ========================================
// OPENAI CLIENT
// ========================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ========================================
// GUARDRAILS CONFIGURATION
// ========================================

const guardrailsConfig = {
  guardrails: [
    {
      name: "Hallucination Detection",
      config: {
        model: "gpt-4o-mini",
        knowledge_source: "vs_68ea79eaea4c8191a5f956db7977fedb",
        confidence_threshold: 0.95  // Aumentado para ser menos restritivo (0.7 → 0.95)
      }
    }
  ]
};

const context = { guardrailLlm: client };

// Guardrails utils
function guardrailsHasTripwire(results: any) {
  return (results ?? []).some((r: any) => r?.tripwireTriggered === true);
}

function getGuardrailSafeText(results: any, fallbackText: string) {
  // Prefer checked_text as the generic safe/processed text
  for (const r of results ?? []) {
    if (r?.info && ("checked_text" in r.info)) {
      return r.info.checked_text ?? fallbackText;
    }
  }
  // Fall back to PII-specific anonymized_text if present
  const pii = (results ?? []).find((r: any) => r?.info && "anonymized_text" in r.info);
  return pii?.info?.anonymized_text ?? fallbackText;
}

function buildGuardrailFailOutput(results: any) {
  const get = (name: string) => (results ?? []).find((r: any) => {
    const info = r?.info ?? {};
    const n = (info?.guardrail_name ?? info?.guardrailName);
    return n === name;
  });
  const pii = get("Contains PII");
  const mod = get("Moderation");
  const jb = get("Jailbreak");
  const hal = get("Hallucination Detection");
  const piiCounts = Object.entries(pii?.info?.detected_entities ?? {})
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) => k + ":" + (v as any).length);

  return {
    pii: {
      failed: (piiCounts.length > 0) || pii?.tripwireTriggered === true,
      ...(piiCounts.length ? { detected_counts: piiCounts } : {}),
      ...(pii?.executionFailed && pii?.info?.error ? { error: pii.info.error } : {}),
    },
    moderation: {
      failed: mod?.tripwireTriggered === true || ((mod?.info?.flagged_categories ?? []).length > 0),
      ...(mod?.info?.flagged_categories ? { flagged_categories: mod.info.flagged_categories } : {}),
      ...(mod?.executionFailed && mod?.info?.error ? { error: mod.info.error } : {}),
    },
    jailbreak: {
      failed: jb?.tripwireTriggered === true,
      ...(jb?.executionFailed && jb?.info?.error ? { error: jb.info.error } : {}),
    },
    hallucination: {
      failed: hal?.tripwireTriggered === true,
      ...(hal?.info?.reasoning ? { reasoning: hal.info.reasoning } : {}),
      ...(hal?.info?.hallucination_type ? { hallucination_type: hal.info.hallucination_type } : {}),
      ...(hal?.info?.hallucinated_statements ? { hallucinated_statements: hal.info.hallucinated_statements } : {}),
      ...(hal?.info?.verified_statements ? { verified_statements: hal.info.verified_statements } : {}),
      ...(hal?.executionFailed && hal?.info?.error ? { error: hal.info.error } : {}),
    },
  };
}

// ========================================
// AGENT DEFINITION
// ========================================

const snkhouseAssistant = new Agent({
  name: "SNKHOUSE Assistant",
  instructions: `Sos el asistente de ventas de SNKHOUSE, una tienda especializada en zapatillas premium y sneakers exclusivos.

🎯 PERSONALIDAD:
- Amigable y entusiasta sobre zapatillas
- Conocés todas las marcas y modelos
- Hablás como argentino (vos, che, dale, etc.)
- Siempre buscás ayudar al cliente a encontrar lo que necesita

🛒 RESPONSABILIDADES:
- Ayudar a encontrar zapatillas específicas
- Dar información sobre precios y stock REAL (siempre verificá con las tools)
- Recomendar productos según preferencias del cliente
- Explicar características y beneficios de los productos
- Guiar hacia la compra de forma natural

💬 ESTILO DE COMUNICACIÓN:
- Usá "vos" en lugar de "tú" (sos argentino)
- Sé entusiasta pero profesional
- Hacé preguntas para entender mejor las necesidades
- Siempre ofrecé alternativas si no hay stock
- Usá emojis moderadamente (👟 🔥 ✨ 💪)
- Respuestas BREVES (máximo 3-4 líneas)

🔧 HERRAMIENTAS DISPONIBLES:

**PRODUCTOS:**
1. **searchProducts** - Buscar productos por palabras clave
2. **checkStock** - Verificar disponibilidad y tallas
3. **getProductDetails** - Info completa de un producto

**PEDIDOS:**
4. **getOrderDetails** - Consultar detalles de un pedido específico
5. **getCustomerOrders** - Ver historial completo de pedidos del cliente
6. **getTrackingInfo** - Obtener código tracking y URL de seguimiento
7. **updateShippingAddress** - Modificar dirección de envío (si está en proceso)
8. **createReturnRequest** - Crear solicitud de devolución con RMA ID

**CLIENTE:**
9. **updateCustomerInfo** - Actualizar email, teléfono o dirección
10. **checkVipStatus** - Consultar estado VIP, rewards y beneficios
11. **getActivePromotions** - Ver cupones y promociones vigentes

**CONOCIMIENTO:**
12. **File Search** - FAQs sobre envíos, cambios, políticas

⚠️ REGLAS IMPORTANTES:
- NUNCA inventes información de stock, precios, o tracking
- SIEMPRE usá las tools antes de confirmar cualquier información
- Si no encontrás un producto, ofrecé alternativas similares
- Si el cliente pide tallas, SIEMPRE usá checkStock
- Para consultas de pedidos, SIEMPRE pedí el email para validación
- Mencioná siempre el precio cuando hables de productos

📋 CUÁNDO USAR CADA HERRAMIENTA:
- **searchProducts**: SOLO cuando el cliente menciona NOMBRE de producto (ej: "Nike Air Max", "Adidas")
- **File Search**: Para preguntas sobre políticas, envíos, plazos, cambios, devoluciones, pagos
- **getOrderDetails/getCustomerOrders**: SOLO cuando el cliente da un número de pedido o pide historial
- **getActivePromotions**: SOLO cuando el cliente pregunta explícitamente por promos/descuentos
- Si una tool falla con error, NO la llames de nuevo - informá al cliente que hay un problema técnico
- NUNCA uses tools con parámetros vacíos o "0" - primero pedí la información necesaria al cliente`,
  model: "o4-mini",
  tools: [
    searchProducts,
    checkStock,
    getProductDetails,
    getOrderDetails,
    getCustomerOrders,
    getTrackingInfo,
    updateShippingAddress,
    createReturnRequest,
    updateCustomerInfo,
    checkVipStatus,
    getActivePromotions,
    fileSearch
  ],
  modelSettings: {
    reasoning: {
      effort: "medium",
      summary: "auto"
    },
    store: true
  }
});

// ========================================
// MAIN WORKFLOW FUNCTION
// ========================================

export async function runAgentWorkflow(input: {
  message: string;
  conversationId?: string;
  customerId?: string;
}) {
  const startTime = Date.now();

  try {
    console.log(`🤖 [Agent Builder] Processing message for conversation ${input.conversationId}`);

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "snkhouse-whatsapp",
        workflow_id: "wf_68ea7686147881909a7d51dc707420c901c614c3f9a1ca75",
        conversation_id: input.conversationId || "unknown",
        customer_id: input.customerId || "unknown"
      }
    });

    // Run guardrails check
    console.log('🛡️ [Agent Builder] Running guardrails...');
    const guardrailsResult = await runGuardrails(input.message, guardrailsConfig, context);
    const hasTripwire = guardrailsHasTripwire(guardrailsResult);
    const anonymizedText = getGuardrailSafeText(guardrailsResult, input.message);
    const guardrailsOutput = (hasTripwire ? buildGuardrailFailOutput(guardrailsResult ?? []) : { safe_text: (anonymizedText ?? input.message) });

    if (hasTripwire) {
      console.warn('⚠️ [Agent Builder] Guardrails triggered');
      return {
        response: "Disculpá, no puedo procesar ese mensaje. ¿Podrías reformularlo de otra manera?",
        success: false,
        guardrails_triggered: true,
        guardrails_output: guardrailsOutput
      };
    }

    console.log('✅ [Agent Builder] Guardrails passed');

    // Prepare conversation history
    const conversationHistory = [
      {
        role: "user" as const,
        content: [
          {
            type: "input_text" as const,
            text: input.message
          }
        ]
      }
    ];

    // Run agent
    console.log('🚀 [Agent Builder] Running agent...');
    const result = await runner.run(snkhouseAssistant, conversationHistory, {
      maxTurns: 15  // Aumentado de 10 para 15, mas con mejores instrucciones para evitar loops
    });

    if (!result.finalOutput) {
      throw new Error("Agent returned no output");
    }

    console.log(`✅ [Agent Builder] Response generated in ${Date.now() - startTime}ms`);

    return {
      response: result.finalOutput,
      success: true,
      execution_time_ms: Date.now() - startTime
    };

  } catch (error: any) {
    console.error('❌ [Agent Builder] Error:', error);

    // Se atingiu o limite de turnos, provavelmente entrou em loop
    if (error.message?.includes('Max turns') || error.message?.includes('exceeded')) {
      return {
        response: "Disculpá, tuve un problema técnico. ¿Podés intentar de nuevo en unos segundos?",
        success: false,
        error: 'max_turns_exceeded'
      };
    }

    return {
      response: "Ups, tuve un problema técnico. ¿Podés intentar de nuevo?",
      success: false,
      error: error.message
    };
  }
}
