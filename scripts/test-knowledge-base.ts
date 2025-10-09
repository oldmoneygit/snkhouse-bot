/**
 * Test Script: Knowledge Base System
 *
 * Tests:
 * - FAQ search with multiple queries
 * - System prompt generation
 * - Knowledge Base completeness
 * - Prompt enrichment
 *
 * Run: pnpm tsx scripts/test-knowledge-base.ts
 */

import { SNKHOUSE_KNOWLEDGE, searchFAQs, enrichPromptWithFAQs, searchStoreInfo } from '../packages/ai-agent/src/knowledge';
import { buildSystemPrompt, buildSimpleSystemPrompt } from '../packages/ai-agent/src/prompts';

console.log('🧪 TESTE: Knowledge Base System (SNKH-16)\n');
console.log('='.repeat(80));

// ============================================================================
// TEST 1: Knowledge Base Completeness
// ============================================================================
console.log('\n📋 TEST 1: Knowledge Base Completeness\n');

const requiredFields = [
  'loja.nome',
  'loja.empresa_legal.ein',
  'envios.argentina.costo',
  'pagos.argentina.metodos_disponibles',
  'cambios.argentina.plazo_dias',
  'programa_fidelidad.nombre',
  'autenticidad.mensaje_principal',
  'faqs',
];

console.log('Checking required fields in SNKHOUSE_KNOWLEDGE...\n');

let allFieldsPresent = true;
for (const field of requiredFields) {
  const keys = field.split('.');
  let value: any = SNKHOUSE_KNOWLEDGE;

  for (const key of keys) {
    value = value?.[key];
  }

  const exists = value !== undefined && value !== null;
  console.log(`${exists ? '✅' : '❌'} ${field}: ${exists ? 'OK' : 'MISSING'}`);

  if (!exists) allFieldsPresent = false;
}

console.log(`\n${allFieldsPresent ? '✅' : '❌'} Knowledge Base completeness: ${allFieldsPresent ? 'PASSED' : 'FAILED'}`);

// ============================================================================
// TEST 2: FAQ Count and Categories
// ============================================================================
console.log('\n📚 TEST 2: FAQs Structure\n');

const totalFAQs = SNKHOUSE_KNOWLEDGE.faqs.length;
console.log(`Total FAQs: ${totalFAQs}`);

const categorias = new Set(SNKHOUSE_KNOWLEDGE.faqs.map(f => f.categoria));
console.log(`Categories: ${categorias.size}`);
console.log('Categories list:');
categorias.forEach(cat => {
  const count = SNKHOUSE_KNOWLEDGE.faqs.filter(f => f.categoria === cat).length;
  console.log(`  • ${cat}: ${count} FAQs`);
});

console.log(`\n${totalFAQs >= 30 ? '✅' : '❌'} FAQ count: ${totalFAQs >= 30 ? 'PASSED (30+)' : 'FAILED (<30)'}`);

// ============================================================================
// TEST 3: FAQ Search - Multiple Queries
// ============================================================================
console.log('\n🔍 TEST 3: FAQ Search System\n');

const testQueries = [
  'son originales los productos?',
  'cuánto cuesta el envío a argentina?',
  'puedo pagar con mercado pago?',
  'cómo funciona el cambio de talle?',
  'qué es el programa de fidelidad?',
  'cuándo llega mi pedido?',
  'tienen tienda física?',
];

console.log('Testing FAQ search with various queries:\n');

let searchTestsPassed = 0;
for (const query of testQueries) {
  const results = searchFAQs(query, 2);
  const passed = results.length > 0 && results[0].score > 0;

  console.log(`Query: "${query}"`);
  console.log(`  ${passed ? '✅' : '❌'} Results: ${results.length} | Top score: ${results[0]?.score || 0}`);

  if (results.length > 0) {
    console.log(`  Top result: ${results[0].pregunta.substring(0, 60)}...`);
  }
  console.log();

  if (passed) searchTestsPassed++;
}

const searchSuccess = searchTestsPassed / testQueries.length;
console.log(`✅ Search success rate: ${(searchSuccess * 100).toFixed(0)}% (${searchTestsPassed}/${testQueries.length})`);

// ============================================================================
// TEST 4: Store Info Search
// ============================================================================
console.log('\n🏢 TEST 4: Store Info Search\n');

const storeQueries = [
  'dirección de la tienda',
  'email de contacto',
  'cuando abre el showroom',
];

console.log('Testing store info search:\n');

for (const query of storeQueries) {
  const result = searchStoreInfo(query);
  console.log(`Query: "${query}"`);
  if (result) {
    console.log(`  Result: ${result.substring(0, 100)}...`);
  } else {
    console.log(`  Result: (no specific info found)`);
  }
  console.log();
}

// ============================================================================
// TEST 5: System Prompt Generation
// ============================================================================
console.log('\n📝 TEST 5: System Prompt Generation\n');

const fullPrompt = buildSystemPrompt();
const simplePrompt = buildSimpleSystemPrompt();

console.log(`Full prompt length: ${fullPrompt.length} chars`);
console.log(`Simple prompt length: ${simplePrompt.length} chars`);

