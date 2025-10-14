# 🔐 Vercel Environment Variables - Checklist

> **CRÍTICO**: O widget NÃO funciona sem estas variáveis!

## 📋 Lista Completa de Environment Variables

### **1. Supabase (Database)**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Valor: https://czueuxqhmifgofuflscg.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Valor: [Cole a anon key do Supabase]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Valor: [Cole a service role key do Supabase]
```

**Onde encontrar**:
- Acesse: https://supabase.com/dashboard/project/czueuxqhmifgofuflscg/settings/api
- `NEXT_PUBLIC_SUPABASE_URL` = URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public (pode ser exposta)
- `SUPABASE_SERVICE_ROLE_KEY` = service_role (NÃO expor no frontend!)

---

### **2. OpenAI (AI Agent)**

```bash
vercel env add OPENAI_API_KEY production
# Valor: sk-proj-...
```

**Onde encontrar**:
- Acesse: https://platform.openai.com/api-keys
- Copie a API key existente ou crie uma nova

---

### **3. WooCommerce (E-commerce API)**

```bash
vercel env add WOOCOMMERCE_URL production
# Valor: https://snkhouse.com

vercel env add WOOCOMMERCE_CONSUMER_KEY production
# Valor: ck_...

vercel env add WOOCOMMERCE_CONSUMER_SECRET production
# Valor: cs_...
```

**Onde encontrar**:
- WordPress Admin → WooCommerce → Settings → Advanced → REST API
- Ou use as credenciais existentes do `.env.local`

---

## 🚀 Como Adicionar (2 opções)

### **Opção 1: Via CLI (Mais Rápido)**

```bash
# 1. Certifique-se de estar logado
vercel whoami

# 2. Navegue até o diretório do widget
cd apps/widget

# 3. Adicione cada variável uma por uma
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add WOOCOMMERCE_URL production
vercel env add WOOCOMMERCE_CONSUMER_KEY production
vercel env add WOOCOMMERCE_CONSUMER_SECRET production

# 4. Redeploy para aplicar as variáveis
vercel --prod
```

---

### **Opção 2: Via Dashboard (Mais Visual)**

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto `snkhouse-widget`
3. Clique em **Settings → Environment Variables**
4. Para cada variável:
   - Clique em **"Add New"**
   - Name: `NEXT_PUBLIC_SUPABASE_URL` (exemplo)
   - Value: cole o valor
   - Environment: marque **Production** (e Preview se quiser)
   - Clique em **"Save"**
5. Após adicionar todas, vá em **Deployments** → 3 pontinhos → **"Redeploy"**

---

## ✅ Checklist de Validação

Depois de adicionar as variáveis e fazer redeploy:

- [ ] Deploy concluído sem erros
- [ ] Acesse a URL do widget: `https://snkhouse-widget-xxx.vercel.app`
- [ ] Widget abre (não mostra erro de CORS ou API)
- [ ] Consegue enviar mensagem de teste
- [ ] Mensagem aparece no histórico (Supabase funcionando)
- [ ] AI responde (OpenAI funcionando)
- [ ] Busca de produtos funciona (WooCommerce funcionando)

---

## 🔍 Como Copiar Valores do .env.local

Se você tem o `.env.local` configurado localmente, pode copiar os valores de lá:

```bash
# No terminal (Windows PowerShell)
cd c:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE\apps\widget
type .env.local

# Ou no Git Bash
cat .env.local
```

Copie os valores e cole no Vercel.

---

## ⚠️ IMPORTANTE: Segurança

- ✅ **NEXT_PUBLIC_\*** = Pode ser exposta (vão para o browser)
- ❌ **Sem NEXT_PUBLIC_** = NÃO deve ser exposta (server-side only)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = OK expor
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = OK expor (tem Row Level Security)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` = NUNCA expor (bypass RLS)
- ❌ `OPENAI_API_KEY` = NUNCA expor (cobranças!)
- ❌ `WOOCOMMERCE_CONSUMER_SECRET` = NUNCA expor

---

## 🎯 Próximos Passos

Depois de configurar as variáveis:

1. ✅ Widget funcionando → Configurar domínio customizado `widget.snkhouse.com`
2. ✅ Domínio configurado → Instalar widget no site `snkhouse.com`
3. ✅ Widget instalado → Instalar context snippet (Context Awareness)
4. ✅ Tudo funcionando → Testar fluxo completo

---

**Última atualização**: 2025-01-14
**Autor**: Claude Code
