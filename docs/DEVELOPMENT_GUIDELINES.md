# 🎯 DEVELOPMENT GUIDELINES - SNKHOUSE BOT

**Versão:** 1.0
**Data:** 2025-10-08

## 📜 Princípios Fundamentais

### 1. Código Limpo
- Zero gambiarras
- Zero `any` no TypeScript (exceto justificado)
- Sempre tipado e documentado
- Nomes descritivos e claros

### 2. Organização
- Seguir estrutura de pastas definida
- Um arquivo = uma responsabilidade
- DRY (Don't Repeat Yourself)
- Separação de concerns

### 3. Qualidade
- Testes quando possível
- Error handling robusto
- Logs estruturados com emojis
- Performance otimizada

### 4. Documentação
- Código auto-documentado
- JSDoc em funções públicas
- READMEs em packages novos
- Atualizar CHANGELOG.md sempre

---

## 🏗️ Estrutura do Projeto

```
Ecossistema_Atendimento_SNKHOUSE/
├── apps/
│   ├── admin/              # Dashboard administrativo (Next.js 14)
│   │   ├── src/
│   │   │   ├── app/        # App Router
│   │   │   │   ├── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   └── conversations/
│   │   │   └── components/ # Componentes reutilizáveis
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── widget/             # Widget de chat (Next.js 14)
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/chat/  # API route principal
│       │   │   └── page.tsx   # UI do widget
│       │   └── lib/
│       ├── .env.local
│       └── package.json
│
├── packages/
│   ├── database/           # Cliente Supabase compartilhado
│   │   └── src/index.ts    # supabase + supabaseAdmin
│   │
│   ├── analytics/          # Sistema de métricas
│   │   └── src/
│   │       ├── metrics.ts  # getDashboardMetrics()
│   │       └── index.ts
│   │
│   └── integrations/       # Integrações externas
│       └── src/
│           └── woocommerce/ # 5 tools WooCommerce
│
├── docs/                   # Documentação completa
│   ├── MCP_GUIDE.md
│   ├── DEVELOPMENT_GUIDELINES.md
│   ├── ARCHITECTURE.md
│   └── [features]/
│
├── scripts/                # Scripts utilitários
│   └── test-*.ts
│
├── supabase/              # Migrations e schema
│   └── migrations/
│
└── turbo.json             # Configuração Turborepo
```

---

## 🔧 Workflow com Claude Code

### Fase 1: Preparação
1. Consultar [MCP_GUIDE.md](./MCP_GUIDE.md) antes de começar
2. Ler arquivo `mcp.json` para ver MCPs disponíveis
3. Usar Memory MCP para recuperar contexto
4. Usar Context7 MCP se usar tech nova

### Fase 2: Implementação
1. Seguir estrutura de pastas existente
2. Criar arquivos com Filesystem MCP
3. Manter tipagem forte em TypeScript
4. Adicionar error handling robusto
5. Usar logs estruturados

### Fase 3: Validação
1. Testar com Puppeteer MCP
2. Validar queries com Supabase MCP
3. Verificar TypeScript (zero errors)
4. Verificar console (zero erros)

### Fase 4: Documentação
1. Criar/atualizar docs em /docs
2. Atualizar CHANGELOG.md
3. Adicionar comentários JSDoc
4. Criar README se package novo

### Fase 5: Finalização
1. Salvar decisões no Memory MCP
2. Commit com Github MCP
3. Fechar issue relacionada
4. Atualizar GitHub Projects

---

## 📝 Convenções de Código

### TypeScript

**Interfaces:**
```typescript
// ✅ Correto
interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ❌ Incorreto
interface Customer {
  id: any;
  name;
  email;
}
```

**Funções Assíncronas:**
```typescript
// ✅ Correto
async function fetchCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [fetchCustomers] Error:', error);
      throw error;
    }

    console.log(`✅ [fetchCustomers] Loaded ${data.length} customers`);
    return data;
  } catch (error) {
    console.error('❌ [fetchCustomers] Unexpected error:', error);
    throw error;
  }
}

// ❌ Incorreto
async function fetchCustomers() {
  const data = await supabase.from('customers').select('*');
  return data;
}
```

**Error Handling:**
```typescript
// ✅ Correto - Try-catch com log estruturado
try {
  const result = await riskyOperation();
  console.log('✅ [riskyOperation] Success:', result);
} catch (error) {
  console.error('❌ [riskyOperation] Failed:', error);
  throw new Error(`Failed to execute operation: ${error.message}`);
}

// ❌ Incorreto - Try-catch vazio ou genérico
try {
  await riskyOperation();
} catch (e) {
  // nada
}
```

### React Components

**Server Components (Next.js 14):**
```typescript
// ✅ Correto
export default async function AnalyticsPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Analytics</h1>
      <MetricCard value={metrics.totalConversations} />
    </div>
  );
}
```

**Client Components:**
```typescript
'use client'

// ✅ Correto
interface ChatWidgetProps {
  initialMessage?: string;
}

export function ChatWidget({ initialMessage = '' }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  return <div>...</div>;
}
```

### Logging

**Formato Padrão:**
```typescript
// ✅ Emojis + [Package] + Mensagem
console.log('✅ [Analytics] Metrics loaded');
console.error('❌ [Analytics] Failed to load metrics:', error);
console.warn('⚠️ [Analytics] Cache expired');
console.log('📊 [Analytics] Processing 150 records...');
```

**Emojis Recomendados:**
- ✅ Sucesso
- ❌ Erro
- ⚠️ Warning
- 📊 Processamento/Analytics
- 🔍 Debug/Search
- 💾 Database
- 🚀 Deploy/Start
- 🎯 Action/Task
- 📝 Documentation

---

## 🧪 Testes

### Scripts de Teste

**Localização:** `scripts/test-*.ts`

**Estrutura:**
```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env
const envPath = path.join(__dirname, '..', 'apps', 'widget', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

// Import after env loaded
import { functionToTest } from '../packages/something/src';

async function runTest() {
  console.log('🧪 TEST: Feature Name');
  console.log('='.repeat(50));

  try {
    const result = await functionToTest();

    console.log('\n✅ TEST PASSED');
    console.log('Result:', result);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error);

    process.exit(1);
  }
}

runTest();
```

**Comando:**
```bash
cd apps/widget && pnpm tsx --env-file=.env.local ../../scripts/test-feature.ts
```

---

## 🔒 Segurança

### Variáveis de Ambiente

**Nunca:**
- ❌ Commitar arquivos .env
- ❌ Hardcodar API keys no código
- ❌ Expor secrets no frontend

**Sempre:**
- ✅ Usar .env.local (ignorado pelo git)
- ✅ Usar .env.example como template
- ✅ Acessar via process.env
- ✅ Validar no início da aplicação

### Supabase

**Service Role (Backend Only):**
```typescript
// ✅ Correto - Usar supabaseAdmin em API routes
import { supabaseAdmin } from '@snkhouse/database';

export async function GET() {
  const { data } = await supabaseAdmin.from('customers').select('*');
  return Response.json(data);
}

// ❌ Incorreto - Nunca expor service role no frontend
```

**Anon Key (Frontend):**
```typescript
// ✅ Correto - Usar supabase público no cliente
import { supabase } from '@snkhouse/database';

const { data } = await supabase.from('public_data').select('*');
```

---

## 📦 Packages

### Criar Novo Package

1. Criar estrutura:
```bash
mkdir -p packages/nome-package/src
```

2. `package.json`:
```json
{
  "name": "@snkhouse/nome-package",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@snkhouse/database": "workspace:*"
  }
}
```

3. `tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

4. `README.md`:
```markdown
# @snkhouse/nome-package

Descrição do package.

## Instalação
\`\`\`bash
pnpm add @snkhouse/nome-package
\`\`\`

## Uso
\`\`\`typescript
import { funcao } from '@snkhouse/nome-package';
\`\`\`
```

5. Adicionar em apps que vão usar:
```json
{
  "dependencies": {
    "@snkhouse/nome-package": "workspace:*"
  }
}
```

---

## 🚀 Deploy

### Checklist Pré-Deploy

- [ ] Todos os testes passando
- [ ] Zero erros TypeScript
- [ ] Zero warnings não justificados
- [ ] .env.example atualizado
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Performance validada
- [ ] Segurança revisada

---

## 📊 Métricas de Qualidade

### Zero Tolerância Para:
- ❌ Erros TypeScript não resolvidos
- ❌ Try-catch vazio
- ❌ `any` sem justificativa
- ❌ Código duplicado
- ❌ Console.logs em produção (não estruturados)
- ❌ Secrets no código
- ❌ Queries SQL diretas sem validação

### Sempre Manter:
- ✅ 100% tipagem TypeScript
- ✅ Error handling em toda função async
- ✅ Logs estruturados com contexto
- ✅ Documentação atualizada
- ✅ Testes para features críticas
- ✅ Commits semânticos

---

## 🎯 Revisão de Código

### Antes de Cada Commit:

1. **Código:**
   - [ ] Limpo e organizado?
   - [ ] TypeScript satisfeito?
   - [ ] Sem código comentado desnecessário?
   - [ ] Nomes descritivos?

2. **Funcionalidade:**
   - [ ] Feature funciona 100%?
   - [ ] Sem regressões?
   - [ ] Performance OK?
   - [ ] UX validada?

3. **Documentação:**
   - [ ] Código documentado?
   - [ ] Docs atualizados?
   - [ ] CHANGELOG atualizado?
   - [ ] README atualizado (se package novo)?

4. **Segurança:**
   - [ ] Sem secrets expostos?
   - [ ] Validação de inputs?
   - [ ] Error handling robusto?
   - [ ] RLS verificado (se Supabase)?

**Se TODAS as respostas forem SIM:** ✅ COMMIT
**Se ALGUMA for NÃO:** ❌ REFATORAR

---

## 🆘 Quando em Dúvida

1. Consulte [MCP_GUIDE.md](./MCP_GUIDE.md)
2. Leia código existente similar
3. Use Sequential Thinking MCP para planejar
4. Pergunte antes de quebrar algo
5. Teste antes de commitar

---

**Versão:** 1.0
**Mantido por:** Claude Code + Human
**Última atualização:** 2025-10-08
