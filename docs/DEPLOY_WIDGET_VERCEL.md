# 🚀 Deploy do Widget na Vercel

> **Guia completo** para fazer deploy do Widget na Vercel

---

## 📋 Pré-requisitos

Antes de começar, você precisa:

- [ ] Conta na Vercel (gratuita) - [vercel.com/signup](https://vercel.com/signup)
- [ ] Vercel CLI instalada globalmente
- [ ] Git configurado localmente
- [ ] Environment variables prontas (Supabase, OpenAI, etc.)

---

## ⚡ Opção 1: Deploy via CLI (Recomendado)

**Vantagens:**
- ✅ Mais rápido
- ✅ Deploy direto do terminal
- ✅ Controle total

---

### **Passo 1.1: Instalar Vercel CLI**

```bash
# Instalar globalmente
npm install -g vercel

# Verificar instalação
vercel --version
```

**Esperado:** `Vercel CLI 33.0.0` (ou superior)

---

### **Passo 1.2: Login na Vercel**

```bash
vercel login
```

**Processo:**
1. Escolher método de login (Email, GitHub, GitLab, Bitbucket)
2. Confirmar no navegador
3. Voltar ao terminal

**Esperado:**
```
✓ Email confirmed
> Success! GitHub authentication complete
```

---

### **Passo 1.3: Navegar até o Widget**

```bash
cd c:/Users/PC/Desktop/Ecossistema_Atendimento_SNKHOUSE/apps/widget
```

---

### **Passo 1.4: Deploy de Desenvolvimento (Preview)**

```bash
vercel
```

**Perguntas que vai fazer:**

1. **Set up and deploy?** → `Y` (Yes)
2. **Which scope?** → Escolher sua conta/team
3. **Link to existing project?** → `N` (No) - primeira vez
4. **What's your project's name?** → `snkhouse-widget` (ou outro nome)
5. **In which directory is your code located?** → `.` (enter)
6. **Want to override settings?** → `N` (No) - usar `vercel.json`

**Processo:**
```
🔍 Inspect: https://vercel.com/seu-usuario/snkhouse-widget/xxxxx
✅ Preview: https://snkhouse-widget-xxxxx.vercel.app
```

**Teste a URL preview!** Abra no navegador e veja se funciona.

---

### **Passo 1.5: Deploy de Produção**

```bash
vercel --prod
```

**Resultado:**
```
✅ Production: https://snkhouse-widget.vercel.app
```

**Esta é a URL final!** Use esta URL para instalar no site.

---

## 🌐 Opção 2: Deploy via GitHub (Automático)

**Vantagens:**
- ✅ Auto-deploy a cada commit
- ✅ Preview automático em PRs
- ✅ Histórico de deploys

---

### **Passo 2.1: Push para GitHub**

```bash
# Se ainda não commitou as mudanças
git add .
git commit -m "feat: Widget pronto para deploy"
git push origin main
```

---

### **Passo 2.2: Conectar Vercel ao GitHub**

1. Acessar [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clicar em **"Add New..."** → **"Project"**
3. Clicar em **"Import Git Repository"**
4. Conectar GitHub (se primeira vez)
5. Escolher repositório: `Ecossistema_Atendimento_SNKHOUSE`
6. Clicar em **"Import"**

---

### **Passo 2.3: Configurar Projeto**

**Framework Preset:** Next.js (auto-detectado)

**Root Directory:** `apps/widget`

**Build Settings:**
- Build Command: `pnpm build` (auto-detectado)
- Output Directory: `.next` (auto-detectado)
- Install Command: `pnpm install` (auto-detectado)

**Clicar em "Deploy"**

---

### **Passo 2.4: Aguardar Build**

**Processo:**
```
⏳ Building...
⏳ Deploying...
✅ Deployment ready!
```

**URL:** `https://snkhouse-widget.vercel.app`

---

## 🔐 Configurar Environment Variables

**CRÍTICO:** Widget precisa de environment variables para funcionar!

---

### **Via CLI:**

```bash
# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Colar: https://xxxxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Colar: eyJxxxxx

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Colar: eyJxxxxx

# OpenAI
vercel env add OPENAI_API_KEY
# Colar: sk-xxxxx

# WooCommerce
vercel env add WOOCOMMERCE_URL
# Colar: https://snkhouse.com

vercel env add WOOCOMMERCE_CONSUMER_KEY
# Colar: ck_xxxxx

vercel env add WOOCOMMERCE_CONSUMER_SECRET
# Colar: cs_xxxxx

# Anthropic (opcional - se usar Claude)
vercel env add ANTHROPIC_API_KEY
# Colar: sk-ant-xxxxx
```

**Após adicionar todas:**

```bash
# Re-deploy para aplicar env vars
vercel --prod
```

---

### **Via Dashboard:**

1. Acessar [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clicar no projeto `snkhouse-widget`
3. Ir em **"Settings"** → **"Environment Variables"**
4. Adicionar cada variável:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY = eyJxxxxx
```

**OpenAI:**
```
OPENAI_API_KEY = sk-xxxxx
```

**WooCommerce:**
```
WOOCOMMERCE_URL = https://snkhouse.com
WOOCOMMERCE_CONSUMER_KEY = ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET = cs_xxxxx
```

**Anthropic (opcional):**
```
ANTHROPIC_API_KEY = sk-ant-xxxxx
```

5. **Salvar**
6. Ir em **"Deployments"** → clicar nos 3 pontos do último deploy → **"Redeploy"**

---

## 🎯 Configurar Domínio Customizado (Opcional)

**URL padrão:** `https://snkhouse-widget.vercel.app`
**URL customizada:** `https://widget.snkhouse.com` (mais profissional!)

---

### **Passo 1: Adicionar Domínio na Vercel**

1. Acessar projeto na Vercel
2. Ir em **"Settings"** → **"Domains"**
3. Adicionar: `widget.snkhouse.com`
4. Clicar em **"Add"**

**Vercel vai mostrar:**
```
Configure your domain:

Type: CNAME
Name: widget
Value: cname.vercel-dns.com
```

---

### **Passo 2: Configurar DNS**

1. Acessar painel do domínio (ex: GoDaddy, Namecheap, Cloudflare)
2. Ir em **DNS Settings**
3. Adicionar registro CNAME:

```
Type:  CNAME
Name:  widget
Value: cname.vercel-dns.com
TTL:   Auto (ou 3600)
```

4. **Salvar**

---

### **Passo 3: Aguardar Propagação**

**Tempo:** 5 minutos a 48 horas (geralmente 10-30 min)

**Verificar:**
```bash
# Verificar DNS
nslookup widget.snkhouse.com

# Ou online
https://dnschecker.org
```

**Quando pronto:**
```
✅ widget.snkhouse.com → cname.vercel-dns.com
```

---

### **Passo 4: SSL Automático**

Vercel configura **SSL automático** (HTTPS) via Let's Encrypt.

**Aguardar ~1 minuto após DNS propagar.**

**Verificar:**
- Abrir: `https://widget.snkhouse.com`
- Deve ter cadeado 🔒 verde

---

## ✅ Validar Deploy

### **Teste 1: Widget Carrega**

```
Abrir: https://snkhouse-widget.vercel.app
```

**Esperado:**
- ✅ Widget aparece
- ✅ Pode digitar mensagem
- ✅ Modal de email aparece

---

### **Teste 2: API Funciona**

```
Abrir Console (F12)
Digitar mensagem
```

**Esperado:**
```
✅ [Widget] Message sent
✅ [Stream API] Starting stream
✅ Bot responde
```

---

### **Teste 3: Product Cards**

```
Perguntar: "¿Qué zapatillas Nike tienen?"
```

**Esperado:**
- ✅ Bot responde com texto
- ✅ Product Cards aparecem
- ✅ Imagens carregam
- ✅ Botão "Agregar al Carrito" funciona

---

### **Teste 4: Performance**

```
Abrir: Chrome DevTools → Network → Disable cache
Recarregar página
```

**Esperado:**
- ✅ First Load: < 3s
- ✅ Subsequent Loads: < 1s
- ✅ Time to Interactive: < 2s

---

## 🚨 Troubleshooting

### **Problema: Build Failed**

**Erro comum:**
```
Error: Command "pnpm build" exited with 1
```

**Checklist:**

1. ✅ Verificar se `pnpm-lock.yaml` está commitado
2. ✅ Verificar se `turbo.json` está correto
3. ✅ Rodar localmente:
   ```bash
   pnpm build
   ```
4. ✅ Verificar logs do Vercel:
   - Clicar no deploy failed
   - Ver logs completos

**Solução comum:**
- Adicionar `vercel.json` com configurações corretas

---

### **Problema: Environment Variables não funcionam**

**Sintomas:**
- Widget carrega mas não responde
- Erros de "API Key inválida"

**Checklist:**

1. ✅ Verificar se variáveis estão configuradas:
   ```bash
   vercel env ls
   ```

2. ✅ Verificar se estão em **Production**:
   - Deve ter checkmark verde em "Production"

3. ✅ Re-deploy após adicionar variáveis:
   ```bash
   vercel --prod
   ```

**Solução comum:**
- Adicionar variáveis via dashboard é mais confiável

---

### **Problema: CORS Error**

**Sintomas:**
```
Access to fetch at 'https://api.openai.com' from origin 'https://snkhouse-widget.vercel.app' has been blocked by CORS
```

**Causa:**
- Vercel não está configurando headers CORS corretamente

**Solução:**

Criar/editar `vercel.json` em `apps/widget/`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

**Depois:**
```bash
git add vercel.json
git commit -m "fix: add CORS headers"
git push
```

Vercel vai re-deploy automaticamente.

---

### **Problema: Domain não resolve**

**Sintomas:**
- `widget.snkhouse.com` não abre

**Checklist:**

1. ✅ Verificar DNS propagou:
   ```bash
   nslookup widget.snkhouse.com
   ```

2. ✅ Verificar CNAME está correto:
   ```
   Name: widget
   Value: cname.vercel-dns.com
   ```

3. ✅ Aguardar mais tempo (até 48h)

**Solução comum:**
- Limpar cache DNS:
  ```bash
  ipconfig /flushdns  # Windows
  sudo dscacheutil -flushcache  # Mac
  ```

---

## 📊 Monitoramento

### **Vercel Analytics**

1. Acessar projeto na Vercel
2. Ir em **"Analytics"**
3. Ver métricas:
   - Visitors
   - Page Views
   - Top Pages
   - Performance

---

### **Vercel Logs**

```bash
# Ver logs em tempo real
vercel logs snkhouse-widget --follow

# Ver últimos logs
vercel logs snkhouse-widget
```

**Ou via Dashboard:**
1. Projeto → **"Deployments"**
2. Clicar em deployment
3. Ver **"Functions"** → Logs

---

## 🎯 Checklist de Deploy Completo

Antes de considerar deploy **PRONTO**:

- [ ] Deploy de produção feito (`vercel --prod`)
- [ ] URL funciona: `https://snkhouse-widget.vercel.app`
- [ ] Environment variables configuradas (todas!)
- [ ] Widget carrega sem erros
- [ ] Modal de email funciona
- [ ] Bot responde mensagens
- [ ] Product Cards aparecem
- [ ] API `/api/chat/stream` funciona
- [ ] API `/api/products/[id]` funciona
- [ ] API `/api/cart/add` funciona
- [ ] Performance aceitável (< 3s first load)
- [ ] SSL funcionando (HTTPS)
- [ ] Sem CORS errors
- [ ] Domínio customizado configurado (opcional)

---

## 🔄 Workflow de Deploy (Futuro)

### **Development:**
```bash
# Fazer mudanças localmente
pnpm dev

# Testar localmente
# http://localhost:3000

# Commit
git add .
git commit -m "feat: nova funcionalidade"
git push
```

**Vercel faz deploy automático de preview!**

---

### **Production:**
```bash
# Merge para main
git checkout main
git merge feature/sua-branch
git push origin main
```

**Vercel faz deploy automático para produção!**

---

## 🎉 Resultado Final

**URL do Widget:**
- Production: `https://snkhouse-widget.vercel.app`
- Custom Domain: `https://widget.snkhouse.com` (se configurou)

**Usar esta URL em:**
- [INSTALL_WIDGET_SNKHOUSE.md](./INSTALL_WIDGET_SNKHOUSE.md) - Para instalar no site
- `context-snippet.js` - Para Context Awareness

---

## 📚 Próximos Passos

Após deploy completo:

1. ✅ **Instalar widget no site**
   - Seguir: [INSTALL_WIDGET_SNKHOUSE.md](./INSTALL_WIDGET_SNKHOUSE.md)

2. ✅ **Instalar Context Snippet**
   - Seguir: [INSTALL_CONTEXT_SNIPPET.md](./INSTALL_CONTEXT_SNIPPET.md)

3. ✅ **Testar tudo**
   - Widget aparece?
   - Context Awareness funciona?
   - Product Cards funcionam?

4. ✅ **Monitorar**
   - Vercel Analytics
   - Supabase Dashboard
   - Admin Dashboard

---

## 📞 Suporte

**Problemas?**
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Comunidade: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Deploy criado por**: Claude Code
**Data**: 2025-01-14
**Versão**: 1.0.0
