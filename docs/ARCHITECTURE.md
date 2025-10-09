# 🏗️ ARQUITETURA - SNKHOUSE BOT

**Versão:** 1.0
**Data:** 2025-10-08

## 📖 Visão Geral

O SNKHOUSE Bot é um ecossistema completo de atendimento automatizado para e-commerce de sneakers na Argentina, combinando IA conversacional, análise de dados e integração WooCommerce.

---

## 🎯 Objetivos

1. **Atendimento 24/7** via widget de chat inteligente
2. **Gestão centralizada** via dashboard administrativo
3. **Analytics em tempo real** para decisões baseadas em dados
4. **Integração nativa** com WooCommerce e WhatsApp
5. **Escalabilidade** para suportar crescimento

---

## 🏛️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│  Widget (Next.js 14)          Admin Dashboard (Next.js) │
│  - Chat UI                    - Analytics               │
│  - Client Components          - Conversations Manager   │
│  - Real-time updates          - Server Components       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                     API LAYER                            │
├─────────────────────────────────────────────────────────┤
│  /api/chat (Route Handler)                              │
│  - Message processing                                    │
│  - AI orchestration                                      │
│  - Conversation management                               │
│  - Tool calling (Function Calling)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
├─────────────────────────────────────────────────────────┤
│  Packages (Shared Logic)                                │
│  - @snkhouse/database     - Supabase clients            │
│  - @snkhouse/analytics    - Metrics & insights          │
│  - @snkhouse/integrations - WooCommerce tools           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                     DATA LAYER                           │
├─────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                                  │
│  - conversations                                         │
│  - messages                                              │
│  - customers                                             │
│  - RLS policies                                          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  EXTERNAL SERVICES                       │
├─────────────────────────────────────────────────────────┤
│  - OpenAI API (GPT-4o-mini)                             │
│  - Anthropic API (Claude Haiku)                         │
│  - WooCommerce REST API                                  │
│  - WhatsApp Business API (futuro)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Pastas

```
Ecossistema_Atendimento_SNKHOUSE/
│
├── apps/                           # Aplicações Next.js
│   ├── admin/                      # Dashboard administrativo
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx        # Home (métricas gerais)
│   │   │   │   ├── analytics/      # SNKH-14
│   │   │   │   │   └── page.tsx
│   │   │   │   └── conversations/  # SNKH-9
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── .env.local              # Variáveis de ambiente
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── widget/                     # Widget de chat
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/
│       │   │   │   └── chat/
│       │   │   │       └── route.ts  # API principal SNKH-7
│       │   │   ├── page.tsx          # UI do widget SNKH-1
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   └── lib/                  # Utilities
│       ├── .env.local
│       ├── next.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                       # Packages compartilhados
│   ├── database/                   # SNKH-4
│   │   ├── src/
│   │   │   └── index.ts            # supabase + supabaseAdmin
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── analytics/                  # SNKH-14
│   │   ├── src/
│   │   │   ├── metrics.ts          # getDashboardMetrics()
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── integrations/               # SNKH-8
│       ├── src/
│       │   ├── woocommerce/
│       │   │   ├── search-products.ts
│       │   │   ├── check-stock.ts
│       │   │   ├── get-categories.ts
│       │   │   ├── get-product-details.ts
│       │   │   └── search-by-category.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                           # Documentação
│   ├── MCP_GUIDE.md                # Guia de MCPs
│   ├── DEVELOPMENT_GUIDELINES.md   # Guia de desenvolvimento
│   ├── ARCHITECTURE.md             # Este arquivo
│   ├── CHANGELOG.md                # Histórico de mudanças
│   ├── 01-widget-interface.md
│   ├── 04-supabase-setup.md
│   ├── 07-chat-api.md
│   ├── 08-ai-tools.md
│   ├── 09-admin-dashboard.md
│   ├── 11-admin-dashboard.md
│   └── 14-analytics-dashboard.md
│
├── scripts/                        # Scripts utilitários
│   ├── test-admin-dashboard.ts
│   ├── test-analytics.ts
│   ├── test-conversation-history.ts
│   ├── kill-ports.js
│   └── test-*.ts
│
├── supabase/                       # Schema do banco
│   └── migrations/
│
├── .claude/                        # Configurações Claude Code
│   └── settings.local.json
│
├── turbo.json                      # Configuração Turborepo
├── package.json                    # Root package.json
├── pnpm-workspace.yaml             # Workspace config
└── tsconfig.json                   # TS config raiz
```

---

