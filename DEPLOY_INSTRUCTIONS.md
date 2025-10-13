# 🚀 DEPLOYMENT INSTRUCTIONS

## ❌ PROBLEMA ATUAL

O commit `b6c1897` com a correção de memória foi feito, mas **NÃO foi deployed no Vercel**.

O deployment atual (`dpl_4X2HXSfEJUh6Z7dAsQRkwjqKXH6V`) ainda está usando a **versão antiga SEM memória**.

---

## ✅ SOLUÇÃO 1: Deploy Manual via Vercel Dashboard

### Passos:

1. **Acessar Vercel Dashboard**
   - Ir para: https://vercel.com/dashboard
   - Login (se necessário)

2. **Selecionar o Projeto**
   - Procurar por `snkhouse-bot-whatsapp-service`
   - Clicar no projeto

3. **Verificar Deployments**
   - Clicar na aba "Deployments"
   - Procurar pelo commit mais recente: `b6c1897` ("fix: implement conversation memory...")

4. **Se o deployment NÃO apareceu automaticamente:**
   - Clicar no último deployment
   - Clicar em "⋯" (três pontos)
   - Selecionar "Redeploy"
   - Confirmar

5. **Aguardar o deployment**
   - Deve levar 2-3 minutos
   - Verificar se o status ficou "Ready"

6. **Testar novamente**
   - Enviar mensagens no WhatsApp
   - Baixar novos logs do Vercel
   - Procurar por "🔍 DEBUG #" nos logs

---

## ✅ SOLUÇÃO 2: Configurar Vercel CLI

### 1. Login no Vercel CLI

```bash
# Na pasta do projeto:
cd apps/whatsapp-service

# Login (vai abrir o browser):
npx vercel login

# Vincular ao projeto:
npx vercel link

# Fazer deploy:
npx vercel --prod
```

### 2. Para deploys futuros:

```bash
# Depois de fazer commit e push:
git add .
git commit -m "sua mensagem"
git push origin main

# Deploy manual:
cd apps/whatsapp-service
npx vercel --prod
```

---

## ✅ SOLUÇÃO 3: Configurar Auto-Deploy via GitHub

### Verificar Integração:

1. **No Vercel Dashboard:**
   - Settings → Git
   - Verificar se o repositório GitHub está conectado
   - Verificar se "Auto Deploy" está habilitado para branch `main`

2. **Se não estiver conectado:**
   - Clicar em "Connect Git Repository"
   - Autorizar GitHub
   - Selecionar o repositório
   - Configurar branch `main` para auto-deploy

---

## 🧪 COMO VERIFICAR SE O NOVO DEPLOY FUNCIONOU

### 1. Nos Logs do Vercel

Procure por estas mensagens:

```
✅ "[MessageProcessor] 🚀 Starting processing WITH DATABASE AND MEMORY..."
✅ "🔍 DEBUG #1 - Checking for duplicate message..."
✅ "🔍 DEBUG #2 - Finding or creating customer..."
✅ "🔍 DEBUG #5 - Loading conversation history..."
```

**Se NÃO aparecerem** = deployment antigo ainda rodando

### 2. No Deployment ID

Pegue o novo deployment ID nos logs e compare:

```json
"deploymentId": "dpl_XXXXXXXXXX"  // Se diferente de dpl_4X2HXSfEJUh6Z7dAsQRkwjqKXH6V = deploy novo!
```

### 3. Teste Funcional

```
Mensagem 1: "27072, suporte@stealthify.ai"
Bot: Encontra o pedido ✅

Mensagem 2: "Cuál es el tracking?"
Bot: DEVE lembrar do pedido e dar o tracking ✅
     SEM pedir número de pedido novamente ✅
```

---

## 📊 ESTADO ATUAL DO CÓDIGO

✅ **Código corrigido:** [message-processor.ts](apps/whatsapp-service/src/lib/message-processor.ts)
✅ **Commit criado:** `b6c1897`
✅ **Push para GitHub:** Feito
❌ **Deploy no Vercel:** **PENDENTE** ⚠️

---

## 🆘 SE NADA FUNCIONAR

Se mesmo depois do deploy os logs não aparecerem:

1. **Verifique qual webhook está recebendo as mensagens:**
   - `/api/webhooks/whatsapp` (WhatsApp Business API oficial)
   - `/api/webhooks/evolution` (Evolution API)

2. **Verifique qual processador está sendo chamado:**
   - `message-processor.ts` (WhatsApp Business API)
   - `evolution-processor.ts` (Evolution API)

3. **Evolution API já tem memória funcionando**
   - Se estiver usando Evolution, mude o webhook para `/api/webhooks/evolution`

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**👉 FAZER DEPLOY MANUAL NO VERCEL DASHBOARD AGORA!**

https://vercel.com/dashboard
