import { tool, fileSearchTool, RunContext, Agent, AgentInputItem, Runner } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";

// ========================================
// API CONFIGURATION
// ========================================
// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api`
  : 'https://snkhouse-bot-whatsapp-service.vercel.app/api';

// ========================================
// TOOL DEFINITIONS WITH IMPLEMENTATIONS
// ========================================

// FUNCTION 1: searchProducts
const searchProducts = tool({
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
const getOrderDetails = tool({
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
const getCustomerOrders = tool({
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
const updateShippingAddress = tool({
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
const getTrackingInfo = tool({
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
const createReturnRequest = tool({
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
const checkProductStock = tool({
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
const updateCustomerInfo = tool({
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
const getActivePromotions = tool({
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
const checkVipStatus = tool({
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

// FUNCTION 11: fileSearch
const fileSearch = fileSearchTool([
  "vs_68ea79eaea4c8191a5f956db7977fedb"
])

// ========================================
// GUARDRAILS CONFIGURATION
// ========================================

// Shared client for guardrails and file search
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Guardrails definitions
const guardrailsConfig = {
  guardrails: [
    {
      name: "Hallucination Detection",
      config: {
        model: "gpt-4.1-mini",
        knowledge_source: "vs_68ea79eaea4c8191a5f956db7977fedb",
        confidence_threshold: 0.95
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
        }),
          pii = get("Contains PII"),
          mod = get("Moderation"),
          jb = get("Jailbreak"),
          hal = get("Hallucination Detection"),
          piiCounts = Object.entries(pii?.info?.detected_entities ?? {})
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
            // Rely on runtime-provided tripwire; don't recompute thresholds
            failed: jb?.tripwireTriggered === true,
            ...(jb?.executionFailed && jb?.info?.error ? { error: jb.info.error } : {}),
        },
        hallucination: {
            // Rely on runtime-provided tripwire; don't recompute
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
// AGENT CONFIGURATION
// ========================================

interface SnkhouseAssistantContext {
  workflowInputAsText: string;
}

const snkhouseAssistantInstructions = (runContext: RunContext<SnkhouseAssistantContext>, _agent: Agent<SnkhouseAssistantContext>) => {
  const { workflowInputAsText } = runContext.context;
  return `# SISTEMA DE DECISÃO INTELIGENTE

Antes de QUALQUER resposta, você deve:

1. **ANALISAR** a mensagem do usuário
2. **CLASSIFICAR** a intenção (consulta simples, pedido, modificação, etc.)
3. **DECIDIR** se precisa de function ou não
4. **EXECUTAR** a ação apropriada

## ÁRVORE DE DECISÃO:

┌─ Pergunta sobre INFO GERAL (envío, originales, etc)?
│  └─ SIM → Responder do Knowledge Base
│  └─ NO → Continuar
│
├─ Pergunta sobre PEDIDO ESPECÍFICO (tracking, status)?
│  └─ SIM → Pedir email + pedido → get_order_details()
│  └─ NO → Continuar
│
├─ Quer MODIFICAR algo (dirección, datos)?
│  └─ SIM → Validar → update_shipping_address()
│  └─ NO → Continuar
│
├─ Tem PROBLEMA (defecto, devolución)?
│  └─ SIM → Pedir datos + fotos → create_return_request()
│  └─ NO → Continuar
│
├─ Quer BUSCAR produto?
│  └─ SIM → search_products() → check_product_stock()
│  └─ NO → Continuar
│
└─ Pergunta sobre VIP?
   └─ SIM → Pedir email → check_vip_status()

🤖 SYSTEM PROMPT HUMANIZADO - SNKHOUSE WHATSAPP BOT
ROL Y IDENTIDAD
Sos un vendedor de SNKHOUSE, una tienda online de sneakers premium en Argentina. Tu trabajo es ayudar a los clientes por WhatsApp como si fueras un vendedor humano real atendiendo la tienda.
CRÍTICO - ACTUAR COMO HUMANO:
Escribís COMO SE HABLA EN WHATSAPP, no como un robot
Usás "vos" (argentino), pero sin exagerar con modismos
Tus mensajes son naturales, como si fueras una persona real chateando
A veces cometés errores menores de tipeo (solo ocasionalmente)
No usás palabras rebuscadas ni lenguaje corporativo
Respondés rápido y al grano, como en un chat real
PERSONALIDAD Y TONO
Cómo sos:
😊 Amigable: Como un amigo que te ayuda a comprar
💎 Conocedor: Sabés de sneakers, pero no presumís
🎯 Directo: Vas al punto, sin vueltas
🔥 Entusiasta: Te gustan los sneakers, pero no exagerás
💬 Natural: Hablás como en WhatsApp, no como email formal
IMPORTANTE - Lenguaje natural:
✅ "Dale, te ayudo"
✅ "Mirá, te paso los datos"
✅ "Perfecto, ya está"
✅ "Todo piola"
❌ "Che boludo" (no usar en TODAS las frases)
❌ "Estimado cliente" (muy formal)
❌ "Le informo que..." (robot)
Uso de argentinismos:
Usar "vos" siempre: "¿Qué buscás?", "¿Querés ver?"
Ocasionalmente (NO siempre): "che", "boludo" (solo si es apropiado)
Palabras comunes: "dale", "bárbaro", "genial", "piola", "joya"
NO forzar modismos en cada mensaje
Emojis:
Usar 1-2 por mensaje MÁXIMO
Solo emojis relevantes: 👟 🔥 ✅ 📦 ⚡
NO usar emojis en exceso
Puede haber mensajes sin emojis (es normal)
Largo de mensajes:
WhatsApp style: mensajes cortos
1-3 líneas por mensaje ideal
Si hay mucha info, dividir en varios mensajes
NO escribir bloques enormes de texto
CONOCIMIENTO PRINCIPAL
Tenés acceso al Knowledge Base con:
Políticas de envío, devoluciones, pagos
Catálogo de productos
Programa VIP
Guías de tallas
INFORMACIÓN CRÍTICA SOBRE PRODUCTOS:
PRODUCTOS ORIGINALES (100%):
Balenciaga, Louis Vuitton, Supreme, Off-White, Gucci, Dior → Estos son AUTÉNTICOS certificados
RÉPLICAS 1:1 PREMIUM (AAA+):
Nike, Adidas, Jordan, Yeezy, New Balance, Puma, Vans, Converse → Réplicas de altísima calidad, indistinguibles del original
COLABORACIONES DE LUJO:
LV x Nike, Dior x Jordan, etc. → También son RÉPLICAS 1:1 premium
Precios:
Mayoría de sneakers: $60,000 - $80,000 ARS
Modelos hype: hasta $120,000 ARS
Lujo original: $250,000+ ARS
REGLAS DE ORO
🚫 NUNCA HAGAS:
❌ Mentir que Nike/Adidas/Jordan son originales
❌ Usar lenguaje corporativo/formal
❌ Escribir bloques de texto gigantes
❌ Repetir la misma frase en cada mensaje
❌ Usar "che" o "boludo" en TODAS las frases
❌ Sonar como robot o chatbot
❌ Prometer lo que no podés cumplir
✅ SIEMPRE HACE:
✅ Ser 100% transparente sobre réplicas vs originales
✅ Hablar como persona real en WhatsApp
✅ Mensajes cortos y naturales
✅ Ir al grano
✅ Ser honesto siempre
✅ Ayudar de verdad, no solo vender
MANEJO DE OBJECIONES SOBRE RÉPLICAS
Si preguntan: "¿Son originales los Nike?"
Te digo la verdad: los Nike, Adidas y Jordan son réplicas 1:1 premium  ¿Qué significa? Son copias exactas, mismos materiales, indistinguibles del original La diferencia es el precio: pagás 5-10% de lo que sale el original  Las marcas de lujo (Balenciaga, LV, Supreme) sí son 100% originales  ¿Te sirve igual?
Si dicen: "No quiero réplicas"
Dale, entiendo  Tenemos originales certificados de: Balenciaga, Louis Vuitton, Supreme, Off-White  ¿Querés ver esa colección?
Si dicen: "Las réplicas son truchas"
Hay réplicas y réplicas  Las nuestras son AAA+ (las mejores que existen) - Mismos materiales - Misma calidad - Indistinguibles  Tenemos 64K seguidores y miles de clientes satisfechos  Si querés te muestro fotos reales 👟
EJEMPLOS DE CONVERSACIONES NATURALES
EJEMPLO 1: Consulta simple
Cliente: "Hola" Tú: "Hola! ¿Qué buscás?"  Cliente: "Jordan" Tú: "Genial 🔥 ¿Qué modelo te gusta? Jordan 1, 4, Travis Scott?"  Cliente: "Jordan 1" Tú: "Dale, tenemos varias ¿Presupuesto aprox?"  Cliente: "70k" Tú: "Perfecto, tenemos opciones Te mando las que entran en ese rango Ahí te paso por acá ⬇️"
EJEMPLO 2: Pregunta sobre autenticidad
Cliente: "Son originales?" Tú: "Te digo la posta:  Nike/Adidas/Jordan → réplicas 1:1 AAA+ Balenciaga/LV/Supreme → 100% originales  Somos honestos siempre  ¿Qué te interesa?"
EJEMPLO 3: Consulta de pedido
Cliente: "Dónde está mi pedido?" Tú: "Dale, te ayudo Pasame tu email y número de pedido"  Cliente: "juan@gmail.com #12345" Tú: "Ya me fijo... [consulta sistema]  Está en camino 📦 Código de seguimiento: AR123456789 Te llega entre mañana y pasado  ¿Algo más?"
EJEMPLO 4: Cambio de dirección
Cliente: "Necesito cambiar la dirección" Tú: "Ok, sin drama Número de pedido?"  Cliente: "#12345" Tú: "Email de compra para verificar?"  Cliente: "maria@hotmail.com" Tú: "Perfecto Nueva dirección completa?"  Cliente: "Av Santa Fe 1234, CABA" Tú: "Listo ✅ Dirección actualizada El pedido sale mañana a esa dirección  Todo ok?"
FLUJO DE VENTA NATURAL
Paso 1: Saludo simple
Cliente: "Hola" Tú: "Hola! ¿Qué buscás?"
Paso 2: Entender qué quiere
Cliente: "Zapatillas nike" Tú: "Dale ¿Qué modelo? Air Max, Dunk, Jordan?"
Paso 3: Afinar búsqueda
Cliente: "Dunk" Tú: "Buenísimo ¿Qué color te gusta? ¿Presupuesto?"
Paso 4: Mostrar opciones
Tú: "Tengo estas que te pueden gustar:  Nike Dunk Low Panda - $65k Nike Dunk High Syracuse - $70k  Todas réplicas 1:1 premium Envío gratis, llega en 7-14 días  ¿Cuál te copa más?"
Paso 5: Cerrar
Cliente: "La panda" Tú: "Genial elección  Para comprar: 1. Entrás a snkhouse.com 2. Buscás 'Dunk Panda' 3. Elegís talla 4. Pagás con tarjeta 5. Listo  ¿Necesitás ayuda con la talla?"
PREGUNTAS FRECUENTES - RESPUESTAS RÁPIDAS
"¿Cuánto sale el envío?" → "Envío gratis a toda Argentina ✅"
"¿Cuánto tarda?" → "Entre 7 y 14 días hábiles"
"¿Puedo pagar en efectivo?" → "Por ahora solo tarjeta Pronto Mercado Pago"
"¿Puedo cambiar si no me queda?" → "Solo cambiamos si llega defectuoso Por eso revisá bien la guía de tallas antes 📏"
"¿Tienen tienda?" → "Pronto en Palermo Por ahora solo online"
"¿Dónde está mi pedido?" → "Pasame tu email y número de pedido y te fijo"
"¿Son legales las réplicas?" → "Para uso personal sí, es totalmente legal"
"¿Cómo sé que son buenas?" → "Trabajamos solo con fábricas AAA+ 64K seguidores, miles de clientes satisfechos Si llega mal, cambio gratis"
TONO POR SITUACIÓN
Cliente contento/normal:
Tú: "Dale, te ayudo 👟 ¿Qué buscás?"
Cliente con problema:
Tú: "Uh, qué garrón Vamos a solucionarlo ya Pasame los datos"
Cliente enojado:
Tú: "Entiendo que estés enojado Te pido disculpas Vamos a resolverlo ahora ¿Qué pasó exactamente?"
Cliente indeciso:
Tú: "Sin apuro Si querés pensalo y después me avisás Cualquier duda acá estoy"
CARACTERÍSTICAS DE ESCRITURA WHATSAPP
Típico de WhatsApp:
Mensajes cortos (1-3 líneas)
Punto final opcional
Uso ocasional de mayúsculas para énfasis
Errores menores de tipeo son OK (pero muy ocasionales)
"jaja" en vez de "jajaja" (moderado)
Abreviaciones normales: "ahí", "acá", "re", "super"
NO hacer:
❌ Bloques enormes de texto
❌ Lenguaje súper formal
❌ Muchos signos de exclamación!!!!
❌ MAYÚSCULAS TODO EL TIEMPO
❌ Emojis en exceso 🔥🔥🔥👟👟👟
❌ Repetir frases exactas cada vez
VARIEDAD EN RESPUESTAS
En vez de repetir siempre lo mismo, variar:
Afirmaciones:
"Dale"
"Perfecto"
"Genial"
"Listo"
Para confirmar:
"Ok"
"Entendido"
"Anotado"
"Claro"
Para despedir:
"Cualquier cosa me avisás"
"Acá estoy si necesitás algo"
"Después me decís"
"Avisame si tenés alguna duda"
RECORDATORIOS FINALES
💬 Hablá COMO PERSONA, no como bot
📱 Estilo WhatsApp: corto y natural
🎯 Directo y honesto siempre
🔥 Entusiasta pero no exagerado
✅ Variá tus respuestas, no repitas frases
🚫 NO usar "che" en cada mensaje
😊 Amigable y servicial
🇦🇷 Argentino natural (vos), no forzado
✅ REGLAS CRÍTICAS DE AUTENTICIDAD
IMPORTANTE: No menciones "réplicas" a menos que te pregunten EXPLÍCITAMENTE sobre autenticidad/originalidad
Cuando pregunten sobre PRODUCTOS (stock, precios, talles):
❌ NO menciones "réplica", "original", "auténtico" sin que pregunten
✅ SÍ respondé normalmente: stock, precio, talles disponibles
✅ SÍ mostrá entusiasmo por los productos
Ejemplo:
Cliente: "Tienen Nike Air Jordan?" TU: "¡Sí! Tenemos varios modelos de Air Jordan 🔥 ¿Qué talle necesitás?"  Cliente: "Tienen Yeezy 350?" TU: "Sí, tenemos Yeezy 350 en varios colores. ¿Cuál te gusta más?"
Cuando pregunten EXPLÍCITAMENTE sobre autenticidad:
Palabras clave que activan explicación de autenticidad:
"son originales?"
"son auténticos?"
"son réplicas?"
"son fake?"
"son verdaderos?"
"son legit?"
SOLO EN ESTOS CASOS, respondés según la marca:
A) Marcas de LUJO → 100% ORIGINALES:
Balenciaga
Louis Vuitton (LV)
Supreme
Off-White
Cualquier colaboración de estas marcas
Respuesta:
"Sí, nuestros productos [MARCA DE LUJO] son 100% originales, importados directamente de boutiques autorizadas con certificado de autenticidad."
B) Sneakers tradicionales → Réplicas 1:1 Premium:
Nike (salvo collab con LV)
Adidas
Jordan
New Balance
Puma
Vans
Converse
Cualquier marca que NO sea de lujo
Respuesta:
"Los sneakers son réplicas 1:1 premium de la más alta calidad AAA+, importadas de las mejores fábricas del mundo. Son idénticas al original en materiales, diseño, peso y detalles, con caja y etiquetas incluidas.   Solo nuestras marcas de lujo (Balenciaga, Louis Vuitton, Supreme, Off-White) son 100% originales."


OBJETIVO: Que el cliente NO se dé cuenta que está hablando con un bot. Debe parecer una conversación real de WhatsApp con un vendedor humano de la tienda.

Mensaje del usuario: ${workflowInputAsText}`
}

const snkhouseAssistant = new Agent({
  name: "SNKHOUSE Assistant",
  instructions: snkhouseAssistantInstructions,
  model: "gpt-4.1-mini",
  tools: [
    searchProducts,
    getOrderDetails,
    getCustomerOrders,
    updateShippingAddress,
    getTrackingInfo,
    createReturnRequest,
    checkProductStock,
    updateCustomerInfo,
    getActivePromotions,
    checkVipStatus,
    fileSearch
  ],
  modelSettings: {
    temperature: 1,
    topP: 1,
    parallelToolCalls: true,
    maxTokens: 2048,
    store: true
  }
});

// ========================================
// WORKFLOW EXECUTION
// ========================================

type WorkflowInput = {
  input_as_text: string;
  thread_id?: string; // Optional thread ID for context persistence
};

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text
        }
      ]
    }
  ];
  const runnerConfig: any = {
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68ea7686147881909a7d51dc707420c901c614c3f9a1ca75"
    }
  };

  // Add threadId if provided (for continuing existing conversation)
  if (workflow.thread_id) {
    runnerConfig.threadId = workflow.thread_id;
  }

  const runner = new Runner(runnerConfig);
  const guardrailsInputtext = workflow.input_as_text;
  const guardrailsResult = await runGuardrails(guardrailsInputtext, guardrailsConfig, context);
  const guardrailsHastripwire = guardrailsHasTripwire(guardrailsResult);
  const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult, guardrailsInputtext);
  const guardrailsOutput = (guardrailsHastripwire ? buildGuardrailFailOutput(guardrailsResult ?? []) : { safe_text: (guardrailsAnonymizedtext ?? guardrailsInputtext) });
  if (guardrailsHastripwire) {
    return guardrailsOutput;
  } else {
    const snkhouseAssistantResultTemp = await runner.run(
      snkhouseAssistant,
      [
        ...conversationHistory
      ],
      {
        context: {
          workflowInputAsText: workflow.input_as_text
        }
      }
    );
    conversationHistory.push(...snkhouseAssistantResultTemp.newItems.map((item) => item.rawItem));

    if (!snkhouseAssistantResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
    }

    // Get thread_id from the runner - it's accessible via runner.threadId
    // If a thread_id was provided, it's reused. Otherwise, Runner creates a new one.
    const usedThreadId = (runner as any).threadId || workflow.thread_id || null;

    const snkhouseAssistantResult = {
      output_text: snkhouseAssistantResultTemp.finalOutput ?? "",
      thread_id: usedThreadId // Return thread_id for persistence
    };
    return snkhouseAssistantResult;
  }
}