## 🎨 Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **React 18** (Server & Client Components)
- **TypeScript 5.9**
- **Tailwind CSS 3.4**

### Backend
- **Next.js API Routes** (Route Handlers)
- **Supabase** (PostgreSQL + Auth)
- **OpenAI API** (GPT-4o-mini)
- **Anthropic API** (Claude Haiku fallback)

### DevOps
- **Turborepo** (Monorepo management)
- **pnpm** (Package manager)
- **Git** (Version control)
- **GitHub** (Repository + Projects)

### Tools
- **9 MCP Servers** (Development enhancement)
- **Puppeteer** (E2E testing)
- **tsx** (TypeScript execution)

---

## 🔄 Fluxo de Dados

### 1. Fluxo de Conversa (Widget → API → IA → Database)

```
┌─────────────┐
│   Usuario   │
│   digita    │
└──────┬──────┘
       │ 1. Mensagem
       ▼
┌─────────────────────────────────────────┐
│  Widget UI (apps/widget/src/app/page)   │
│  - useState para conversationId         │
│  - fetch('/api/chat')                   │
└──────┬──────────────────────────────────┘
       │ 2. POST /api/chat
       │    { message, conversationId }
       ▼
┌─────────────────────────────────────────────────────┐
│  API Route (apps/widget/src/app/api/chat/route.ts)  │
│  1. Identificar/criar customer                      │
│  2. Carregar histórico da conversa                  │
│  3. Construir array de mensagens                    │
│  4. Chamar OpenAI com tools                         │
│  5. Processar tool calls                            │
│  6. Salvar mensagens                                │
└──────┬──────────────────────────────────────────────┘
       │ 3. Chamar IA
       ▼
┌───────────────────────────────────────┐
│  OpenAI API (GPT-4o-mini)             │
│  - Function Calling habilitado        │
│  - 5 tools WooCommerce                │
│  - Contexto em espanhol argentino     │
└──────┬────────────────────────────────┘
       │ 4. Response + tool_calls
       ▼
┌───────────────────────────────────────┐
│  WooCommerce Tools                    │
│  (@snkhouse/integrations)             │
│  - search_products()                  │
│  - check_stock()                      │
│  - get_categories()                   │
│  - get_product_details()              │
│  - search_by_category()               │
└──────┬────────────────────────────────┘
       │ 5. Tool results
       ▼
┌───────────────────────────────────────┐
│  Supabase (PostgreSQL)                │
│  - Insert user message                │
│  - Insert assistant response          │
│  - Update conversation.updated_at     │
└──────┬────────────────────────────────┘
       │ 6. conversationId + response
       ▼
┌─────────────────────────────────────────┐
│  Widget UI                              │
│  - Exibir resposta                      │
│  - Manter conversationId                │
└─────────────────────────────────────────┘
```

### 2. Fluxo de Analytics (Admin → Metrics → Supabase)

```
┌─────────────────────┐
│  Admin navega para  │
│  /analytics         │
└──────┬──────────────┘
       │ 1. Requisição
       ▼
┌──────────────────────────────────────────────┐
│  Analytics Page (Server Component)           │
│  - export const revalidate = 60 (ISR)        │
│  - await getDashboardMetrics()               │
└──────┬───────────────────────────────────────┘
       │ 2. Chamar função de métricas
       ▼
┌──────────────────────────────────────────────┐
│  @snkhouse/analytics/metrics.ts              │
│  - getDashboardMetrics()                     │
│  - 11 queries paralelas ao Supabase          │
│  - Processamento de dados                    │
└──────┬───────────────────────────────────────┘
       │ 3. Queries SQL
       ▼
┌──────────────────────────────────────────────┐
│  Supabase Admin (service role)               │
│  - conversations (SELECT)                    │
│  - messages (SELECT)                         │
│  - customers (SELECT)                        │
└──────┬───────────────────────────────────────┘
       │ 4. Dados brutos
       ▼
┌──────────────────────────────────────────────┐
│  Processamento de Métricas                   │
│  - Agregações (SUM, COUNT, AVG)              │
│  - Top 5 customers                           │
│  - Mensagens por hora                        │
│  - Tempo médio de resposta                   │
└──────┬───────────────────────────────────────┘
       │ 5. DashboardMetrics object
       ▼
┌──────────────────────────────────────────────┐
│  UI Rendering                                │
│  - MetricCards (4)                           │
│  - BarChart (SVG nativo)                     │
│  - Top Customers list                        │
│  - Status distribution                       │
└──────────────────────────────────────────────┘
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

#### 1. `customers`
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `conversations`
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  channel TEXT NOT NULL, -- 'widget', 'whatsapp', etc
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'closed'
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- tool_calls, function results, etc
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices

```sql
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

