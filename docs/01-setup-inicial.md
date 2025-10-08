# 🚀 Setup Inicial - SNKHOUSE Bot

## 📋 Resumo do Setup

Este documento detalha o processo de configuração inicial do projeto SNKHOUSE Bot, incluindo todas as dependências, configurações e testes realizados.

## ✅ Status do Setup

- [x] **Variáveis de Ambiente** - Configuradas com todas as credenciais
- [x] **Dependências** - Instaladas com Turborepo e pnpm
- [x] **Supabase Client** - Configurado e testado
- [x] **Teste de Conexão** - Passou com sucesso
- [x] **Documentação** - Em andamento

## 🔧 Configurações Realizadas

### 1. Variáveis de Ambiente

**Arquivo:** `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic (Claude) - Fallback
ANTHROPIC_API_KEY=your_anthropic_key

# WooCommerce
WOOCOMMERCE_URL=https://snkhouse.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

# WhatsApp Business Cloud API (configurar depois)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=snkhouse_webhook_secret_2025

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**IMPORTANTE:** 
- ✅ Copie `.env.example` para `.env.local`
- ✅ Preencha com suas credenciais reais
- ✅ NUNCA commite `.env.local` no Git
- ✅ Consulte os links nos comentários para obter as keys

### 2. Estrutura do Projeto

```
snkhouse-bot/
├── apps/                    # Aplicações
│   ├── admin/              # Painel administrativo
│   ├── widget/             # Widget flutuante
│   └── whatsapp-service/   # Serviço WhatsApp
├── packages/               # Bibliotecas compartilhadas
│   ├── database/           # Cliente Supabase
│   ├── ai-agent/           # Serviço de IA
│   ├── integrations/       # Integrações externas
│   ├── ui/                 # Componentes UI
│   └── shared/             # Utilitários
├── docs/                   # Documentação
├── scripts/                # Scripts de automação
└── supabase/               # Configurações Supabase
```

### 3. Dependências Instaladas

**Root Package.json:**
- `turbo` - Build system para monorepo
- `typescript` - Tipagem estática
- `prettier` - Formatação de código
- `tsx` - Executor TypeScript

**Workspaces:**
- `apps/widget` - Next.js com Tailwind CSS
- `packages/database` - Cliente Supabase
- `packages/ai-agent` - OpenAI + Anthropic
- `packages/integrations` - WooCommerce Client

### 4. Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Inicia todos os workspaces

# Build
pnpm build                  # Build de produção

# Testes
pnpm test                   # Executa testes
pnpm test:supabase          # Testa conexão Supabase
pnpm check:secrets          # Verifica secrets expostos

# Utilitários
pnpm lint                   # Linting
pnpm format                 # Formatação
```

## 🧪 Testes Realizados

### ✅ Conexão Supabase
- Cliente público configurado
- Cliente admin configurado
- Teste de conexão passou
- Variáveis de ambiente validadas

### ✅ Estrutura de Workspaces
- Turborepo configurado
- pnpm workspaces funcionando
- Dependências instaladas corretamente

### ✅ Segurança
- `.gitignore` configurado
- `.env.example` criado
- Script de detecção de secrets implementado

## 📚 Próximos Passos

1. **Configure suas credenciais** no `.env.local`
2. **Execute os testes** para validar setup
3. **Consulte a documentação** específica de cada componente
4. **Siga as melhores práticas** de segurança

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Anthropic Console](https://console.anthropic.com/settings/keys)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

---

**Status:** ✅ Setup Inicial Concluído  
**Última Atualização:** 08/01/2025
