/**
 * Knowledge Base Module - SNKHOUSE Agent
 *
 * Exports:
 * - SNKHOUSE_KNOWLEDGE: Complete knowledge base object
 * - searchFAQs: FAQ search with keyword matching
 * - enrichPromptWithFAQs: Add relevant FAQs to system prompt
 * - searchStoreInfo: Search general store information
 *
 * @module knowledge
 * @version 1.0.0
 * @since 2025-01-09
 */

export { SNKHOUSE_KNOWLEDGE } from './snkhouse-info';
export type { SNKHouseKnowledgeType } from './snkhouse-info';
export { searchFAQs, enrichPromptWithFAQs, searchStoreInfo } from './faq-search';
export type { FAQResult } from './faq-search';