## 🔐 Segurança

### Row Level Security (RLS)

```sql
-- Customers: usuários só veem seus próprios dados
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer record"
  ON customers FOR SELECT
  USING (auth.uid() = id);

-- Conversations: ligadas ao customer
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth.uid() = id
  ));

-- Messages: ligadas à conversation
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE customer_id IN (
      SELECT id FROM customers WHERE auth.uid() = id
    )
  ));
```

### Variáveis de Ambiente

**Nunca commitar:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pode expor no frontend)
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (NUNCA expor)
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`

**Arquivos:**
- `.env.local` (ignorado pelo git)
- `.env.example` (template versionado)

---

## 🚀 Performance

### Next.js Otimizações

#### ISR (Incremental Static Regeneration)
```typescript
// apps/admin/src/app/analytics/page.tsx
export const revalidate = 60; // Revalidar a cada 60s

export default async function AnalyticsPage() {
  const metrics = await getDashboardMetrics();
  return <div>...</div>;
}
```

#### Server Components (Default)
```typescript
// Busca dados no servidor, zero JS no cliente
export default async function ConversationsPage() {
  const conversations = await getConversations();
  return <List data={conversations} />;
}
```

#### Client Components (Quando Necessário)
```typescript
'use client'
// Apenas quando precisa de interatividade
export function ChatWidget() {
  const [messages, setMessages] = useState([]);
  return <div>...</div>;
}
```

### Supabase Otimizações

#### Usar `supabaseAdmin` para API Routes
```typescript
// Evita RLS, mais rápido, acesso direto
import { supabaseAdmin } from '@snkhouse/database';

const { data } = await supabaseAdmin.from('customers').select('*');
```

#### Queries Otimizadas
```typescript
// ✅ Correto - Select apenas campos necessários
const { data } = await supabase
  .from('conversations')
  .select('id, status, created_at')
  .eq('status', 'active');

