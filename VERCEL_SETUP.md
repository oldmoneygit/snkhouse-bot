# 🚀 Configuração do Vercel - 2 Projetos Separados

Este projeto usa **2 projetos separados** no Vercel para deployar os diferentes apps do monorepo.

---

## 📦 Projetos no Vercel

### 1️⃣ **SNKHOUSE Widget** (Chat Web)
- **Nome sugerido**: `snkhouse-widget` ou `snkhouse-bot-widget`
- **Domínio**: widget.snkhouse.app (ou custom domain)
- **Propósito**: Widget de chat embarcável nos sites

### 2️⃣ **SNKHOUSE WhatsApp Service** (API Backend)
- **Nome sugerido**: `snkhouse-whatsapp` ou `snkhouse-bot-api`
- **Domínio**: api.snkhouse.app (ou custom domain)
- **Propósito**: Webhook e processamento de mensagens WhatsApp

---

## ⚙️ Configuração no Vercel Dashboard

### 🔵 Projeto 1: Widget

1. **Criar novo projeto** no Vercel
2. **Import Git Repository**: Selecione o repositório `snkhouse-bot`
3. **Configure Project**:

   ```
   Framework Preset: Next.js
   Root Directory: apps/widget
   Build Command: (deixe vazio - usa vercel.json)
   Output Directory: (deixe vazio - usa vercel.json)
   Install Command: (deixe vazio - usa vercel.json)
   ```

4. **Environment Variables** (Settings → Environment Variables):

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # AI Services
   ANTHROPIC_API_KEY=sk-ant-xxx...
   OPENAI_API_KEY=sk-xxx...

   # WooCommerce
   WOOCOMMERCE_URL=https://snkhouse.com
   WOOCOMMERCE_CONSUMER_KEY=ck_xxx...
   WOOCOMMERCE_CONSUMER_SECRET=cs_xxx...
   ```

5. **Deploy**: Clique em "Deploy"

---

### 🟢 Projeto 2: WhatsApp Service

1. **Criar novo projeto** no Vercel
2. **Import Git Repository**: Selecione o **mesmo repositório** `snkhouse-bot`
3. **Configure Project**:

   ```
   Framework Preset: Next.js
   Root Directory: apps/whatsapp-service
   Build Command: (deixe vazio - usa vercel.json)
   Output Directory: (deixe vazio - usa vercel.json)
   Install Command: (deixe vazio - usa vercel.json)
   ```

4. **Environment Variables** (Settings → Environment Variables):

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # AI Services
   ANTHROPIC_API_KEY=sk-ant-xxx...
   OPENAI_API_KEY=sk-xxx...

   # WooCommerce
   WOOCOMMERCE_URL=https://snkhouse.com
   WOOCOMMERCE_CONSUMER_KEY=ck_xxx...
   WOOCOMMERCE_CONSUMER_SECRET=cs_xxx...

   # Evolution API (WhatsApp)
   EVOLUTION_API_URL=https://evolution-api.yourdomain.com
   EVOLUTION_API_KEY=your-api-key
   EVOLUTION_INSTANCE_NAME=snkhouse-bot
   ```

5. **Deploy**: Clique em "Deploy"

---

## 🔄 Como Funciona

### Arquivos de Configuração

Cada app tem seu próprio `vercel.json`:

- **apps/widget/vercel.json**: Configuração do widget
- **apps/whatsapp-service/vercel.json**: Configuração do whatsapp service

### Build Process

Quando você faz push no GitHub:

1. **Vercel detecta** que há mudanças no repositório
2. **Cada projeto** (widget e whatsapp-service) faz build independentemente
3. **Root Directory** garante que cada projeto só rebuilda quando seus arquivos mudam

### Otimização de Build

- ✅ **Builds independentes**: Mudanças no widget não rebuildam o whatsapp-service
- ✅ **Cache de dependências**: pnpm reutiliza node_modules entre builds
- ✅ **Workspace**: Pacotes compartilhados (@snkhouse/*) são buildados automaticamente

---

## 🌐 Configuração de Domínios (Opcional)

### Widget
```
Domínio de produção: widget.snkhouse.app
Domínio personalizado: chat.snkhouse.com (opcional)
```

### WhatsApp Service
```
Domínio de produção: api.snkhouse.app
Domínio personalizado: api.snkhouse.com (opcional)
```

**Como configurar**:
1. Settings → Domains
2. Add Domain
3. Adicione o domínio desejado
4. Configure DNS conforme instruções do Vercel

---

## 🔧 Troubleshooting

### ❌ Erro: "Root Directory incorreto"
**Solução**: Verifique que o Root Directory está configurado corretamente:
- Widget: `apps/widget`
- WhatsApp: `apps/whatsapp-service`

### ❌ Erro: "Missing environment variables"
**Solução**: Verifique que todas as variáveis de ambiente estão configuradas em Settings → Environment Variables

### ❌ Erro: "Build failed - workspace dependencies"
**Solução**: O buildCommand no vercel.json já instala dependências do monorepo. Se falhar:
1. Verifique se pnpm-lock.yaml está commitado
2. Verifique se os pacotes workspace estão listados corretamente

### ❌ Erro: "Routes manifest not found"
**Solução**: Certifique-se que:
1. Root Directory está correto
2. Output Directory está como `.next` (não `apps/widget/.next`)

---

## 📊 Monitoramento

### Ver Builds
- Vá em Deployments no Vercel Dashboard
- Cada projeto mostra seus próprios deployments

### Ver Logs
- Production logs: Deployments → [Deployment] → Runtime Logs
- Build logs: Deployments → [Deployment] → Build Logs

### Ver Analytics
- Analytics tab em cada projeto
- Métricas de performance, requests, etc.

---

## 🚀 Deploy Manual

Se precisar fazer deploy manual:

```bash
# Widget
cd apps/widget
vercel --prod

# WhatsApp Service
cd apps/whatsapp-service
vercel --prod
```

---

## ✅ Checklist de Configuração

### Widget
- [ ] Projeto criado no Vercel
- [ ] Root Directory: `apps/widget`
- [ ] Environment variables configuradas
- [ ] Build passou com sucesso
- [ ] URL de produção funcionando

### WhatsApp Service
- [ ] Projeto criado no Vercel
- [ ] Root Directory: `apps/whatsapp-service`
- [ ] Environment variables configuradas (incluindo Evolution API)
- [ ] Build passou com sucesso
- [ ] URL de produção funcionando
- [ ] Webhook configurado na Evolution API

---

## 📚 Recursos

- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)
