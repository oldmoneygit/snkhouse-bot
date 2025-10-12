# 🚀 GUIA DE DEPLOY - FASE 1: Claude 3.5 Haiku

**Data:** 2025-10-12
**Versão:** FASE 1 - Vercel AI SDK + Claude 3.5 Haiku
**Tempo estimado:** 15-30 minutos

---

## ✅ PRÉ-REQUISITOS

Antes de fazer o deploy, certifique-se de que você tem:

- ✅ Conta Vercel configurada
- ✅ Repositório GitHub conectado à Vercel
- ✅ API Key do Anthropic (`ANTHROPIC_API_KEY`)
- ✅ Credenciais WooCommerce (`WOOCOMMERCE_URL`, `CONSUMER_KEY`, `CONSUMER_SECRET`)
- ✅ Credenciais Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- ✅ Credenciais WhatsApp Business (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`)

---

## 📋 PASSO A PASSO PARA DEPLOY

### **PASSO 1: Push para GitHub**

```bash
# Verificar status do commit
git log -1 --oneline

# Deve mostrar:
# a00d8be feat(fase-1): Implementar Vercel AI SDK + Claude 3.5 Haiku e reorganizar projeto

# Push para GitHub
git push origin main
```

**✅ Verificar:** Acesse GitHub e confirme que o commit apareceu.

---

### **PASSO 2: Configurar Variáveis de Ambiente na Vercel**

#### **2.1. Acessar Dashboard da Vercel**

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: `whatsapp-service` (ou nome do seu projeto)
3. Vá em: **Settings** → **Environment Variables**

#### **2.2. Adicionar/Atualizar Variáveis**

**IMPORTANTE:** Adicione a flag para ativar Claude:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `USE_CLAUDE_PROCESSOR` | `true` | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Production, Preview, Development |

**Variáveis existentes (verificar se estão configuradas):**

| Variable Name | Valor (exemplo) | Environments |
|---------------|-----------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://czueuxqhmifgofuflscg.supabase.co` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | All |
| `WOOCOMMERCE_URL` | `https://snkhouse.com` | All |
| `WOOCOMMERCE_CONSUMER_KEY` | `ck_...` | All |
| `WOOCOMMERCE_CONSUMER_SECRET` | `cs_...` | All |
| `WHATSAPP_PHONE_NUMBER_ID` | `838782475982078` | All |
| `WHATSAPP_ACCESS_TOKEN` | `EAASwKkE...` | All |
| `WHATSAPP_VERIFY_TOKEN` | `snkh_webhook_secret_2025` | All |

**✅ Verificar:** Todas as variáveis devem estar marcadas para **Production**, **Preview** e **Development**.

---

### **PASSO 3: Fazer Deploy na Vercel**

#### **Opção A: Deploy Automático (Recomendado)**

A Vercel detecta automaticamente o push para `main` e faz o deploy.

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto `whatsapp-service`
3. Aguarde o deploy automático iniciar (geralmente 10-30 segundos após push)
4. Acompanhe o progresso em **Deployments**

#### **Opção B: Deploy Manual**

Se preferir fazer manualmente:

```bash
# Na raiz do projeto
cd apps/whatsapp-service

# Deploy usando Vercel CLI
vercel --prod
```

**✅ Aguardar:** O deploy leva cerca de 2-5 minutos.

---

### **PASSO 4: Verificar Logs de Deploy**

1. No dashboard da Vercel, clique no deployment mais recente
2. Vá em **Logs** ou **Build Logs**
3. Procure por:
   ```
   ✓ Compiled successfully
   ✓ Build completed
   ```

**⚠️ Se houver erro:**
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que o build passou localmente: `pnpm run build`
- Verifique os logs de erro na Vercel

---

### **PASSO 5: Testar o Deploy**

#### **5.1. Verificar URL do Webhook**

1. No dashboard da Vercel, copie a URL de produção:
   ```
   https://whatsapp-service-xxx.vercel.app
   ```

2. A URL do webhook será:
   ```
   https://whatsapp-service-xxx.vercel.app/api/webhooks/whatsapp
   ```

#### **5.2. Configurar Webhook no Meta (Facebook)**

1. Acesse: https://developers.facebook.com/apps
2. Selecione seu app WhatsApp Business
3. Vá em: **WhatsApp** → **Configuration** → **Webhook**
4. Clique em **Edit**
5. Configure:
   - **Callback URL:** `https://whatsapp-service-xxx.vercel.app/api/webhooks/whatsapp`
   - **Verify Token:** `snkh_webhook_secret_2025` (mesmo valor de `WHATSAPP_VERIFY_TOKEN`)
6. Clique em **Verify and Save**

**✅ Sucesso:** Deve mostrar "Webhook verified successfully"

---

### **PASSO 6: Testar Funcionalidade**

#### **Teste 1: Verificação do Webhook**

```bash
# Testar endpoint de verificação
curl "https://whatsapp-service-xxx.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=snkh_webhook_secret_2025&hub.challenge=TEST123"

# Deve retornar: TEST123
```

#### **Teste 2: Enviar Mensagem de Teste via WhatsApp**

1. Envie uma mensagem para o número WhatsApp Business:
   ```
   Hola!
   ```

2. **Verificar logs da Vercel:**
   - Acesse: Dashboard → Deployment → **Runtime Logs**
   - Procure por:
     ```
     🤖 [Claude Processor] Processing message for conv ...
     ✅ [Claude Processor] User message saved
     ✅ [Claude Processor] Response generated
     ```

3. **Verificar resposta:**
   - O bot deve responder em 1-3 segundos
   - Tom argentino (vos)
   - Mensagem curta (1-3 linhas)

#### **Teste 3: Buscar Produtos (searchProducts tool)**

Envie via WhatsApp:
```
Tienen Jordan 1?
```

**Verificar logs:**
```
[Claude Tool] searchProducts: "jordan 1", limit: 5
[Claude Tool] ✅ Found X products
```

**Esperado:** Bot lista produtos com preços.

#### **Teste 4: Consultar Pedido (getOrderDetails tool)**

**⚠️ IMPORTANTE:** Você precisa de um pedido real do WooCommerce.

Envie via WhatsApp:
```
Pedido 27072, email: test@example.com
```

**Verificar logs:**
```
[Claude Tool] getOrderDetails: order=27072, email=test***
[Claude Tool] ✅ Order found: #27072, status: processing
```

**Esperado:**
- Bot retorna status do pedido
- Se email incorreto → Bot responde: "No encontré ese pedido con ese email"

#### **Teste 5: Verificar Rollback (OpenAI Agent Builder)**

Para garantir que o fallback funciona:

1. Vá em Vercel → Settings → Environment Variables
2. Altere `USE_CLAUDE_PROCESSOR` para `false`
3. Faça redeploy
4. Teste novamente enviando mensagem
5. **Verificar logs:** Deve mostrar `[Agent Builder Processor]` em vez de `[Claude Processor]`
6. **Volte para `true`** após validar

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### **1. Verificar Logs em Tempo Real**

```bash
# Usando Vercel CLI
vercel logs --follow

# Ou acesse: Dashboard → Deployment → Runtime Logs
```

### **2. Verificar Métricas de Custo (Anthropic)**

1. Acesse: https://console.anthropic.com
2. Vá em: **Usage** → **API Usage**
3. Monitore:
   - Input tokens usados
   - Output tokens usados
   - Custo total (deve ser ~$0.80 por 1M tokens input)

**Meta de custo (FASE 1):**
- 100 conversas/dia → ~$3/mês
- 500 conversas/dia → ~$15/mês
- 2,000 conversas/dia → ~$60/mês

### **3. Verificar Tool Calling Accuracy**

Nos primeiros dias, monitore:
- Quantas vezes o bot chamou tools corretamente
- Quantas vezes falhou
- Tipos de queries que funcionam melhor

**Target:** 92%+ de accuracy (Claude 3.5 Haiku)

---

## 🐛 TROUBLESHOOTING

### **Problema 1: Webhook não verifica**

**Sintoma:** Meta retorna erro "Webhook verification failed"

**Solução:**
1. Verificar `WHATSAPP_VERIFY_TOKEN` na Vercel (deve ser exatamente igual)
2. Testar endpoint de verificação manualmente (curl)
3. Verificar logs da Vercel durante tentativa de verificação

---

### **Problema 2: Bot não responde**

**Sintoma:** Mensagens enviadas, mas nenhuma resposta

**Checklist:**
1. ✅ Webhook configurado no Meta?
2. ✅ `USE_CLAUDE_PROCESSOR=true` na Vercel?
3. ✅ `ANTHROPIC_API_KEY` válida?
4. ✅ Logs da Vercel mostram erro?

**Verificar logs:**
```bash
vercel logs --follow
```

Procure por:
- ❌ `[Claude Processor] Error:`
- ❌ `ANTHROPIC_API_KEY is not defined`
- ❌ `401 Unauthorized`

---

### **Problema 3: Tools não são chamadas**

**Sintoma:** Bot responde, mas não chama `searchProducts` ou `getOrderDetails`

**Causas comuns:**
1. Query muito vaga (ex: "oi" não chama nenhuma tool)
2. System prompt não está correto
3. Model não entende a instrução

**Teste específico:**
```
Envie: "Pedido 12345, email: test@test.com"
```

**Deve chamar:** `getOrderDetails`

**Se não chamar:**
1. Verificar logs: `[Claude Tool]` deve aparecer
2. Verificar se `inputSchema` está correto no código
3. Testar com model `claude-sonnet-4-0` (mais preciso) temporariamente

---

### **Problema 4: Timeout (10s Vercel)**

**Sintoma:** Erro 504 Gateway Timeout

**Causa:** Processamento demora mais de 10s (limite Vercel Hobby)

**Solução temporária:**
1. Usar `claude-3-5-haiku-latest` (já está configurado - mais rápido)
2. Aguardar **FASE 3** (Inngest background processing)

**Solução definitiva (FASE 3):**
- Implementar Inngest
- Webhook retorna 200 imediatamente
- Processamento em background

---

## ✅ CHECKLIST FINAL

Antes de considerar FASE 1 completa:

- [ ] **Deploy bem-sucedido na Vercel**
- [ ] **Webhook verificado no Meta**
- [ ] **Variável `USE_CLAUDE_PROCESSOR=true` configurada**
- [ ] **Bot responde mensagens em 1-3 segundos**
- [ ] **Tool `searchProducts` funciona** (teste: "Tienen Jordan 1?")
- [ ] **Tool `getOrderDetails` funciona** (teste com pedido real)
- [ ] **Rollback testado** (mudar para `false` e voltar para `true`)
- [ ] **Logs monitorados** (sem erros críticos)
- [ ] **Custo monitorado** (Anthropic Console)

---

## 🎯 PRÓXIMAS FASES

Após validar FASE 1 em produção:

### **FASE 2: Sistema de Conversas (4-6h)**
- Implementar histórico de 10 mensagens
- Usar tabelas Supabase existentes
- Manter contexto entre mensagens

### **FASE 3: Inngest Background Processing (2-4h)**
- Resolver timeout de 10s
- Webhook retorna 200 rápido
- Processamento em background

### **FASE 4: Otimizações de Custo (2-4h)**
- Prompt caching (90% desconto)
- Redis cache (WooCommerce)
- Model routing

---

## 📞 SUPORTE

**Dúvidas ou problemas?**

1. Verificar logs da Vercel primeiro
2. Consultar documentação: [docs/fase-1-vercel-ai-sdk.md](../fase-1-vercel-ai-sdk.md)
3. Revisar troubleshooting acima

---

**Boa sorte com o deploy! 🚀**