// ❌ Incorreto - Select *
const { data } = await supabase.from('conversations').select('*');
```

---

## 🔧 MCP Servers Integration

O projeto usa **9 MCP (Model Context Protocol) servers** para dar superpoderes ao Claude Code durante desenvolvimento.

### MCPs Ativos:
1. **Supabase** - Validação de queries e schema
2. **Filesystem** - Gerenciamento de arquivos
3. **Github** - Automação de commits/issues
4. **Memory** - Contexto persistente entre sessões
5. **Sequential Thinking** - Planejamento de tasks complexas
6. **Puppeteer** - Testes E2E
7. **Context7** - Consulta de docs oficiais
8. **Rube** - Code analysis
9. **Playwright** - Disponível (não usado)

**Ver lista completa:** [MCP_GUIDE.md](./MCP_GUIDE.md)

**Workflow recomendado:**
1. Consultar MCPs antes de começar task
2. Usar Memory para contexto
3. Usar Context7 para docs
4. Implementar feature
5. Testar com Puppeteer
6. Salvar decisões no Memory
7. Commit com Github MCP

---

## 📊 Monitoramento

### Logs Estruturados

**Formato padrão:**
```typescript
console.log('✅ [Package] Success message');
console.error('❌ [Package] Error message', error);
console.warn('⚠️ [Package] Warning message');
```

**Exemplo real:**
```typescript
console.log('📊 [Analytics] Coletando métricas do dashboard...');
console.log('✅ [Analytics] Métricas coletadas com sucesso');
console.error('❌ [Analytics] Erro ao coletar métricas:', error);
```

### Métricas Monitoradas

- Total de conversas
- Conversas ativas
- Total de mensagens
- Total de clientes
- Mensagens nas últimas 24h
- Tempo médio de resposta
- Top 5 clientes mais ativos

---

## 🧪 Testes

### Estrutura de Testes

**Localização:** `scripts/test-*.ts`

**Tipos:**
1. **Unit tests** - Funções individuais
2. **Integration tests** - Fluxos completos
3. **E2E tests** - Puppeteer (UI)

**Comando:**
```bash
cd apps/widget && pnpm tsx --env-file=.env.local ../../scripts/test-feature.ts
```

### Coverage Atual

- ✅ Conversation history (100%)
- ✅ Analytics metrics (100%)
- ✅ Admin dashboard structure (100%)
- ✅ AI tools (OpenAI + Claude) (100%)

---

## 🔄 CI/CD (Futuro)

### GitHub Actions (Planejado)

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

---

## 📈 Roadmap

### Fase Atual: Chat Agent MVP (90% completo)
- ✅ SNKH-1: Widget interface
- ✅ SNKH-4: Supabase setup
- ✅ SNKH-7: Chat API
- ✅ SNKH-8: AI Tools
- ✅ SNKH-9: Admin Dashboard
- ✅ SNKH-14: Analytics Dashboard
- ✅ SNKH-15: Real-time metrics collection

### Q1 2025 - Completar Chat Agent:
- [ ] SNKH-16: Knowledge Base (RAG)
- [ ] SNKH-17: WhatsApp Business Integration
- [ ] SNKH-18: Voice Messages Support
- [ ] SNKH-19: Sentiment Analysis
- [ ] SNKH-20: Handoff para Humano

### Q2 2025 - Multi-Agent Ecosystem:
- [ ] SNKH-30-39: Designer Agent (DALL-E 3, Midjourney)
- [ ] SNKH-40-49: Copy Agent (GPT-4, Claude)
- [ ] SNKH-50-59: Social Media Agent (Meta API, TikTok)
- [ ] SNKH-60-69: Analytics Agent ML (Prophet, TensorFlow)
- [ ] SNKH-70-71: Multi-Agent Hub (Orchestration)

**Para detalhes completos, veja:** [ROADMAP_MEDIO_PRAZO.md](./ROADMAP_MEDIO_PRAZO.md)

---

## 🔮 VISÃO FUTURA - MULTI-AGENT ECOSYSTEM

### Arquitetura Futura (Q2 2025)

```
┌──────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT HUB                           │
│                  (Orchestration Layer)                       │
└─────────────┬────────────────────────────────────────────────┘
              │
              ├────────────┬──────────────┬──────────────┬──────
              ▼            ▼              ▼              ▼
        ┌──────────┐ ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   CHAT   │ │ DESIGNER │  │   COPY   │  │  SOCIAL  │
        │  AGENT   │ │  AGENT   │  │  AGENT   │  │  AGENT   │
        │  (90%)   │ │   (Q2)   │  │   (Q2)   │  │   (Q2)   │
        │          │ │          │  │          │  │          │
        │ GPT-4o-  │ │ DALL-E 3 │  │  GPT-4   │  │ Meta API │
        │  mini    │ │Midjourney│  │  Claude  │  │  TikTok  │
        └──────────┘ └──────────┘  └──────────┘  └──────────┘
              │            │              │              │
              └────────────┴──────────────┴──────────────┘
                           │
                           ▼
                    ┌──────────┐
                    │ANALYTICS │
                    │  AGENT   │
                    │  (40%)   │
                    │          │
                    │ Prophet  │
                    │TensorFlow│
                    └──────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   SUPABASE DB   │
                  │  PostgreSQL +   │
                  │  Vector Store   │
                  └─────────────────┘
```

### 5 Agentes Especializados

#### 1. 💬 Chat Agent (Atendimento) - **90% Completo**
**Responsabilidades:**
- Atendimento 24/7 via Widget + WhatsApp
- Busca e recomendação de produtos
- Multilingual support (pt-BR, es-AR, en)
- Knowledge Base (RAG) - SNKH-16

**Stack:** GPT-4o-mini + Function Calling + WooCommerce API

#### 2. 🎨 Designer Agent (Criação Visual) - **Q2 2025**
**Responsabilidades:**
- Gerar banners promocionais
- Criar posts para redes sociais (feed, stories, reels)
- Design de produtos (mockups)
- Brand consistency validation

**Stack:** DALL-E 3 + Midjourney + Cloudinary

**Capacidade:** 50-100 imagens/mês | ~$1/imagem

#### 3. ✍️ Copy Agent (Copywriting) - **Q2 2025**
**Responsabilidades:**
- Copy para posts e anúncios
- Descrições de produtos (SEO-optimized)
- E-mail marketing
- Multilingual (pt-BR, es-AR, en)

**Stack:** GPT-4 + Claude 3.5 Sonnet + Frameworks (AIDA, PAS, FAB)

**Capacidade:** 200-300 textos/mês | $0.10-0.20/texto

#### 4. 📱 Social Media Agent (Gestão de Redes) - **Q2 2025**
**Responsabilidades:**
- Auto-posting (Instagram, Facebook, TikTok)
- Agendamento de calendário (30+ dias)
- Auto-resposta a comentários e DMs
- Monitoramento de menções

**Stack:** Meta Graph API + TikTok API + Custom Scheduler

**Capacidade:** 30-60 posts/mês | Auto-resposta ilimitada

#### 5. 📈 Analytics Agent (Analytics + ML) - **40% Completo → Q2 2025**
**Responsabilidades:**
- Dashboard em tempo real (✅ Implementado)
- Predição de vendas (30/60/90 dias)
- Customer segmentation (RFM)
- Recomendações estratégicas
- Churn prediction

**Stack Atual:** Supabase + Real-time aggregation
**Stack Futuro:** Prophet + TensorFlow.js + Scikit-learn

### 🎯 Casos de Uso End-to-End

#### Black Friday Campaign (Automático)
```
Input: "Criar campanha Black Friday para tênis de corrida"

