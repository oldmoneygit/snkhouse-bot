# 💬 FOLTZ Fanwear - Chat Widget

Widget de atendimento com IA para FOLTZ Fanwear (jerseys réplicas premium 1:1).

## 📋 Status: 95% COMPLETO ✅

**Estrutura**: ✅ Completa
**API Routes**: ✅ Completas (`/api/chat/stream`, `/api/chat/history`, `/api/products/[id]`)
**Componentes**: ✅ Completos (`ProductCard`, `ProductList`, utils)
**Estilos**: ✅ Completos (`globals.css` com branding FOLTZ)
**Faltam**: ⏳ `page.tsx` e `embed/page.tsx` (15 min para copiar e adaptar)

---

## 🚀 PRÓXIMO PASSO (15 minutos)

### **Copiar e Adaptar** `page.tsx` e `embed/page.tsx`

**📖 Instruções completas**: `../../FOLTZ_FINAL_INSTRUCTIONS.md` (raiz do projeto)

**Quick start**:

```bash
# 1. Copiar arquivos do widget SNKHOUSE
cd apps/foltz-widget/src/app
cp ../../widget/src/app/page.tsx ./page.tsx
mkdir -p embed
cp ../../widget/src/app/embed/page.tsx ./embed/page.tsx

# 2. Fazer modificações (ver FOLTZ_FINAL_INSTRUCTIONS.md):
#    - Trocar imports (@snkhouse/ai-agent → @snkhouse/foltz-ai-agent)
#    - Trocar logo (/snkhouse-logo-new.png → /foltz-logo.png)
#    - Trocar localStorage keys (snkhouse_* → foltz_*)
#    - Trocar allowed origins (snkhouse.com → foltzoficial.com)
#    - Trocar nome (SNKHOUSE → FOLTZ)

# 3. Testar
pnpm install
pnpm dev  # http://localhost:3002
```

**📖 LEIA**: `FOLTZ_FINAL_INSTRUCTIONS.md` para instruções passo a passo detalhadas!

---

## 🎨 Branding FOLTZ

- **Primary Color**: `#DAF10D` (amarelo limão neon)
- **Secondary Color**: `#1A1A1A` (dark black)
- **Logo**: `public/foltz-logo.png`
- **Font**: System default

---

## 🔧 Environment Variables

```bash
cp .env.example .env.local
# Editar .env.local com credenciais reais
```

**Obrigatórias**:
- `SHOPIFY_STORE_URL` - djjrjm-0p.myshopify.com
- `SHOPIFY_ACCESS_TOKEN` - shpat_xxxxx
- `OPENAI_API_KEY` - sk-xxxxx
- Supabase credentials (compartilhadas com SNKHOUSE)

---

## 💻 Development

```bash
pnpm install
pnpm dev
```

Acessar: http://localhost:3002

---

## 📦 Deploy

1. Push para GitHub
2. Vercel → New Project
3. Root Directory: `apps/foltz-widget`
4. Add Environment Variables
5. Configure domain: `chat.foltzoficial.com`

---

## 📚 Documentação

- **Guia de Implementação**: `../../FOLTZ_WIDGET_IMPLEMENTATION_GUIDE.md`
- **Resumo do Projeto**: `../../FOLTZ_PROJECT_SUMMARY.md`
- **Knowledge Base**: `../../FOLTZ_KNOWLEDGE.md`

---

## 🤖 AI Agent

O widget usa o agente FOLTZ customizado:
- **Package**: `@snkhouse/foltz-ai-agent`
- **System Prompt**: Tom animado, descontraído (hincha)
- **Transparência**: Sempre claro sobre réplicas 1:1
- **Promoção 3x1**: Sempre mencionar quando relevante
- **Tools**: 6 tools (busca, estoque, pedidos, envío)

---

## 🔗 Integração Shopify

- **API Version**: 2025-10
- **Client**: `@snkhouse/integrations/shopify`
- **Cache**: 5min TTL
- **Endpoints**: Products, Orders, Customers

---

## 📊 Features

- [x] Chat em tempo real
- [x] IA com knowledge base FOLTZ
- [x] Busca produtos Shopify
- [x] Product cards
- [x] Conversação persistente
- [x] Email onboarding
- [x] Page context awareness (opcional)
- [x] Mobile responsive
- [ ] WhatsApp (futuro)
- [ ] Admin dashboard (futuro)

---

## 🆘 Ajuda

Ver troubleshooting em `FOLTZ_WIDGET_IMPLEMENTATION_GUIDE.md`
