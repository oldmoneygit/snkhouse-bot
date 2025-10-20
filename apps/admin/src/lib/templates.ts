/**
 * Sistema de Templates para Mensagens WhatsApp
 *
 * Templates pré-definidos com variáveis substituíveis:
 * - {nome} - Nome do cliente
 * - {numero} - Número do pedido
 * - {tracking} - Código de rastreamento
 * - {data} - Data estimada de entrega
 * - {produto} - Nome do produto
 */

export interface MessageTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
  category: 'order' | 'shipping' | 'support' | 'custom';
  description: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // ===== TEMPLATES DE PEDIDO =====
  {
    id: 'order-packing',
    name: 'Pedido Sendo Embalado',
    message: 'Olá {nome}! 📦\n\nSeu pedido #{numero} está sendo embalado com muito cuidado!\n\nEm breve você receberá o código de rastreamento.\n\nGracias por confiar en SNKHOUSE! ✨',
    variables: ['nome', 'numero'],
    category: 'order',
    description: 'Notificação de que o pedido está sendo preparado',
  },
  {
    id: 'order-ready',
    name: 'Pedido Pronto para Envio',
    message: 'Hola {nome}! ✅\n\nTu pedido #{numero} ya está listo y será enviado hoy!\n\nTe notificaremos cuando esté en camino.\n\nSNKHOUSE - Llevando estilo a tu puerta 🚀',
    variables: ['nome', 'numero'],
    category: 'order',
    description: 'Pedido pronto e aguardando envio',
  },

  // ===== TEMPLATES DE ENVIO =====
  {
    id: 'order-shipped',
    name: 'Pedido Enviado',
    message: 'Hola {nome}! 🚚\n\nTu pedido #{numero} fue enviado!\n\n📍 Código de seguimiento: {tracking}\n📅 Entrega estimada: {data}\n\nPodés rastrear tu pedido en todo momento.\n\nSNKHOUSE - Ya casi llega! 🎉',
    variables: ['nome', 'numero', 'tracking', 'data'],
    category: 'shipping',
    description: 'Confirmação de envio com tracking',
  },
  {
    id: 'order-in-transit',
    name: 'Pedido em Trânsito',
    message: 'Hola {nome}! 📦\n\nTu pedido #{numero} está en camino!\n\n🚚 Estado: En tránsito\n📅 Llegada prevista: {data}\n\nYa falta poco! Prepará el outfit perfecto para tus nuevos sneakers! 👟',
    variables: ['nome', 'numero', 'data'],
    category: 'shipping',
    description: 'Atualização de pedido em trânsito',
  },
  {
    id: 'order-out-for-delivery',
    name: 'Saiu para Entrega',
    message: 'Hola {nome}! 🎉\n\nTu pedido #{numero} salió para entrega HOY!\n\nAsegurate de estar disponible para recibirlo.\n\nSNKHOUSE - El momento llegó! 🚀',
    variables: ['nome', 'numero'],
    category: 'shipping',
    description: 'Pedido saiu para entrega',
  },

  // ===== TEMPLATES DE SUPORTE =====
  {
    id: 'size-exchange',
    name: 'Troca de Tamanho',
    message: 'Hola {nome}! 👟\n\nSobre tu pedido #{numero}:\n\nOfrecemos cambio de talle sin costo dentro de los primeros 15 días.\n\nSolo necesitamos que el producto esté en perfecto estado con caja y accesorios.\n\n¿Te gustaría proceder con el cambio?',
    variables: ['nome', 'numero'],
    category: 'support',
    description: 'Informações sobre troca de tamanho',
  },
  {
    id: 'product-question',
    name: 'Dúvida sobre Produto',
    message: 'Hola {nome}! 👋\n\nGracias por tu consulta sobre {produto}!\n\nTodos nuestros productos vienen con:\n✅ Autenticidad garantizada\n✅ Caja original\n✅ Accesorios incluidos\n\n¿Tenés alguna otra duda?',
    variables: ['nome', 'produto'],
    category: 'support',
    description: 'Resposta a dúvidas sobre produtos',
  },

  // ===== TEMPLATE PERSONALIZADO =====
  {
    id: 'custom',
    name: 'Mensagem Personalizada',
    message: '',
    variables: [],
    category: 'custom',
    description: 'Escrever mensagem do zero',
  },
];

/**
 * Substitui variáveis no template por valores reais
 *
 * @example
 * const message = replaceVariables(template.message, {
 *   nome: 'Juan',
 *   numero: '12345',
 *   tracking: 'ABC123'
 * });
 */
export function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  // Substituir cada variável {nome} pelos valores fornecidos
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Extrai variáveis não substituídas de uma mensagem
 *
 * @example
 * getUnreplacedVariables('Olá {nome}, seu pedido {numero}')
 * // Retorna: ['nome', 'numero']
 */
export function getUnreplacedVariables(message: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const matches = message.matchAll(regex);
  return Array.from(matches, (match) => match[1] ?? '').filter((v) => v !== '');
}

/**
 * Busca um template pelo ID
 */
export function getTemplateById(id: string): MessageTemplate | undefined {
  return MESSAGE_TEMPLATES.find((t) => t.id === id);
}

/**
 * Filtra templates por categoria
 */
export function getTemplatesByCategory(
  category: MessageTemplate['category']
): MessageTemplate[] {
  return MESSAGE_TEMPLATES.filter((t) => t.category === category);
}
