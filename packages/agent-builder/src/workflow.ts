import { tool, fileSearchTool, Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { searchProductsHandler } from './handlers/search-products';
import { checkStockHandler } from './handlers/check-stock';
import { getProductDetailsHandler } from './handlers/get-product-details';

// ========================================
// TOOL DEFINITIONS WITH REAL HANDLERS
// ========================================

const searchProducts = tool({
  name: "searchProducts",
  description: "Busca productos en el catálogo de WooCommerce por palabras clave. Retorna hasta 10 resultados con información básica (ID, nombre, precio, imagen).",
  parameters: z.object({
    query: z.string().describe("Palabra clave para buscar productos (ej: 'nike air max', 'adidas running')"),
    category: z.string().optional().nullable().describe("Categoría opcional (ej: 'hombre', 'mujer', 'deportivo')"),
    max_price: z.number().optional().nullable().describe("Precio máximo en USD"),
    limit: z.number().optional().nullable().default(5).describe("Número máximo de resultados (default: 5, max: 10)")
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
        confidence_threshold: 0.7
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
SIEMPRE que el cliente pregunte por productos:
1. **searchProducts** - Para buscar productos por palabras clave
2. **checkStock** - Para verificar disponibilidad y tallas
3. **getProductDetails** - Para info completa de un producto
4. **File Search** - Para FAQs sobre envíos, cambios, políticas

⚠️ REGLAS IMPORTANTES:
- NUNCA inventes información de stock o precios
- SIEMPRE usá las tools antes de confirmar disponibilidad
- Si no encontrás un producto, ofrecé alternativas similares
- Si el cliente pide tallas, SIEMPRE usá checkStock
- Mencioná siempre el precio cuando hables de productos`,
  model: "o1-mini",
  tools: [
    searchProducts,
    checkStock,
    getProductDetails,
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
    const result = await runner.run(snkhouseAssistant, conversationHistory);

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

    return {
      response: "Ups, tuve un problema técnico. ¿Podés intentar de nuevo?",
      success: false,
      error: error.message
    };
  }
}