const hasEssentialSections = [
  'SOBRE SNKHOUSE',
  'ENVÍOS',
  'FORMAS DE PAGO',
  'CAMBIOS',
  'PROGRAMA DE FIDELIDAD',
  'AUTENTICIDAD',
  'TU ROL Y PERSONALIDAD',
  'TOOLS DISPONIBLES',
].every(section => fullPrompt.includes(section));

console.log(`\n${hasEssentialSections ? '✅' : '❌'} Essential sections: ${hasEssentialSections ? 'PASSED' : 'FAILED'}`);
console.log(`${fullPrompt.length > 1000 ? '✅' : '❌'} Prompt length: ${fullPrompt.length > 1000 ? 'PASSED' : 'FAILED'}`);

console.log('\nPrompt preview (first 500 chars):');
console.log('-'.repeat(80));
console.log(fullPrompt.substring(0, 500));
console.log('-'.repeat(80));

// ============================================================================
// TEST 6: Prompt Enrichment with FAQs
// ============================================================================
console.log('\n✨ TEST 6: Prompt Enrichment\n');

const basePrompt = buildSystemPrompt();
const enrichedPrompt = enrichPromptWithFAQs('son originales los productos?', basePrompt);

const enrichmentAdded = enrichedPrompt.length > basePrompt.length;
const hasFAQContext = enrichedPrompt.includes('CONTEXTO ADICIONAL');

console.log(`Base prompt length: ${basePrompt.length} chars`);
console.log(`Enriched prompt length: ${enrichedPrompt.length} chars`);
console.log(`Difference: +${enrichedPrompt.length - basePrompt.length} chars`);

console.log(`\n${enrichmentAdded ? '✅' : '❌'} Enrichment added: ${enrichmentAdded ? 'PASSED' : 'FAILED'}`);
console.log(`${hasFAQContext ? '✅' : '❌'} FAQ context section: ${hasFAQContext ? 'PASSED' : 'FAILED'}`);

if (hasFAQContext) {
  const contextStart = enrichedPrompt.indexOf('CONTEXTO ADICIONAL');
  const contextPreview = enrichedPrompt.substring(contextStart, contextStart + 300);
  console.log('\nEnrichment preview:');
  console.log('-'.repeat(80));
  console.log(contextPreview + '...');
  console.log('-'.repeat(80));
}

// ============================================================================
// TEST 7: Critical Data Validation
// ============================================================================
console.log('\n🔒 TEST 7: Critical Data Validation\n');

const criticalData = [
  {
    name: 'Free shipping to Argentina',
    check: SNKHOUSE_KNOWLEDGE.envios.argentina.costo === 0,
  },
  {
    name: 'Company EIN correct',
    check: SNKHOUSE_KNOWLEDGE.loja.empresa_legal.ein === '35-2880148',
  },
  {
    name: 'Free size exchange',
    check: SNKHOUSE_KNOWLEDGE.cambios.argentina.cambio_de_talle.costo === 0,
  },
  {
    name: 'Loyalty: 3 purchases = 1 free',
    check: SNKHOUSE_KNOWLEDGE.programa_fidelidad.como_funciona.regra.includes('3 compras'),
  },
  {
    name: '100% original guarantee',
    check: SNKHOUSE_KNOWLEDGE.autenticidad.mensaje_principal.includes('ORIGINALES'),
  },
  {
    name: 'Email contact present',
    check: SNKHOUSE_KNOWLEDGE.loja.email === 'contacto@snkhouse.com',
  },
];

let criticalTestsPassed = 0;
for (const test of criticalData) {
  console.log(`${test.check ? '✅' : '❌'} ${test.name}: ${test.check ? 'PASSED' : 'FAILED'}`);
  if (test.check) criticalTestsPassed++;
}

console.log(`\n✅ Critical data validation: ${criticalTestsPassed}/${criticalData.length} PASSED`);

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('📊 FINAL SUMMARY\n');

const overallTests = [
  { name: 'Knowledge Base completeness', passed: allFieldsPresent },
  { name: 'FAQ count (30+)', passed: totalFAQs >= 30 },
  { name: 'FAQ search success rate (>80%)', passed: searchSuccess >= 0.8 },
  { name: 'System prompt generation', passed: hasEssentialSections && fullPrompt.length > 1000 },
  { name: 'Prompt enrichment', passed: enrichmentAdded && hasFAQContext },
  { name: 'Critical data validation', passed: criticalTestsPassed === criticalData.length },
];

const totalPassed = overallTests.filter(t => t.passed).length;
const totalTests = overallTests.length;

console.log('Test Results:\n');
for (const test of overallTests) {
  console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
}

console.log(`\n${totalPassed === totalTests ? '🎉' : '⚠️'} Overall: ${totalPassed}/${totalTests} tests PASSED`);

if (totalPassed === totalTests) {
  console.log('\n✅ SNKH-16: Knowledge Base System - ALL TESTS PASSED! 🎉');
} else {
  console.log(`\n⚠️ SNKH-16: Knowledge Base System - ${totalTests - totalPassed} test(s) FAILED`);
}

console.log('\n' + '='.repeat(80));
