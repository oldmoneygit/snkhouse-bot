/**
 * SNKHOUSE Knowledge Base - Informações Reais da Loja
 *
 * Base de conhecimento completa com todas as políticas, processos e informações
 * que a IA precisa para atender clientes da SNKHOUSE Argentina.
 *
 * IMPORTANTE: Estas são informações REAIS da loja. Mantenha sempre atualizado.
 *
 * @module knowledge/snkhouse-info
 * @version 1.0.0
 * @since 2025-01-09
 */

export const SNKHOUSE_KNOWLEDGE = {

  // ============================================
  // INFORMAÇÕES DA LOJA
  // ============================================

  loja: {
    nome: "SNEAKER HOUSE",
    nome_curto: "SNKHOUSE",
    tagline: "Sneakers Originales Importados",
    descricao: "Tienda especializada en sneakers originales importados de marcas premium para el mercado latinoamericano",

    fundacao: "2022",
    origem: "Brasil",
    mercados: ["Brasil", "Argentina", "México"],
    foco_atual: "Argentina y México",

    website: "https://snkhouse.com",
    email: "contacto@snkhouse.com",
    instagram: "@snkhouse.ar",

    empresa_legal: {
      nome: "JLI ECOM LLC",
      tipo: "Sociedad de responsabilidad limitada (LLC)",
      ein: "35-2880148",
      endereco: "127 N Higgins Ave, Suite 307D 1238, Missoula, MT 59802, USA",
      registro: "Registrada en el estado de Montana, EE. UU."
    },

    mision: `
Nuestro objetivo es convertirnos en una de las mayores tiendas de e-commerce
de importados de América Latina. Comenzamos en Brasil en 2022 y ahora estamos
expandiendo a Argentina y México con toda nuestra energía.

Queremos ser el vestuario de los artistas y las personas que buscan
AUTENTICIDAD y ACTITUD en su look. Sneakers exclusivos con estilo real.
    `,

    vision: "Ser la tienda #1 de sneakers importados en América Latina, reconocida por autenticidad, calidad y experiencia excepcional.",

    diferenciales: [
      "✅ Sneakers 100% ORIGINALES importados (NUNCA réplicas)",
      "✅ Importación directa desde Estados Unidos",
      "✅ Envío GRATIS a toda Argentina (sin mínimo de compra)",
      "✅ Todas las marcas premium: Nike, Jordan, Yeezy, Travis Scott",
      "✅ Productos vienen con caja original y documentación",
      "✅ Tracking en tiempo real con fotos del envío",
      "✅ Programa de fidelidad: 3 compras = 1 GRATIS",
      "✅ Atención 24/7 con IA + equipo humano",
      "✅ Showroom físico en Buenos Aires (próximamente)",
      "✅ Empresa registrada en EE.UU. con operación transparente"
    ],

    valores: [
      "AUTENTICIDAD GARANTIZADA - Solo productos originales",
      "TRANSPARENCIA TOTAL - Empresa legal, procesos claros",
      "PASIÓN POR SNEAKERS - Vivimos y respiramos cultura sneakerhead",
      "COMUNIDAD PRIMERO - Clientes antes que ventas",
      "CALIDAD SIN COMPROMISOS - Premium en todo lo que hacemos",
      "EXPANSIÓN LATINOAMERICANA - Llevando lo mejor a toda LATAM"
    ],

    historia: `
SNKHOUSE nació en 2022 en Brasil con una visión ambiciosa: democratizar el
acceso a sneakers originales premium en toda América Latina.

Cansados de precios inflados, dudas sobre autenticidad y falta de opciones,
decidimos crear algo diferente. Una tienda donde la transparencia, calidad
y pasión genuina por la cultura sneakerhead fueran el ADN.

En 2 años vendimos miles de pares en Brasil y construimos una comunidad
apasionada. Ahora, en 2024, estamos expandiendo con toda la energía a
ARGENTINA y MÉXICO.

Nuestro sueño: ser la tienda #1 de sneakers importados de América Latina.
Y vamos camino a lograrlo, un par a la vez. 🔥
    `
  },

  // ============================================
  // ENVÍOS Y LOGÍSTICA (ARGENTINA)
  // ============================================

  envios: {
    argentina: {
      cobertura: "TODO EL PAÍS",
      costo: 0, // GRATIS!
      envio_gratis: true,

      prazos: {
        total: "2 a 10 días hábiles",
        procesamiento: "48 horas (desde confirmación de pago hasta despacho)",
        transito: "2 a 10 días hábiles (desde despacho hasta entrega)"
      },

      proceso_detallado: [
        "1️⃣ Confirmás tu pago → Sistema procesa automáticamente",
        "2️⃣ Dentro de 48 HORAS → Empaquetamos tu pedido",
        "3️⃣ Te enviamos FOTOS del producto embalado + nota fiscal de envío",
        "4️⃣ Despachamos y te mandamos el código de rastreamento por email",
        "5️⃣ Trackeas en tiempo real hasta la puerta de tu casa",
        "6️⃣ ¡Disfrutás tus sneakers nuevos! 🔥"
      ],

      que_incluye: [
        "📦 Envío 100% GRATIS (sin mínimo de compra)",
        "📸 Fotos del producto embalado antes de enviar",
        "🧾 Nota fiscal de envío (transparencia total)",
        "📍 Código de tracking en tiempo real",
        "📦 Caja original de la marca incluida",
        "🛡️ Seguro incluido (sin costo extra)",
        "🇦🇷 Todos los impuestos y aranceles INCLUIDOS en el precio"
      ],

      zonas_info: {
        caba: "2-5 días hábiles en promedio",
        gba: "3-7 días hábiles en promedio",
        interior: "5-10 días hábiles según provincia",
        patagonia: "7-10 días hábiles en promedio"
      },

      transportadoras: [
        "Correo Argentino",
        "OCA",
        "Andreani",
        "Otras según disponibilidad y zona"
      ],

      restricciones: [
        "❌ No enviamos a casillas postales (CP)",
        "✅ Dirección debe tener número de calle específico",
        "✅ Requiere DNI para recibir el paquete",
        "✅ Alguien mayor de 18 años debe estar presente para recibir"
      ],

      nota_importante: `
🎁 ENVÍO TOTALMENTE GRATIS A TODA ARGENTINA - Sin letra chica, sin mínimo,
sin sorpresas. El precio que ves es el precio final que pagás.

Todos los impuestos aduaneros, aranceles y costos de importación están
INCLUIDOS en el precio del producto. No pagás nada extra al recibir.
      `
    }
  },

  // ============================================
  // FORMAS DE PAGO (ARGENTINA)
  // ============================================

  pagos: {
    argentina: {
      metodos_disponibles: [
        {
          tipo: "Tarjetas de Crédito",
          icono: "💳",
          disponible: true,
          tarjetas: ["Visa", "Mastercard", "American Express"],
          cuotas: "Según tu banco (consultá con tu tarjeta)",
          proceso: "Pago 100% seguro procesado por plataforma internacional",
          caracteristicas: [
            "Pago online instantáneo",
            "Protección internacional al comprador",
            "Cuotas según tu banco",
            "Todas las tarjetas de crédito"
          ]
        },
        {
          tipo: "Tarjetas de Débito",
          icono: "💳",
          disponible: true,
          tarjetas: ["Visa Débito", "Mastercard Débito"],
          proceso: "Pago online instantáneo con saldo de tu cuenta",
          caracteristicas: [
            "Pago inmediato con saldo disponible",
            "Sin cuotas (débito directo)",
            "Confirmación instantánea"
          ]
        }
      ],

      metodos_futuros: [
        {
          tipo: "Mercado Pago",
          estado: "Próximamente",
          nota: "Estamos trabajando para integrar Mercado Pago con cuotas sin interés"
        },
        {
          tipo: "Transferencia Bancaria",
          estado: "Próximamente",
          nota: "Pronto podrás pagar por transferencia con descuento especial"
        },
        {
          tipo: "Criptomonedas (USDT/DAI)",
          estado: "Próximamente",
          nota: "Pagos con stablecoins en camino"
        },
        {
          tipo: "WhatsApp",
          estado: "Próximamente",
          nota: "Canal de WhatsApp para compras directas"
        }
      ],

      no_disponibles: [
        "❌ Efectivo (ni en tienda ni contra entrega)",
        "❌ Cheques",
        "❌ Pago contra entrega"
      ],

      precios: {
        moneda: "Pesos Argentinos (ARS)",
        incluye: "TODOS los costos (producto + envío + impuestos + aranceles)",
        actualizacion: "Precios sujetos a cambios por inflación y variación del dólar",
        nota: "El precio que ves en el sitio web es el precio FINAL que pagás. Sin sorpresas."
      },

      seguridad: [
        "🔒 Sitio con certificado SSL (candado verde)",
        "🛡️ Pagos procesados por plataforma internacional segura",
        "🚫 NUNCA pedimos clave de tarjeta por email o redes sociales",
        "✅ Transacciones encriptadas end-to-end",
        "💯 Protección al comprador incluida"
      ]
    }
  },

  // ============================================
  // CAMBIOS Y DEVOLUCIONES (ARGENTINA)
  // ============================================

  cambios: {
    argentina: {
      plazo_dias: 7,

      politica_general: `
Queremos que AMES tus sneakers. Si algo no está bien, lo solucionamos.

Tenés 7 DÍAS desde que recibís el producto para:
- Cambio de talle (si no te quedó bien)
- Devolución (si hay defecto de fábrica o error nuestro)
      `,

      cambio_de_talle: {
        aplica: true,
        plazo: "7 días corridos desde que recibiste el producto",
        costo: 0, // GRATIS
        quien_paga_envio: "SNKHOUSE (nosotros pagamos ida y vuelta)",

        condiciones: [
          "✅ Producto SIN USO (cero desgaste en suela)",
          "✅ Con todas las etiquetas originales puestas",
          "✅ Caja original en perfecto estado",
          "✅ Dentro de los 7 días corridos desde que recibiste",
          "❌ NO aplica si ya usaste las zapatillas (aunque sea una vez)"
        ],

        proceso: [
          "1. Contactanos por email (contacto@snkhouse.com) o Instagram (@snkhouse.ar)",
          "2. Mandá 3 fotos claras: zapatillas, etiquetas, caja",
          "3. Indicá el nuevo talle que necesitás",
          "4. Coordinamos el retiro (SIN COSTO para vos)",
          "5. Revisamos el producto (24-48hs)",
          "6. Si todo OK: te enviamos el talle correcto GRATIS",
          "7. Si no hay stock del talle: te ofrecemos otro modelo o reembolso"
        ],

        caso_especial_producto_en_camino: `
⚠️ IMPORTANTE: Si tu pedido ya fue despachado pero AÚN NO TE LLEGÓ,
y te diste cuenta que pediste el talle equivocado:

NO PODEMOS cambiar el talle en tránsito (el paquete ya está en camino).

QUÉ HACER:
1. Esperá a que te llegue el producto
2. NO lo uses (dejalo con etiquetas)
3. Apenas recibas, contactanos para cambio
4. Tramitamos el cambio de talle sin costo

Total: sumarías 7-14 días extra, pero te aseguramos el talle correcto.
        `
      },

      devolucion_por_defecto: {
        aplica: true,
        plazo: "7 días corridos",

        cubre: [
          "Producto defectuoso de fábrica (despegue de suela, costuras rotas)",
          "Error nuestro (enviamos modelo equivocado, color diferente, etc)",
          "Daño en el transporte (caja destruida, zapatilla dañada)",
          "Material claramente defectuoso"
        ],

        no_cubre: [
          "Desgaste normal por uso",
          "Daños por mal uso o negligencia",
          "\"No me gustó\" (si el producto está bien)",
          "Cambios estéticos normales (oxidación natural de suela con tiempo)"
        ],

        proceso: [
          "1. Contactanos INMEDIATAMENTE con fotos del defecto",
          "2. Explicá el problema en detalle",
          "3. Revisamos las fotos (respuesta en 24hs)",
          "4. Si es defecto real: coordinamos devolución SIN COSTO",
          "5. Opciones: cambio por el mismo modelo, otro modelo, o reembolso 100%",
          "6. Vos elegís qué preferís"
        ],

        reembolso: {
          metodo: "Mismo método de pago original",
          plazo: "5-10 días hábiles según banco/tarjeta",
          monto: "100% del valor pagado"
        }
      },

      excepciones: [
        "❌ Productos usados (aunque sea una vez)",
        "❌ Sin etiquetas originales",
        "❌ Sin caja original o con caja muy dañada",
        "❌ Fuera del plazo de 7 días",
        "❌ Productos en promociones SALE FINAL (si aplica)"
      ],

      garantia_autenticidad: {
        descripcion: `
TODOS nuestros productos son 100% ORIGINALES importados directamente.

Si por alguna razón (que NUNCA pasó) recibís un producto que no sea original:
- Te devolvemos 100% del dinero
- + Te regalamos $20.000 ARS extra por las molestias
- + Reputación de por vida como cliente VIP

Esto NUNCA va a pasar porque solo trabajamos con importación directa legal,
pero queremos que sepas que estamos TAN seguros de nuestra autenticidad que
ponemos nuestro dinero donde está nuestra boca. 💯
        `
      }
    }
  },

  // ============================================
  // PROGRAMA DE FIDELIDAD
  // ============================================

  programa_fidelidad: {
    nombre: "SNKHOUSE VIP Club",
    descripcion: "Comprás más, ganás más. Simple y directo.",

    como_funciona: {
      regra: "3 compras confirmadas = 1 producto GRATIS",

      detalles: [
        "1️⃣ Hacés tu primera compra → Se registra automáticamente",
        "2️⃣ Segunda compra → Ya estás a mitad de camino",
        "3️⃣ Tercera compra → ¡DESBLOQUEÁS tu regalo!",
        "🎁 En tu 4ta compra elegís 1 producto GRATIS (hasta cierto valor)"
      ],

      valor_maximo_regalo: "$50.000 ARS",

      que_productos_cuentan: "Todas las compras confirmadas y entregadas",

      que_no_cuenta: [
        "Pedidos cancelados",
        "Devoluciones completas",
        "Pedidos pendientes de pago"
      ],

      validez: "Sin vencimiento - tus compras se acumulan para siempre"
    },

    como_usar_tu_regalo: [
      "1. Hacés tu 3ra compra y la recibís OK",
      "2. Te notificamos por email que desbloqueaste tu regalo",
      "3. En tu próximo pedido, elegís el producto que querés GRATIS (hasta $50k)",
      "4. En el checkout, aplicás tu regalo (código enviado por email)",
      "5. ¡Pagás $0 por ese producto! 🎉"
    ],

    ejemplo: `
📊 EJEMPLO REAL:

Compra 1: Jordan 1 Low ($85.000) ✅
Compra 2: Yeezy 350 ($95.000) ✅
Compra 3: Nike Dunk ($75.000) ✅

→ DESBLOQUEASTE TU REGALO! 🎁

Compra 4:
- Air Max 90 ($65.000) → ¡GRATIS!
- + Jordan 1 Mid ($80.000) → Pagás solo esto

Total pagado en compra 4: $80.000 (ahorraste $65.000!)

TOTAL INVERTIDO: $85k + $95k + $75k + $80k = $335.000
TOTAL RECIBIDO: 5 pares de sneakers
AHORRO REAL: $65.000 = 19% de descuento efectivo 🔥
    `,

    nota_importante: "El programa se aplica automáticamente, no necesitás inscribirte. Solo comprá y disfrutá los beneficios."
  },

  // ============================================
  // AUTENTICIDAD Y GARANTÍAS
  // ============================================

  autenticidad: {
    mensaje_principal: "🔒 100% ORIGINALES - NUNCA VENDEMOS RÉPLICAS",

    como_garantizamos: [
      "✅ Importación DIRECTA desde Estados Unidos",
      "✅ Solo trabajamos con distribuidores autorizados oficiales",
      "✅ Cada producto viene con caja original de la marca",
      "✅ Etiquetas de autenticidad intactas",
      "✅ Documentación de importación disponible",
      "✅ Empresa registrada en EE.UU. (JLI ECOM LLC)",
      "✅ Operación 100% legal y transparente"
    ],

    que_incluye_cada_producto: [
      "📦 Caja original de la marca (Nike, Adidas, Yeezy, etc)",
      "🏷️ Todas las etiquetas originales",
      "📄 Nota fiscal de importación",
      "🔍 Puedes verificar autenticidad en tiendas oficiales",
      "📸 Fotos del producto antes de enviar"
    ],

    verificacion: `
¿Querés verificar la autenticidad por tu cuenta?

Podés llevar las zapatillas a cualquier tienda oficial de la marca
(Nike Store, Adidas Store, etc) y pedirles que verifiquen.

NO VA A PASAR porque todos nuestros productos son 100% originales,
pero tenés todo el derecho de hacerlo si querés estar 200% seguro.
    `,

    nuestra_promesa: `
Si en algún momento descubrís que un producto no es original
(lo cual NUNCA va a pasar en 3 años que llevamos operando):

- Reembolso del 100% de tu dinero
- + $20.000 ARS extra por las molestias
- + Cliente VIP de por vida con beneficios exclusivos
- + Disculpa pública en nuestras redes

Ponemos nuestro dinero donde está nuestra palabra. 💯
    `,

    por_que_confiar: [
      "📊 3 años operando desde 2022",
      "🇧🇷 Miles de clientes satisfechos en Brasil",
      "🏢 Empresa registrada legalmente en EE.UU.",
      "📸 Transparencia total (fotos, documentos, proceso)",
      "⭐ Reputación comprobable en Instagram @snkhouse.ar",
      "🚫 NUNCA tuvimos un reclamo de producto falso",
      "✅ 100% de nuestros clientes confirman autenticidad"
    ]
  },

  // ============================================
  // SHOWROOM (EN CONSTRUCCIÓN)
  // ============================================

  showroom: {
    estado: "EN CONSTRUCCIÓN",
    fecha_apertura: "Próximamente (2024)",

    ubicacion: {
      direccion: "Godoy Cruz 2539",
      barrio: "Palermo",
      ciudad: "Buenos Aires",
      provincia: "Ciudad Autónoma de Buenos Aires (CABA)",
      pais: "Argentina"
    },

    que_podras_hacer: [
      "👟 Ver y probar los sneakers en persona",
      "🎯 Asesoramiento personalizado de talles y modelos",
      "📦 Retirar tus pedidos online sin costo",
      "🤝 Conocer al equipo de SNKHOUSE Argentina",
      "📸 Tomar fotos con los modelos más exclusivos",
      "💬 Charlar con otros sneakerheads"
    ],

    mensaje_actual: `
🏗️ SHOWROOM EN CONSTRUCCIÓN

Estamos preparando un espacio increíble en Palermo, CABA para que puedas:
- Ver los sneakers en vivo
- Probar antes de comprar
- Retirar tus pedidos
- Vivir la experiencia SNKHOUSE completa

📍 Ubicación: Godoy Cruz 2539, Palermo, CABA

📅 Próximamente en 2024

Por ahora, seguimos atendiendo 100% online con envíos gratis a toda Argentina.
Cuando abramos, te avisamos por Instagram y email para que seas de los primeros
en visitarnos! 🔥
    `,

    como_te_avisaremos: [
      "📧 Email a todos los clientes registrados",
      "📱 Post en Instagram @snkhouse.ar",
      "🎉 Inauguración con evento especial (invitación exclusiva)",
      "🎁 Regalos para los primeros visitantes"
    ]
  },

  // ============================================
  // PRODUCTOS Y MARCAS
  // ============================================

  productos: {
    categorias: [
      {
        nombre: "Nike",
        modelos_populares: ["Air Jordan", "Dunk", "Air Force 1", "Air Max"],
        descripcion: "La marca más icónica de sneakers del mundo"
      },
      {
        nombre: "Adidas Yeezy",
        modelos_populares: ["Yeezy 350", "Yeezy 700", "Yeezy Slide"],
        descripcion: "Diseños de Kanye West, exclusivos y codiciados"
      },
      {
        nombre: "Travis Scott",
        modelos_populares: ["Jordan 1 Travis", "Dunk Travis", "Air Max Travis"],
        descripcion: "Colaboraciones ultra limitadas del rapero Travis Scott"
      }
    ],

    origem: "Importación directa desde Estados Unidos",

    condicao: "100% nuevos en caja original",

    que_incluye: [
      "Caja original de la marca",
      "Todas las etiquetas y accesorios originales",
      "Documentación de importación"
    ],

    stock: "Stock limitado en modelos exclusivos - cuando se agota, se agota",

    preventa: "Algunos lanzamientos exclusivos disponibles en preventa (anunciamos en Instagram)"
  },

  // ============================================
  // ATENDIMENTO E COMUNICAÇÃO
  // ============================================

  atendimento: {
    canais: [
      {
        tipo: "Chat Web (este)",
        disponibilidad: "24/7 con IA",
        respuesta: "Instantánea",
        caracteristicas: ["Respuestas inmediatas", "Consulta productos", "Info completa"]
      },
      {
        tipo: "Email",
        email: "contacto@snkhouse.com",
        disponibilidad: "Lun-Sáb 9AM-6PM",
        respuesta: "24-48 horas",
        caracteristicas: ["Consultas detalladas", "Cambios/devoluciones", "Reclamos"]
      },
      {
        tipo: "Instagram",
        handle: "@snkhouse.ar",
        disponibilidad: "Lun-Sáb 9AM-6PM",
        respuesta: "1-6 horas",
        caracteristicas: ["Lanzamientos", "Comunidad", "Contenido exclusivo", "Feedback"]
      },
      {
        tipo: "WhatsApp",
        estado: "Próximamente",
        mensaje: "Estamos trabajando para agregar atención por WhatsApp pronto"
      }
    ],

    horario_equipo_humano: {
      dias: "Lunes a Sábado",
      horas: "9:00 AM - 6:00 PM (hora Argentina)",
      domingos: "Cerrado (pero el chat IA responde 24/7)"
    },

    tom_de_voz: {
      estilo: "Cercano, apasionado por sneakers, transparente, auténtico",
      pronombre: "vos (argentino)",
      emojis: "Con moderación y cuando aportan valor",
      jerga_sneakerhead: "Usar cuando sea natural (hype, drop, cop, grails, heat)",

      ejemplos: [
        "¡Ese modelo está 🔥! Te va a quedar perfecto",
        "Bancame que chequeo el stock real...",
        "Dale, con envío gratis te llega en una semana",
        "Esa collab está RE cotizada, no te la pierdas",
        "100% originales, te lo garantizamos con papeles"
      ]
    },

    valores_en_atencion: [
      "TRANSPARENCIA - Nunca mentimos sobre stock, prazos o productos",
      "RAPIDEZ - Respondemos rápido y resolvemos eficientemente",
      "PASIÓN - Amamos los sneakers, se nota en cada interacción",
      "EMPATÍA - Entendemos a los sneakerheads porque SOMOS sneakerheads",
      "PROFESIONALISMO - Serios en procesos, relajados en trato"
    ]
  },

  // ============================================
  // FAQs - PREGUNTAS FRECUENTES
  // ============================================

  faqs: [
    {
      categoria: "Autenticidad y Confianza",
      preguntas: [
        {
          pregunta: "¿Los sneakers son 100% originales o son réplicas?",
          respuesta: `¡100% ORIGINALES! NUNCA vendemos réplicas.

Todos nuestros productos son importados DIRECTAMENTE desde Estados Unidos de distribuidores autorizados oficiales.

Cada par incluye:
✅ Caja original de la marca
✅ Todas las etiquetas y documentación original
✅ Comprobantes de importación legal
✅ Podés verificarlos en tiendas oficiales

Llevamos 3 años operando (desde 2022) y NUNCA tuvimos un reclamo de producto falso. Somos una empresa registrada en EE.UU. con operación 100% legal y transparente.

Si alguna vez (que NUNCA va a pasar) te llegara algo que no sea original:
- Reembolso del 100%
- + $20.000 ARS extra
- + Cliente VIP de por vida

Ponemos nuestro dinero donde está nuestra palabra. 💯`
        },
        {
          pregunta: "¿De dónde importan los productos?",
          respuesta: `Importamos DIRECTAMENTE desde ESTADOS UNIDOS.

🇺🇸 Proceso:
1. Compramos de distribuidores oficiales autorizados en USA
2. Importamos legalmente con todos los papeles
3. Despachamos desde nuestro centro en Argentina
4. Te llega con documentación completa

NO trabajamos con:
❌ Revendedores
❌ Mercado gris
❌ Compras a particulares
❌ Productos de origen dudoso

Solo importación directa, legal y transparente.

Nuestra empresa (JLI ECOM LLC) está registrada en Montana, EE.UU. Todo el proceso es rastreable y verificable.`
        },
        {
          pregunta: "¿Por qué debería confiar en SNKHOUSE?",
          respuesta: `Entiendo la duda. Hay mucho verso en internet. Por eso te doy RAZONES REALES:

📊 TRAYECTORIA COMPROBABLE:
- 3 años operando (desde 2022)
- Miles de clientes satisfechos en Brasil
- Cientos de ventas en Argentina
- Reputación verificable en @snkhouse.ar

🏢 EMPRESA LEGAL:
- JLI ECOM LLC registrada en EE.UU.
- EIN: 35-2880148
- Domicilio legal en Montana
- Operación 100% transparente

📸 TRANSPARENCIA TOTAL:
- Te mandamos FOTOS del producto embalado antes de enviar
- Nota fiscal de envío incluida
- Tracking en tiempo real
- Caja y etiquetas originales

💬 COMUNIDAD REAL:
- Seguidores reales en Instagram
- Clientes que repiten (muchos ya van por su 3ra compra)
- Feedback público en redes
- Showroom físico en CABA (próximamente)

🛡️ GARANTÍA REAL:
Si no es original → Reembolso 100% + $20k extra (Nunca pasó en 3 años, pero la oferta está)

¿Seguís con dudas? Preguntame lo que quieras. Preferimos un cliente informado y convencido que una venta forzada. 😊`
        }
      ]
    },

    {
      categoria: "Envíos y Entregas",
      preguntas: [
        {
          pregunta: "¿Cuánto cuesta el envío a Argentina?",
          respuesta: `🎁 ¡ENVÍO TOTALMENTE GRATIS A TODA ARGENTINA!

Sin mínimo de compra.
Sin letra chica.
Sin sorpresas.

Da igual si comprás 1 par o 5 pares.
Da igual si estás en CABA o en Ushuaia.

El precio que ves en el sitio web es el precio FINAL que pagás.
Incluye:
✅ Producto
✅ Envío
✅ Todos los impuestos
✅ Todos los aranceles
✅ Seguro

CERO costos adicionales. 💯`
        },
        {
          pregunta: "¿Cuánto demora el envío?",
          respuesta: `⏱️ TIEMPO TOTAL: 2 a 10 días hábiles (después de confirmar tu pago)

📋 DESGLOSE:

1️⃣ PROCESAMIENTO (48 horas):
- Confirmás el pago → Sistema lo registra
- Empaquetamos tu pedido con cuidado
- Te mandamos FOTOS del producto embalado
- + Nota fiscal de envío
- Despachamos y te damos código de tracking

2️⃣ TRÁNSITO (2-10 días hábiles):
- CABA/GBA: 2-5 días en promedio
- Interior: 5-10 días según provincia
- Patagonia: 7-10 días en promedio

📍 TRACKING EN TIEMPO REAL:
Te enviamos el código por email para que veas exactamente dónde está tu paquete en cada momento.

💡 TIP: Si necesitás el pedido para una fecha específica, hacelo con 15 días de anticipación para estar tranquilo.`
        },
        {
          pregunta: "¿Puedo rastrear mi pedido?",
          respuesta: `¡SÍ! Tracking completo incluido.

📋 CÓMO FUNCIONA:

1️⃣ Confirmás tu pago
2️⃣ Dentro de 48 horas te mandamos:
   • Fotos del producto embalado
   • Nota fiscal de envío
   • Código de rastreamento

3️⃣ Con ese código rastreás en tiempo real:
   • Cuando sale de nuestro depósito
   • Cuando llega al centro de distribución
   • Cuando está en camino a tu domicilio
   • Cuando el cadete está en tu puerta

📱 DÓNDE RASTREAR:
- Link directo que te mandamos por email
- O en el sitio de la transportadora (Correo Argentino, OCA, Andreani)

🔔 NOTIFICACIONES:
Te avisamos en cada cambio de estado por email.

¿No te llegó el código? Contactanos por email o Instagram y te lo reenviamos al toque.`
        },
        {
          pregunta: "¿Hacen envíos a todo el país?",
          respuesta: `¡SÍ! Enviamos a TODA ARGENTINA sin excepción.

🗺️ TODAS LAS PROVINCIAS:
✅ Ciudad de Buenos Aires (CABA)
✅ Gran Buenos Aires (GBA)
✅ Buenos Aires Provincia
✅ Córdoba
✅ Santa Fe
✅ Mendoza
✅ Tucumán
✅ Salta
✅ Neuquén
✅ Río Negro
✅ Chubut
✅ Santa Cruz
✅ Tierra del Fuego
✅ Y TODAS las demás provincias

🎁 SIEMPRE GRATIS, sin importar dónde estés.

📍 ÚNICO REQUISITO:
- Dirección con número de calle (no casillas postales)
- Alguien +18 años para recibir (con DNI)

🚚 LLEGAMOS HASTA:
- Ciudades grandes
- Pueblos chicos
- Zonas rurales (si tiene cobertura de transporte)

¿Dudas sobre tu zona específica? Decime tu dirección y te confirmo al toque.`
        }
      ]
    },

    {
      categoria: "Formas de Pago",
      preguntas: [
        {
          pregunta: "¿Qué formas de pago aceptan?",
          respuesta: `Por ahora aceptamos:

💳 TARJETAS DE CRÉDITO:
- Visa
- Mastercard
- American Express
- Cuotas según tu banco

💳 TARJETAS DE DÉBITO:
- Visa Débito
- Mastercard Débito
- Pago instantáneo con saldo disponible

🔒 SEGURIDAD:
- Pago procesado por plataforma internacional segura
- Certificado SSL (candado verde)
- Protección al comprador incluida

📅 PRÓXIMAMENTE:
Estamos trabajando para agregar:
- Mercado Pago (con cuotas sin interés)
- Transferencia bancaria (con descuento)
- Criptomonedas (USDT/DAI)

💰 PRECIO FINAL:
El precio que ves incluye TODO (producto + envío + impuestos).
No pagás nada extra al recibir. 💯`
        },
        {
          pregunta: "¿Puedo pagar en efectivo o contra entrega?",
          respuesta: `Por ahora NO aceptamos:
❌ Efectivo
❌ Pago contra entrega
❌ Cheques

Solo:
✅ Tarjetas de crédito (online)
✅ Tarjetas de débito (online)

¿POR QUÉ?
- Es más seguro para ambos
- Confirmación instantánea
- Procesamos tu pedido más rápido
- Protección al comprador incluida

📅 EN EL FUTURO:
Cuando abramos el showroom en CABA (Godoy Cruz 2539), vas a poder:
- Pagar en efectivo en persona
- Ver los productos antes de comprar
- Retirar en el momento

Mientras tanto, solo pagos online con tarjeta. 💳`
        },
        {
          pregunta: "¿Los precios están en dólares o pesos?",
          respuesta: `💵 PRECIOS EN PESOS ARGENTINOS (ARS)

El precio que ves en el sitio web es el precio FINAL en pesos que vas a pagar.

✅ INCLUYE TODO:
- Producto
- Envío GRATIS
- Impuestos de importación
- Aranceles aduaneros
- Seguro

❌ CERO COSTOS ADICIONALES

⚠️ IMPORTANTE:
Los precios se actualizan seguido por:
- Inflación argentina
- Variación del dólar
- Cambios en costos de importación

💡 TU PRECIO SE CONGELA CUANDO:
- Finalizás la compra y pagás
- Ahí queda ese precio, sin importar si después sube

🎯 CONSEJO:
Si viste algo que te gusta → compralo ahora
Los precios suelen subir, no bajar (inflación argentina, ya sabés)

¿Querés saber el precio actualizado de algo específico? Decime qué modelo y te digo el valor de hoy.`
        }
      ]
    },

    {
      categoria: "Cambios y Devoluciones",
      preguntas: [
        {
          pregunta: "¿Puedo cambiar si el talle no me queda?",
          respuesta: `¡SÍ! Cambio de talle GRATIS dentro de 7 días.

✅ CÓMO FUNCIONA:

1. Recibís el pedido
2. Te lo probás (SIN usar)
3. Si no te queda → contactanos en los próximos 7 días
4. Mandás fotos (zapatillas + etiquetas + caja)
5. Coordinamos el retiro (sin costo para vos)
6. Te enviamos el talle correcto GRATIS
7. Listo! 🎉

🆓 NOSOTROS PAGAMOS:
- El envío de vuelta (retiro en tu domicilio)
- El envío del nuevo talle
- Todo sin costo para vos

⚠️ CONDICIONES:
✅ Producto SIN USO (cero desgaste en suela)
✅ Con etiquetas originales puestas
✅ Caja original en buen estado
✅ Dentro de los 7 días desde que recibiste

❌ SI YA LO USASTE:
Aunque sea una vez → NO aplica el cambio
Por eso es importante probarlo en casa antes de salir

💡 TIP:
Probalo en tu casa con medias, en pisos limpios, sin salir.
Así podés cambiarlo si no te queda bien.

⚡ CASO ESPECIAL - Ya fue despachado:
Si tu pedido YA salió pero no te llegó, y querés cambiar el talle:
- NO podemos cambiarlo en tránsito
- Esperá a que llegue, NO lo uses
- Apenas recibas, contactanos
- Hacemos el cambio sin costo`
        },
        {
          pregunta: "¿Qué hago si el producto llega defectuoso?",
          respuesta: `Si tu producto llega con algún defecto, LO SOLUCIONAMOS AL TOQUE.

🚨 QUÉ HACER:

1️⃣ Contactanos INMEDIATAMENTE:
- Email: contacto@snkhouse.com
- Instagram: @snkhouse.ar

2️⃣ Mandá fotos claras:
- Del defecto
- De todo el producto
- De la caja y etiquetas

3️⃣ Explicá el problema en detalle

4️⃣ Te respondemos en 24hs

5️⃣ Si es defecto real → Opciones:
   A) Cambio por el mismo modelo
   B) Cambio por otro modelo equivalente
   C) Reembolso del 100%

   Vos elegís qué preferís.

🆓 TODO SIN COSTO PARA VOS:
- Retiro del producto defectuoso
- Envío del reemplazo
- O reembolso completo

⏱️ PLAZO: 7 días desde que recibiste

✅ CUBRIMOS:
- Despegue de suela
- Costuras rotas
- Material claramente defectuoso
- Error nuestro (modelo/color equivocado)
- Daño en el transporte

❌ NO CUBRE:
- Desgaste normal por uso
- Daño por mal uso
- Oxidación natural de suela con el tiempo

💯 NOTA IMPORTANTE:
En 3 años NUNCA tuvimos un producto defectuoso de fábrica.
Pero si pasa, lo arreglamos sin vueltas.`
        },
        {
          pregunta: "¿Puedo devolver si no me gustó?",
          respuesta: `Entiendo que es frustrante cuando algo no cumple tus expectativas.

📋 NUESTRA POLÍTICA:

❌ NO aceptamos devoluciones por "no me gustó" si el producto está bien.

Solo aceptamos cambios/devoluciones por:
✅ Talle equivocado (cambio gratis en 7 días)
✅ Defecto de fábrica
✅ Error nuestro (modelo/color equivocado)
✅ Daño en el transporte

🤔 ¿POR QUÉ?
- Productos importados con costos altos
- Cada cambio/devolución nos cuesta mucho
- Queremos mantener precios accesibles

💡 LO QUE SÍ PODEMOS HACER:

Si el producto llegó bien pero no te gustó:
1. Publicalo vos para reventa (te ayudamos a difundir)
2. Ofrecelo a amigos/familia
3. Úsalo para acumular tus 3 compras (regalo en la 4ta)

Y en tu próxima compra:
- Te asesoramos mejor para que no pase de nuevo
- Consultanos TODO antes de comprar
- Preguntá por fotos reales, videos, etc

🎯 COMPROMISO:
Preferimos que estés 100% seguro ANTES de comprar.
Hacenos TODAS las preguntas que necesites.
Mejor prevenir que lamentar después. 😊`
        }
      ]
    },

    {
      categoria: "Productos y Stock",
      preguntas: [
        {
          pregunta: "¿Cómo sé si tienen stock de un producto?",
          respuesta: `3 formas de saber si hay stock:

🌐 1. SITIO WEB:
- Entrá a snkhouse.com
- Buscá el modelo que querés
- Si dice "Agregar al carrito" → HAY STOCK
- Si dice "Agotado" → SIN STOCK (te podemos avisar cuando llegue)

💬 2. PREGUNTAME ACÁ:
- Decime qué modelo + talle querés
- Consulto el stock en tiempo real
- Te confirmo en segundos si hay

📧 3. EMAIL/INSTAGRAM:
- contacto@snkhouse.com
- @snkhouse.ar
- Te respondemos con disponibilidad exacta

⚡ STOCK EN TIEMPO REAL:
Actualizamos el inventario constantemente.
Si aparece disponible → HAY (no te llevás sorpresas)

⚠️ MODELOS POPULARES:
Jordan 1, Yeezy, Travis Scott se agotan RÁPIDO.
Si lo ves disponible y te gusta → NO LO PIENSES TANTO
Mañana puede no estar.

🔔 NOTIFICACIONES:
¿Querés algo que está agotado?
Dejanos tu email/Instagram → Te avisamos PRIMERO cuando llegue

¿Qué modelo estás buscando? Te lo chequeo ahora mismo.`
        },
        {
          pregunta: "¿Los productos vienen con caja original?",
          respuesta: `¡SÍ! TODOS los productos vienen con su caja original de fábrica.

📦 LO QUE INCLUYE CADA PEDIDO:

✅ Caja original de la marca (Nike, Adidas, Yeezy, etc)
✅ Todas las etiquetas originales puestas
✅ Accesorios incluidos (cordones extra, pins, etc si aplica)
✅ Papel de relleno original
✅ Todo tal como sale de fábrica

📸 ANTES DE ENVIAR:
Te mandamos FOTOS del producto embalado con:
- Las zapatillas en la caja
- Etiquetas visibles
- Nota fiscal de envío

🛡️ PROTECCIÓN EN EL ENVÍO:
- Embalaje reforzado (doble caja)
- Para que llegue en perfecto estado
- Seguro incluido

⚠️ SI LA CAJA LLEGA DAÑADA:
- Contactanos inmediatamente
- Si el daño es en tránsito → Reclamo con transportadora
- Si afecta el producto → Cambio sin costo

💯 GARANTÍA:
Tus sneakers van a llegar con su caja original, como deben ser.`
        },
        {
          pregunta: "¿Tienen ediciones limitadas?",
          respuesta: `¡SÍ! Traemos modelos exclusivos y ediciones limitadas regularmente.

🔥 QUÉ TRAEMOS:

- Colaboraciones especiales (Travis Scott, Off-White, etc)
- Retros numerados de Jordan
- Yeezys exclusivos
- Modelos que NO llegan a Argentina oficialmente
- Ediciones limitadas regionales

📅 CÓMO FUNCIONA:

1. Anunciamos lanzamientos en Instagram @snkhouse.ar
2. Stock LIMITADO (cuando se agota, se agota)
3. Primer llegado, primer servido
4. Algunos modelos en PREVENTA (pagás y te aseguramos el par)

⚡ SE AGOTAN RÁPIDO:
- Jordan 1 Travis Scott → agotados en horas
- Yeezy Bred → agotados en días
- Dunks populares → agotados en días

💡 CÓMO NO PERDERTE LANZAMIENTOS:

✅ Seguinos en Instagram @snkhouse.ar (activá notificaciones 🔔)
✅ Revisá el sitio web seguido
✅ Preguntanos qué viene próximamente

🎯 PROGRAMA VIP:
Después de 3 compras (4ta es gratis), tenés prioridad en lanzamientos exclusivos.

¿Hay algún modelo específico que querés? Avisame y te aviso si lo vamos a traer.`
        }
      ]
    },

    {
      categoria: "Programa de Fidelidad",
      preguntas: [
        {
          pregunta: "¿Cómo funciona el programa de fidelidad?",
          respuesta: `SÚPER SIMPLE: 3 COMPRAS = 1 GRATIS 🎁

📋 CÓMO FUNCIONA:

1️⃣ Primera compra → Se registra automático
2️⃣ Segunda compra → Ya estás a mitad de camino
3️⃣ Tercera compra → ¡Desbloqueaste tu regalo!
4️⃣ En tu 4ta compra elegís 1 producto GRATIS (hasta $50.000)

💰 EJEMPLO REAL:

Compra 1: Jordan 1 Low ($85.000) ✅
Compra 2: Yeezy 350 ($95.000) ✅
Compra 3: Nike Dunk ($75.000) ✅

→ DESBLOQUEASTE TU REGALO! 🎁

Compra 4:
- Air Max 90 ($65.000) → ¡GRATIS!
- + Jordan 1 Mid ($80.000) → Pagás solo esto

Total pagado: $85k + $95k + $75k + $80k = $335.000
Total recibido: 5 pares
Ahorro: $65.000 = 19% de descuento efectivo! 🔥

📝 REGLAS:

✅ Se aplica automático (no te inscribís)
✅ Todas las compras confirmadas cuentan
✅ Regalo hasta $50.000 ARS
✅ Sin vencimiento (acumulás para siempre)

❌ No cuenta:
- Pedidos cancelados
- Devoluciones completas
- Pedidos sin confirmar pago

🎁 CÓMO USAR TU REGALO:

1. Te avisamos por email que desbloqueaste
2. Elegís el producto que querés (hasta $50k)
3. En el checkout aplicás tu código
4. ¡Pagás $0 por ese producto!

🎯 EXTRA:
Clientes VIP (con 3+ compras) tienen prioridad en lanzamientos exclusivos.

¿Preguntas? Preguntame lo que necesites!`
        }
      ]
    },

    {
      categoria: "Talles y Calce",
      preguntas: [
        {
          pregunta: "¿Cómo elijo mi talle correcto?",
          respuesta: `Elegir el talle correcto es CLAVE. Te ayudo paso a paso:

📏 MÉTODO 1 - MEDÍ TU PIE (más preciso):

1. Parate descalzo con todo el peso en el pie
2. Poné un papel contra la pared
3. Marcá donde termina tu talón y tus dedos
4. Medí la distancia en CM
5. Sumá 0.5cm para confort

💬 Mandame esa medida y te digo tu talle exacto.

📊 MÉTODO 2 - SABÉS TU TALLE US:

Si ya sabés tu talle US (de otras zapatillas):
- Generalmente ese mismo sirve
- Pero cada marca calza diferente:

NIKE: Suelen calzar ajustadas (medio talle más en Air Max, Force)
ADIDAS: True to size (Yeezy: medio/un talle MÁS)
JORDAN: True to size (Jordan 11: medio talle más)

🎯 LO MÁS SEGURO:

1. Decime QUÉ MODELO querés
2. Tu medida en CM o tu talle US actual
3. Si tenés pie ancho/normal/angosto

Y te digo EXACTAMENTE qué talle pedir.

⚠️ IMPORTANTE:

Si tenés duda entre 2 talles → Elegí el más grande
Es más fácil usar con media gruesa que uno chico.

Y recordá: cambio de talle GRATIS en 7 días si no te queda. 😊

¿Qué modelo estás viendo? Te asesoro específicamente.`
        }
      ]
    }
  ]
};

/**
 * Tipo exportado para TypeScript
 */
export type SNKHouseKnowledgeType = typeof SNKHOUSE_KNOWLEDGE;
