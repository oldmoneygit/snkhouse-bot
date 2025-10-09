/**
 * Sistema de busca de FAQs por keywords (sem vector database)
 *
 * Usa keyword matching simples mas efetivo para encontrar FAQs relevantes
 * baseado na mensagem do usuário.
 *
 * @module knowledge/faq-search
 * @version 1.0.0
 * @since 2025-01-09
 */

import { SNKHOUSE_KNOWLEDGE } from './snkhouse-info';

/**
 * Resultado de busca de FAQ
 */
interface FAQResult {
  pregunta: string;
  respuesta: string;
  categoria: string;
  score: number;
}

/**
 * Stopwords em espanhol que devem ser ignoradas na busca
 */
const STOPWORDS = new Set([
  'para', 'como', 'cual', 'cuando', 'donde', 'porque', 'puedo',
  'tiene', 'hacen', 'está', 'estan', 'tengo', 'quiero', 'necesito',
  'puede', 'pueden', 'hacer', 'saber', 'decir', 'esta', 'ese',
  'esa', 'estos', 'esas', 'sobre', 'desde', 'hasta', 'solo',
  'tambien', 'también', 'pero', 'aunque', 'sino'
]);

/**
 * Busca FAQs relevantes baseado na query do usuário
 *
 * Algoritmo:
 * 1. Extrai keywords da query (palavras > 3 chars, sem stopwords)
 * 2. Para cada FAQ, calcula score:
 *    - Keyword na pergunta: +5
 *    - Keyword na resposta: +1
 *    - Query completa na pergunta: +15
 *    - Keywords na categoria: +3
 * 3. Ordena por score e retorna top K
 *
 * @param query - Mensagem do usuário
 * @param topK - Número de resultados a retornar (default: 2)
 * @returns Array de FAQs ordenados por relevância
 *
 * @example
 * ```typescript
 * const results = searchFAQs("son originales?", 2);
 * // Retorna FAQs sobre autenticidade
 * ```
 */
export function searchFAQs(query: string, topK: number = 2): FAQResult[] {
  // Normalizar query
  const queryLower = query.toLowerCase();

  // Extrair keywords (palavras > 3 chars, sem stopwords)
  const keywords = queryLower
    .split(/\s+/)
    .filter(word =>
      word.length > 3 &&
      !STOPWORDS.has(word) &&
      /^[a-záéíóúñü]+$/.test(word) // Apenas letras (com acentos)
    );

  // Se não há keywords, retornar vazio
  if (keywords.length === 0) {
    return [];
  }

  console.log(`🔍 [FAQ Search] Query: "${query}"`);
  console.log(`🔍 [FAQ Search] Keywords: ${keywords.join(', ')}`);

  const results: FAQResult[] = [];

  // Iterar sobre todas as categorias e FAQs
  for (const categoria of SNKHOUSE_KNOWLEDGE.faqs) {
    for (const faq of categoria.preguntas) {
      const preguntaLower = faq.pregunta.toLowerCase();
      const respuestaLower = faq.respuesta.toLowerCase();
      let score = 0;

      // Calcular score baseado em keywords
      for (const keyword of keywords) {
        if (preguntaLower.includes(keyword)) {
          score += 5; // Keyword na pergunta vale mais
        }
        if (respuestaLower.includes(keyword)) {
          score += 1; // Keyword na resposta vale menos
        }
      }

      // Bonus: query completa aparece na pergunta
      if (preguntaLower.includes(queryLower)) {
        score += 15;
      }

      // Bonus: keywords na categoria
      const categoriaLower = categoria.categoria.toLowerCase();
      for (const keyword of keywords) {
        if (categoriaLower.includes(keyword)) {
          score += 3;
        }
      }

      // Se tem score, adicionar aos resultados
      if (score > 0) {
        results.push({
          pregunta: faq.pregunta,
          respuesta: faq.respuesta,
          categoria: categoria.categoria,
          score
        });
      }
    }
  }

  // Ordenar por score (maior primeiro) e retornar top K
  const topResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  console.log(`📚 [FAQ Search] Found ${topResults.length} relevant FAQs`);
  topResults.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.categoria} (score: ${r.score})`);
  });

  return topResults;
}

/**
 * Enriquece o prompt base com FAQs relevantes
 *
 * Busca FAQs relacionados à mensagem do usuário e adiciona ao prompt
 * como contexto adicional para a IA.
 *
 * @param userMessage - Mensagem do usuário
 * @param basePrompt - Prompt base do sistema
 * @returns Prompt enriquecido com FAQs relevantes
 *
 * @example
 * ```typescript
 * const basePrompt = "Sos el asistente de SNKHOUSE...";
 * const enriched = enrichPromptWithFAQs("son originales?", basePrompt);
 * // Retorna prompt com FAQs de autenticidade adicionados
 * ```
 */
export function enrichPromptWithFAQs(
  userMessage: string,
  basePrompt: string
): string {
  // Buscar top 2 FAQs mais relevantes
  const faqs = searchFAQs(userMessage, 2);

  // Se não encontrou FAQs relevantes, retornar prompt original
  if (faqs.length === 0) {
    return basePrompt;
  }

  console.log(`✨ [FAQ Enrichment] Enriching prompt with ${faqs.length} FAQs`);

  // Formatar FAQs encontrados
  const faqContext = faqs
    .map(
      faq =>
        `**${faq.categoria}**\nP: ${faq.pregunta}\nR: ${faq.respuesta}`
    )
    .join('\n\n---\n\n');

  // Adicionar FAQs ao final do prompt
  const enrichedPrompt = `${basePrompt}