1. Analytics Agent → Analisa histórico, recomenda top 10 produtos
2. Copy Agent → Gera copy para Instagram, Email, Meta Ads (30 variações)
3. Designer Agent → Gera 40 assets (banners, stories, feeds)
4. Social Media Agent → Agenda 20 posts otimizados (5 dias × 4/dia)
5. Analytics Agent → Monitora performance, ajusta mid-campaign

Output:
- 60 assets de conteúdo
- 20 posts agendados
- ROI tracking em tempo real
- Tempo total: 2h (vs 40h manual)
- Custo: ~$15 APIs (vs R$ 3,000 agência)
```

#### Lançamento de Produto
```
Input: "Novo Nike Air Max - lançamento 15/02"

1. Analytics → Prediz demanda, recomenda preço
2. Copy → Teaser (D-3) + Lançamento (D0) + Follow-up (D+7)
3. Designer → Hero image + teasers + posts lançamento
4. Social → Calendário 10 dias automatizado
5. Chat → Knowledge base atualizada

Output: 15-20 posts + produto integrado no chat
```

#### Conteúdo Evergreen (Mensal)
```
Input: "Gerar 30 posts para março"

1. Analytics → Analisa posts anteriores, recomenda mix
2. Copy → 30 captions variadas (produtos, dicas, lifestyle)
3. Designer → 30 imagens consistentes
4. Social → Agenda calendário otimizado

Output: 30 posts completos em 3-4h (vs 60h manual)
```

### 💰 ROI Multi-Agent

**Investimento:**
- Desenvolvimento: R$ 0 (Claude Code + equipe interna)
- Infraestrutura: $200-350/mês ($2,400-4,200/ano)
- **Total anual:** ~R$ 12,000-21,000

**Economia vs Agência:**
- Campanhas (10/ano): R$ 30,000 economizados
- Conteúdo mensal: R$ 72,000 economizados
- Lançamentos (8/ano): R$ 12,000 economizados
- **Total economia:** R$ 114,000/ano

**ROI:**
- Retorno líquido: R$ 93,000-102,000/ano
- **ROI: 443-850%**
- Payback: 1.5-2 meses

### 📅 Timeline de Implementação

| Período | Agente | Status |
|---------|--------|--------|
| **Q1 2025** | Chat Agent (100%) | 🔄 Em andamento |
| **Q2 2025 (Semana 1-4)** | Designer Agent | 📋 Planejado |
| **Q2 2025 (Semana 3-6)** | Copy Agent | 📋 Planejado |
| **Q2 2025 (Semana 5-10)** | Social Media Agent | 📋 Planejado |
| **Q2 2025 (Semana 1-6)** | Analytics ML | 📋 Planejado |
| **Q2 2025 (Semana 9-10)** | Multi-Agent Hub | 📋 Planejado |

### 🛠️ Tech Stack Completo

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 14, React 18, TailwindCSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | PostgreSQL (Supabase) + pgvector |
| **AI Models** | GPT-4o-mini, GPT-4, Claude 3.5, DALL-E 3, Midjourney |
| **ML** | Prophet, TensorFlow.js, Scikit-learn |
| **Integrations** | WooCommerce, Meta Graph API, TikTok API |
| **Storage** | Supabase Storage, Cloudinary |
| **Monitoring** | Custom Dashboard, Sentry |
| **DevOps** | Turborepo, pnpm, Git, GitHub Actions |

---

## 🤝 Contribuindo

1. Ler [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)
2. Ler [MCP_GUIDE.md](./MCP_GUIDE.md)
3. Seguir convenções de código
4. Testar antes de commitar
5. Documentar mudanças

---

## 📚 Referências

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Turborepo Docs](https://turbo.build/repo/docs)

---

**Versão:** 1.0
**Mantido por:** Claude Code + Human
**Última atualização:** 2025-10-08
