import * as fs from 'fs';
import * as path from 'path';

/**
 * Script de segurança para detectar possíveis secrets expostos
 */

interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium';
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'OpenAI API Key',
    pattern: /sk-proj-[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
  },
  {
    name: 'Anthropic API Key',
    pattern: /sk-ant-[a-zA-Z0-9_-]{20,}/g,
    severity: 'critical',
  },
  {
    name: 'Supabase Service Role',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    severity: 'critical',
  },
  {
    name: 'WooCommerce Consumer Key',
    pattern: /ck_[a-z0-9]{40}/g,
    severity: 'high',
  },
  {
    name: 'WooCommerce Consumer Secret',
    pattern: /cs_[a-z0-9]{40}/g,
    severity: 'high',
  },
  {
    name: 'Generic API Key',
    pattern: /api[_-]?key["\s:=]+[a-zA-Z0-9_-]{20,}/gi,
    severity: 'medium',
  },
];

const SAFE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.env.example'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  '.env.local',
  '.env',
];

function shouldCheckFile(filePath: string): boolean {
  const ext = path.extname(filePath);
  if (!SAFE_EXTENSIONS.includes(ext)) return false;
  
  return !IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath: string): { file: string; secrets: any[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const secrets: any[] = [];

  SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      secrets.push({
        name,
        severity,
        count: matches.length,
        preview: matches[0].substring(0, 20) + '...',
      });
    }
  });

  return { file: filePath, secrets };
}

function scanDirectory(dir: string): any[] {
  let results: any[] = [];

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(scanDirectory(filePath));
    } else if (shouldCheckFile(filePath)) {
      const scan = scanFile(filePath);
      if (scan.secrets.length > 0) {
        results.push(scan);
      }
    }
  });

  return results;
}

function main() {
  console.log('🔍 VERIFICANDO SECRETS EXPOSTOS\n');
  console.log('━'.repeat(70));

  const rootDir = process.cwd();
  const results = scanDirectory(rootDir);

  if (results.length === 0) {
    console.log('\n✅ NENHUM SECRET DETECTADO - TUDO OK!\n');
    process.exit(0);
  }

  console.log('\n🚨 ATENÇÃO: SECRETS DETECTADOS!\n');
  
  let hasCritical = false;

  results.forEach(({ file, secrets }) => {
    console.log(`📄 ${file}`);
    secrets.forEach(({ name, severity, count, preview }) => {
      const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟡' : '🔵';
      console.log(`   ${icon} ${name} (${severity}): ${count}x - ${preview}`);
      
      if (severity === 'critical') hasCritical = true;
    });
    console.log('');
  });

  console.log('━'.repeat(70));
  console.log('\n⚠️  AÇÃO NECESSÁRIA:');
  console.log('1. Remova os secrets dos arquivos listados');
  console.log('2. Use variáveis de ambiente (.env.local)');
  console.log('3. Adicione .env.local ao .gitignore');
  console.log('4. Rotacione as credenciais expostas\n');

  process.exit(hasCritical ? 1 : 0);
}

main();
