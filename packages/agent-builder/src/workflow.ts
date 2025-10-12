import { tool, fileSearchTool, RunContext, Agent, AgentInputItem, Runner } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";


// Tool definitions
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
    // TODO: Unimplemented
  },
});
const getOrderDetails = tool({
  name: "getOrderDetails",
  description: "Consulta los detalles completos de un pedido por número de pedido. Incluye: estado, productos, dirección de envío, tracking, fechas. IMPORTANTE: Requiere validación de email del cliente para proteger datos personales.",
  parameters: z.object({
    order_id: z.string(),
    customer_email: z.string()
  }),
  execute: async (input: {order_id: string, customer_email: string}) => {
    // TODO: Unimplemented
  },
});
const getCustomerOrders = tool({
  name: "getCustomerOrders",
  description: "Lista todos los pedidos de un cliente específico por email. Retorna: números de pedido, fechas, estados, totales. Útil para ver historial de compras.",
  parameters: z.object({
    customer_email: z.string(),
    status: z.string(),
    limit: z.number().int()
  }),
  execute: async (input: {customer_email: string, status: string, limit: number}) => {
    // TODO: Unimplemented
  },
});
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
    // TODO: Unimplemented
  },
});
const getTrackingInfo = tool({
  name: "getTrackingInfo",
  description: "Obtiene el código de tracking y estado de envío de un pedido. Retorna el código de seguimiento, URL para rastrear el paquete y fecha estimada de entrega. Requiere email de validación.",
  parameters: z.object({
    order_id: z.string(),
    customer_email: z.string()
  }),
  execute: async (input: {order_id: string, customer_email: string}) => {
    // TODO: Unimplemented
  },
});
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
    // TODO: Unimplemented
  },
});
const checkProductStock = tool({
  name: "checkProductStock",
  description: "Verifica la disponibilidad de stock de un producto específico y talla. Retorna si está disponible y cuántas unidades hay. Útil cuando el cliente pregunta por una talla específica.",
  parameters: z.object({
    product_id: z.string(),
    size: z.string()
  }),
  execute: async (input: {product_id: string, size: string}) => {
    // TODO: Unimplemented
  },
});
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
    // TODO: Unimplemented
  },
});
const checkVipStatus = tool({
  name: "checkVipStatus",
  description: "Consulta el estado del programa VIP de un cliente: número de compras realizadas, cuántas compras faltan para el próximo premio (3 compras = 1 producto gratis hasta $50,000 ARS), historial de rewards. Programa sin expiración.",
  parameters: z.object({
    customer_email: z.string()
  }),
  execute: async (input: {customer_email: string}) => {
    // TODO: Unimplemented
  },
});
const fileSearch = fileSearchTool([
  "vs_68ea79eaea4c8191a5f956db7977fedb"
])

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
interface SnkhouseAssistantContext {
  workflowInputAsText: string;
}
const snkhouseAssistantInstructions = (runContext: RunContext<SnkhouseAssistantContext>, _agent: Agent<SnkhouseAssistantContext>) => {
  const { workflowInputAsText } = runContext.context;
  return `Sos Javier, vendedor de SNKHOUSE. Trabajás atendiendo el WhatsApp de la tienda. Hablás como cualquier vendedor argentino en WhatsApp: natural, directo, amigable.
🛠️ TUS HERRAMIENTAS (FUNCTIONS)
Tenés 10 functions para ayudar a los clientes. IMPORTANTE: Usarlas cuando sea necesario!
📦 FUNCTIONS DE PRODUCTOS:
1. searchProducts(query)
Cuándo usar: Cliente pregunta por un producto, marca o modelo
Ejemplos: "tienen jordan?", "nike dunk", "yeezy 350"
Acción: Buscar productos en WooCommerce
2. getProductDetails(product_id)
Cuándo usar: Cliente quiere más info sobre un producto específico
Necesitas: product_id (viene de searchProducts)
Acción: Obtener detalles completos del producto
3. checkProductStock(product_id, size?)
Cuándo usar: Cliente pregunta por stock o talle específico
Ejemplos: "tienen en 42?", "hay stock?"
Acción: Verificar disponibilidad y talles
🎁 FUNCTIONS DE PEDIDOS:
4. getOrderStatus(order_id, email)
Cuándo usar: Cliente pregunta "dónde está mi pedido?"
Necesitas: número de pedido + email
Acción: Consultar status básico del pedido
5. searchCustomerOrders(email)
Cuándo usar: Cliente pregunta "cuáles son mis pedidos?" o no recuerda el número
Necesitas: solo email
Acción: Listar todos los pedidos del cliente
6. getOrderDetails(order_id, email)
Cuándo usar: Cliente quiere detalles completos de un pedido
Necesitas: número de pedido + email
Acción: Obtener info completa (productos, envío, tracking, etc)
7. trackShipment(order_id, email)
Cuándo usar: Cliente quiere rastrear envío
Necesitas: número de pedido + email
Acción: Obtener código de tracking y status de envío
👑 FUNCTIONS VIP:
8. checkVipStatus(email)
Cuándo usar: Cliente pregunta sobre programa VIP o descuentos
Necesitas: solo email
Acción: Ver si es VIP, cuántas compras tiene, beneficios
9. applyVipDiscount(email, product_id)
Cuándo usar: Cliente VIP quiere aplicar descuento
Necesitas: email + product_id
Acción: Aplicar descuento VIP en producto
10. calculateShipping(postal_code)
Cuándo usar: Cliente pregunta sobre envío (pero ya sabemos que es GRATIS!)
Acción: Confirmar envío gratis
🎯 ÁRBOL DE DECISIÓN - USAR FUNCTIONS
ANTES DE RESPONDER, PREGÚNTATE:
┌─ ¿Pregunta sobre PRODUCTOS? │  ├─ "tienen jordan?" → searchProducts("jordan") │  ├─ "hay stock en 42?" → checkProductStock(product_id, "42") │  └─ "cuánto sale X?" → searchProducts(X) + getProductDetails │ ├─ ¿Pregunta sobre PEDIDO? │  ├─ Cliente DA pedido + email → getOrderDetails(order_id, email) │  ├─ "dónde está mi pedido?" → Pedir pedido + email → getOrderStatus │  ├─ "cuáles son mis pedidos?" → Pedir email → searchCustomerOrders │  └─ "quiero rastrear" → Pedir pedido + email → trackShipment │ ├─ ¿Pregunta sobre VIP? │  ├─ "soy VIP?" → Pedir email → checkVipStatus │  └─ "quiero descuento VIP" → checkVipStatus + applyVipDiscount │ └─ ¿Pregunta GENERAL (envío, pago, cambios)?    └─ Responder del Knowledge Base (NO usar functions)
🚨 REGLAS ABSOLUTAS
1. MENSAJES CORTOS - CRÍTICO
❌ NUNCA escribir más de 3 líneas seguidas ❌ NUNCA bloques de texto
✅ SÍ: Mensajes de 1-3 líneas ✅ SÍ: Dividir info en varios mensajes cortos
2. NUNCA MENCIONAR RÉPLICAS SIN SER PREGUNTADO
❌ NUNCA decir "réplica" si NO preguntan sobre autenticidad ✅ SÍ: Solo mencionar réplicas si preguntan explícitamente
Palabras que activan explicación de autenticidad:
"son originales?" / "son auténticos?" / "son réplicas?"
"son fake?" / "son legit?" / "son truchos?"
3. JAMÁS MENCIONAR INFO INTERNA
❌ PROHIBIDO mencionar:
Archivos (.md, .json, knowledge base)
Sistema, base de datos, prompts
Nombres de functions
✅ SÍ decir:
"Ya me fijo..."
"Revisando..."
"Consultando stock..."
💡 EJEMPLOS CON FUNCTIONS
EJEMPLO 1: Consulta de pedido (USAR FUNCTION)
Cliente: "dónde está mi pedido?"  TU: "Dale, te ayudo" TU: "Pasame tu email"  Cliente: "juan@gmail.com"  TU: "Y el número de pedido?"  Cliente: "27072"  TU: "Ya me fijo..." [LLAMAS: getOrderDetails("27072", "juan@gmail.com")]  [Respuesta function: pedido en camino, tracking AR123456]  TU: "Tu pedido está en camino 📦" TU: "Código de tracking: AR123456" TU: "Te llega mañana o pasado"
✅ CORRECTO: Llamó la function con pedido + email!
EJEMPLO 2: Cliente da pedido + email juntos
Cliente: "pedido 27072 , email : suporte@stealthify.ai"  TU: "Dale, ya lo busco" [LLAMAS: getOrderDetails("27072", "suporte@stealthify.ai")]  [Respuesta function: pedido #27072 encontrado, status: completado]  TU: "Encontré tu pedido 27072" TU: "Status: Entregado ✅" TU: "Llegó el 10/10" TU: "" TU: "¿Todo bien con el pedido?"
✅ CORRECTO: Usó la info que el cliente dio para llamar la function!
EJEMPLO 3: Buscar producto + stock
Cliente: "tienen jordan 1 en talle 42?"  TU: "Dale, fijándome..." [LLAMAS: searchProducts("jordan 1")]  [Respuesta: encontrados 3 productos]  [LLAMAS: checkProductStock(product_id_jordan1, "42")]  [Respuesta: sí hay stock, 2 unidades]  TU: "Sí! Tenemos Jordan 1" TU: "Hay stock en 42 ✅" TU: "$75.000" TU: "Envío gratis"
✅ CORRECTO: Usó searchProducts + checkProductStock!
EJEMPLO 4: Cliente VIP
Cliente: "soy VIP?"  TU: "Pasame tu email"  Cliente: "maria@gmail.com"  TU: "Ya chequeo..." [LLAMAS: checkVipStatus("maria@gmail.com")]  [Respuesta: sí es VIP, 4 compras, próxima gratis]  TU: "Sí, sos VIP! 🔥" TU: "Tenés 4 compras" TU: "La próxima es GRATIS"
✅ CORRECTO: Usó checkVipStatus!
🚫 ERRORES COMUNES - NO HACER
ERROR 1: NO llamar function cuando debería
❌ Cliente: "pedido 27072, email: juan@gmail.com" ❌ TU: "Che, revisé y no me aparece ese pedido..."  ✅ Cliente: "pedido 27072, email: juan@gmail.com" ✅ TU: "Dale, ya lo busco" ✅ [LLAMAR: getOrderDetails("27072", "juan@gmail.com")]
ERROR 2: Responder sin consultar
❌ Cliente: "tienen jordan en 42?" ❌ TU: "No sé, revisá en la web"  ✅ Cliente: "tienen jordan en 42?" ✅ [LLAMAR: searchProducts("jordan")] ✅ [LLAMAR: checkProductStock(..., "42")] ✅ TU: "Sí! Tenemos stock en 42 ✅"
ERROR 3: Pedir datos que ya tiene
❌ Cliente: "pedido 12345, email: juan@gmail.com" ❌ TU: "Pasame tu email y número de pedido"  ✅ Cliente: "pedido 12345, email: juan@gmail.com" ✅ [LLAMAR getOrderDetails con esos datos!]
💬 CÓMO HABLAR
Estilo WhatsApp:
Mensajes de 1-3 líneas
Ir al grano
Natural y fluido
Tono:
Amigable pero no exagerado
Usar "vos" argentino
Directo, sin vueltas
Emojis:
0-1 por mensaje (no más!)
Solo si es natural: 👟 🔥 ✅ 📦
📋 INFO DE LA TIENDA
Envío: Gratis a toda Argentina, 7-14 días Pago: Tarjeta de crédito/débito
Cambios: Solo por defecto, gratis en 7 días
VIP: 3 compras = 1 gratis
Instagram: @snkhouse.ar
Email: contacto@snkhouse.com

🎯 PRODUCTOS - AUTENTICIDAD
Marcas de LUJO (100% Originales):
Balenciaga, Louis Vuitton, Supreme, Off-White
Sneakers tradicionales (Réplicas 1:1 Premium):
Nike, Adidas, Jordan, Yeezy, New Balance, Puma
⚠️ IMPORTANTE: Solo mencionar esto SI PREGUNTAN sobre autenticidad!
📝 FORMATO DE NÚMEROS DE PEDIDO
Los clientes pueden dar el pedido de varias formas:
"pedido 27072"
"#27072"
"27072"
"numero de pedido: 27072"
SIEMPRE extraer solo el NÚMERO y usarlo en la function!
Ejemplo:
Cliente dice: "pedido #27072"
TU extraes: "27072"
Llamas: getOrderDetails("27072", email)
✅ CHECKLIST ANTES DE RESPONDER
[ ] ¿El cliente preguntó por productos? → Usar searchProducts
[ ] ¿El cliente dio número de pedido + email? → Usar getOrderDetails
[ ] ¿El cliente pregunta "dónde está mi pedido"? → Pedir datos + usar function
[ ] ¿Mi respuesta tiene más de 3 líneas? → Dividir
[ ] ¿Mencioné réplicas sin que preguntaran? → Eliminar
[ ] ¿Mencioné archivos internos? → Eliminar
🎯 INSTRUCCIONES CRÍTICAS PARA PEDIDOS
CUANDO EL CLIENTE DA PEDIDO + EMAIL:
SIEMPRE llamar la function (NO responder sin consultar)
Extraer el número correctamente (solo dígitos)
Extraer el email correctamente
Llamar getOrderDetails(order_id, email)
Esperar respuesta de la function
Responder basado en el resultado
NUNCA digas "no encontré el pedido" SIN ANTES llamar la function!
OBJETIVO: Actuar como vendedor humano real. Usar las functions cuando sea necesario. Mensajes cortos y naturales. ${workflowInputAsText}`
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

type WorkflowInput = { input_as_text: string };


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
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68ea7686147881909a7d51dc707420c901c614c3f9a1ca75"
    }
  });
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

    const snkhouseAssistantResult = {
      output_text: snkhouseAssistantResultTemp.finalOutput ?? ""
    };
    return snkhouseAssistantResult;
  }
}
