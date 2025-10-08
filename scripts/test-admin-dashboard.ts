#!/usr/bin/env tsx

/**
 * Script de teste para o Admin Dashboard
 * Verifica se todos os arquivos necessários foram criados
 */

import { existsSync } from 'fs';
import { join } from 'path';

const rootDir = join(__dirname, '..');

const requiredFiles = [
  // Admin app
  'apps/admin/package.json',
  'apps/admin/next.config.js',
  'apps/admin/tsconfig.json',
  'apps/admin/tailwind.config.js',
  'apps/admin/postcss.config.js',
  'apps/admin/.env.example',
  'apps/admin/README.md',
  
  // Admin source files
  'apps/admin/src/app/layout.tsx',
  'apps/admin/src/app/page.tsx',
  'apps/admin/src/app/globals.css',
  'apps/admin/src/app/not-found.tsx',
  'apps/admin/src/app/conversations/page.tsx',
  'apps/admin/src/app/conversations/[id]/page.tsx',
  
  // Database package
  'packages/database/package.json',
  'packages/database/tsconfig.json',
  'packages/database/src/index.ts',
  
  // Documentation
  'docs/11-admin-dashboard.md',
];

console.log('🧪 Testando Admin Dashboard...\n');

let allPassed = true;

console.log('📁 Verificando arquivos necessários:\n');

for (const file of requiredFiles) {
  const fullPath = join(rootDir, file);
  const exists = existsSync(fullPath);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${file}`);
  
  if (!exists) {
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(60) + '\n');

if (allPassed) {
  console.log('✅ TODOS OS ARQUIVOS FORAM CRIADOS COM SUCESSO!\n');
  console.log('🚀 Próximos passos:\n');
  console.log('1. Configure o arquivo .env.local:');
  console.log('   cd apps/admin');
  console.log('   cp .env.example .env.local');
  console.log('   # Edite com suas credenciais Supabase\n');
  console.log('2. Inicie o dev server:');
  console.log('   pnpm dev\n');
  console.log('3. Acesse: http://localhost:3001\n');
  console.log('📚 Documentação: docs/11-admin-dashboard.md\n');
} else {
  console.log('❌ ALGUNS ARQUIVOS ESTÃO FALTANDO!\n');
  console.log('Verifique os arquivos marcados com ❌ acima.\n');
  process.exit(1);
}

console.log('='.repeat(60));