# CONTEXTO ADICIONAL - FAQs RELEVANTES

El usuario preguntó algo relacionado con estas FAQs:

${faqContext}

**IMPORTANTE:**
- Usa esta información si es relevante para la pregunta del usuario
- NO copies textualmente las respuestas
- Adapta el tono y agrega detalles según el contexto
- Si la pregunta no es exactamente igual, usa tu criterio`;

  return enrichedPrompt;
}

/**
 * Busca informações gerais da loja (sem ser FAQ específico)
 *
 * Útil para perguntas sobre a empresa, missão, valores, etc.
 *
 * @param query - Mensagem do usuário
 * @returns Informações relevantes da loja ou null
 */
export function searchStoreInfo(query: string): string | null {
  const queryLower = query.toLowerCase();

  // Perguntas sobre a loja/empresa
  if (
    queryLower.includes('empresa') ||
    queryLower.includes('quienes') ||
    queryLower.includes('historia') ||
    queryLower.includes('sobre ustedes') ||
    queryLower.includes('confianza')
  ) {
    const loja = SNKHOUSE_KNOWLEDGE.loja;
    return `
**Sobre SNKHOUSE:**
${loja.mision}

Fundada en ${loja.fundacao} en Brasil, operando en ${loja.mercados.join(', ')}.
Empresa legal: ${loja.empresa_legal.nome} (EIN: ${loja.empresa_legal.ein})

**Nuestros diferenciales:**
${loja.diferenciales.map(d => `• ${d}`).join('\n')}
    `.trim();
  }

  // Perguntas sobre showroom
  if (
    queryLower.includes('showroom') ||
    queryLower.includes('tienda física') ||
    queryLower.includes('tienda fisica') ||
    queryLower.includes('local') ||
    queryLower.includes('dirección') ||
    queryLower.includes('direccion')
  ) {
    const showroom = SNKHOUSE_KNOWLEDGE.showroom;
    return `
**Showroom:**
Estado: ${showroom.estado}
Dirección: ${showroom.ubicacion.direccion}, ${showroom.ubicacion.barrio}, ${showroom.ubicacion.ciudad}
Fecha apertura: ${showroom.fecha_apertura}

${showroom.mensaje_actual}
    `.trim();
  }

  // Perguntas sobre programa de fidelidade
  if (
    queryLower.includes('fidelidad') ||
    queryLower.includes('programa') ||
    queryLower.includes('descuento') ||
    queryLower.includes('beneficio')
  ) {
    const prog = SNKHOUSE_KNOWLEDGE.programa_fidelidad;
    return `
**${prog.nombre}:**
${prog.descripcion}

${prog.como_funciona.regra}

${prog.ejemplo}
    `.trim();
  }

  return null;
}
