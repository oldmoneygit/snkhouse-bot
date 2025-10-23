# 🚀 Configuração do Vercel - 2 Projetos Separados

Este projeto usa **2 projetos separados** no Vercel para deployar os diferentes apps do monorepo.

> ⚠️ **IMPORTANTE**: Configure EXATAMENTE como descrito abaixo. Qualquer desvio causará erros de build.

---

## 📦 Projetos no Vercel

### 1️⃣ **SNKHOUSE Widget** (Chat Web)
- **Nome sugerido**: `snkhouse-widget`
- **Domínio**: Gerado automaticamente pelo Vercel
- **Propósito**: Widget de chat embarcável nos sites

### 2️⃣ **SNKHOUSE WhatsApp Service** (API Backend)
- **Nome sugerido**: `snkhouse-whatsapp`
- **Domínio**: Gerado automaticamente pelo Vercel
- **Propósito**: Webhook e processamento de mensagens WhatsApp

---

## ⚙️ Configuração no Vercel Dashboard

### 🔵 Projeto 1: Widget

#### Passo 1: Criar Projeto
1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. **Import Git Repository**: Selecione `snkhouse-bot`

#### Passo 2: Configure Project (CRÍTICO - Copie EXATAMENTE)

```
Project Name: snkhouse-widget (ou o que preferir)

Framework Preset: Next.js

Root Directory: apps/widget

Build Command: cd ../.. && pnpm install && pnpm --filter @snkhouse/widget build

Output Directory: .next

Install Command: (DEIXE VAZIO)
```

**⚠️ ATENÇÃO**:
- Root Directory deve ser **EXATAMENTE** `apps/widget`
- Build Command deve ter o `cd ../..` no início
- Output Directory deve ser `.next` (não `apps/widget/.next`)

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

#### Passo 1: Criar Projeto
1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. **Import Git Repository**: Selecione o **MESMO** repositório `snkhouse-bot`

#### Passo 2: Configure Project (CRÍTICO - Copie EXATAMENTE)

```
Project Name: snkhouse-whatsapp (ou o que preferir)

Framework Preset: Next.js

Root Directory: apps/whatsapp-service

Build Command: cd ../.. && pnpm install && pnpm --filter @snkhouse/whatsapp-service build

Output Directory: .next

Install Command: (DEIXE VAZIO)
```

**⚠️ ATENÇÃO**:
- Root Directory deve ser **EXATAMENTE** `apps/whatsapp-service`
- Build Command deve ter o `cd ../..` no início
- Output Directory deve ser `.next` (não `apps/whatsapp-service/.next`)

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

## 🔧 Se Você JÁ Criou os Projetos (Atualizar Configuração)

Se você já criou os projetos e eles estão dando erro, siga estes passos:

### Para Cada Projeto (Widget e WhatsApp):

1. **Acesse o projeto** no Vercel Dashboard
2. **Settings** → **General**
3. **Atualize estas configurações**:

#### Widget:
```
Root Directory: apps/widget
Build Command: cd ../.. && pnpm install && pnpm --filter @snkhouse/widget build
Output Directory: .next
Install Command: (APAGUE qualquer valor, deixe vazio)
```

#### WhatsApp Service:
```
Root Directory: apps/whatsapp-service
Build Command: cd ../.. && pnpm install && pnpm --filter @snkhouse/whatsapp-service build
Output Directory: .next
Install Command: (APAGUE qualquer valor, deixe vazio)
```

4. **Salve** as configurações
5. **Deployments** → Selecione o commit mais recente (a0b1981 ou posterior)
6. Clique nos **3 pontinhos** → **Redeploy**
7. **Use existing Build Cache**: DESMARQUE (para garantir build limpo)
8. Clique em **Redeploy**

---

## 🔄 Como Funciona

### Configuração

A configuração de build é feita **INTEIRAMENTE no Vercel Dashboard**, não há arquivos `vercel.json` nos apps.

Isso evita conflitos entre a configuração do arquivo e a configuração do Dashboard.

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
