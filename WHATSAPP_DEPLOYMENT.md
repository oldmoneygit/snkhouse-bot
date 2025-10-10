# 🚀 WhatsApp Business Integration - Deployment Guide

## ✅ Status da Implementação

### Fases Completas:
- ✅ **FASE 1**: Setup base structure (apps/whatsapp-service)
- ✅ **FASE 2**: WhatsApp Client (enviar mensagens, mark as read)
- ✅ **FASE 3**: Webhook Receiver (GET verification + POST messages)
- ✅ **FASE 4**: Message Processor (AI Agent integration completa)

### Database Migration:
- ✅ Migration aplicada manualmente no Supabase:
  - `customers.phone` (TEXT, indexed)
  - `customers.whatsapp_name` (TEXT)
  - `customers.whatsapp_profile_updated_at` (TIMESTAMPTZ)
  - `conversations.channel` ('widget' | 'whatsapp')
  - `conversations.channel_metadata` (JSONB)
  - `messages.whatsapp_message_id` (TEXT, indexed)
  - `messages.whatsapp_status` ('sent' | 'delivered' | 'read' | 'failed')

---

## 🎯 Próximos Passos para Produção

### **1. Deploy na Vercel**

#### Opção A: Via GitHub + Vercel Dashboard (Recomendado)

1. **Push do código:**
   ```bash
   git push origin main
   ```

2. **Acessar Vercel Dashboard:**
   - URL: https://vercel.com/dashboard
   - Login com sua conta

3. **Criar novo projeto:**
   - Click em "Add New..." → "Project"
   - Import do repositório GitHub
   - Selecionar: `Ecossistema_Atendimento_SNKHOUSE`

4. **Configurar projeto:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/whatsapp-service`
   - **Build Command**: `pnpm build` (Vercel detecta automaticamente)
   - **Output Directory**: `.next` (padrão Next.js)

5. **Environment Variables:**
   Adicionar todas as variáveis de `.env.local`:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://czueuxqhmifgofuflscg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_URL=https://czueuxqhmifgofuflscg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

   # OpenAI
   OPENAI_API_KEY=sk-proj-...

   # Anthropic (fallback)
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # WooCommerce
   WOOCOMMERCE_URL=https://snkhouse.com
   WOOCOMMERCE_CONSUMER_KEY=ck_...
   WOOCOMMERCE_CONSUMER_SECRET=cs_...

   # WhatsApp Business
   WHATSAPP_PHONE_NUMBER_ID=838782475982078
   WHATSAPP_BUSINESS_ACCOUNT_ID=1575359680117626
   WHATSAPP_ACCESS_TOKEN=EAASwKkE6M7s... (obter novo token permanente)
   WHATSAPP_VERIFY_TOKEN=snkh_webhook_secret_2025
   ```

6. **Deploy:**
   - Click em "Deploy"
   - Aguardar build completar (2-3 minutos)
   - Anotar URL do deploy: `https://whatsapp-service-xxx.vercel.app`

#### Opção B: Via Vercel CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Na raiz do projeto
cd apps/whatsapp-service

# Login (se necessário)
vercel login

# Deploy para produção
vercel --prod

# Anotar URL retornada
```

---

### **2. Configurar Webhook no Meta**

#### 2.1. Obter Token Permanente

⚠️ **IMPORTANTE**: O token atual é temporário (expira em 24h-60 dias).

**Para gerar token permanente:**

1. Acessar: https://developers.facebook.com/apps/1319595436291003/whatsapp-business/wa-settings
2. **System Users** → Create System User
3. Nome: "SNKHOUSE WhatsApp Bot"
4. Role: Admin
5. **Generate New Token**:
   - App: SNKHOUSE Bot (1319595436291003)
   - Permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
   - Token Expiration: **Never**
6. Copiar token e atualizar `WHATSAPP_ACCESS_TOKEN` na Vercel

#### 2.2. Configurar Webhook

1. **Acessar configuração:**
   - URL: https://developers.facebook.com/apps/1319595436291003/webhooks
   - Ou: App Dashboard → WhatsApp → Configuration → Webhook

2. **Editar Webhook:**
   - Click em "Edit" no Webhook configurado

3. **Callback URL:**
   ```
   https://SEU-DOMINIO.vercel.app/api/webhooks/whatsapp
   ```
   Exemplo: `https://whatsapp-service-xxx.vercel.app/api/webhooks/whatsapp`

4. **Verify Token:**
   ```
   snkh_webhook_secret_2025
   ```

5. **Verify and Save:**
   - Click em "Verify and Save"
   - Meta vai fazer uma requisição GET para validar
   - Se der erro, verificar:
     - URL está acessível publicamente?
     - Verify token está correto na Vercel?
     - Ver logs na Vercel (Deployments → Logs)

6. **Subscribe to Fields:**
   - Marcar: ✅ **messages**
   - Marcar: ✅ **message_status**
   - Salvar

#### 2.3. Adicionar Número de Teste

Por enquanto, WhatsApp está em **modo de desenvolvimento**. Apenas números na whitelist podem receber mensagens.

**Para adicionar números de teste:**

1. Acessar: https://developers.facebook.com/apps/1319595436291003/whatsapp-business/wa-settings
2. **Phone Numbers** → Add Phone Number
3. Adicionar número no formato internacional (sem +): `5491112345678`
4. Número receberá código de verificação via WhatsApp
5. Inserir código para confirmar

**Números atuais na whitelist:**
- `15556339984` (número de teste Meta)

---

### **3. Solicitar Aprovação de Produção (Opcional)**

Para sair do modo de desenvolvimento e enviar para qualquer número:

1. **Business Verification:**
   - Verificar Business Manager
   - Documentos necessários (CNPJ, comprovante, etc)

2. **App Review:**
   - Submeter app para revisão Meta
   - Justificar uso de `whatsapp_business_messaging`
   - Fornecer vídeo demo

3. **Templates Aprovados:**
   - Criar templates de mensagens
   - Aguardar aprovação (24-48h)

**Nota:** Para MVP, modo de desenvolvimento é suficiente. Adicione números conforme necessário na whitelist.

---

## 🧪 Teste de Produção

### 1. Verificar Webhook

```bash
curl "https://SEU-DOMINIO.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=snkh_webhook_secret_2025&hub.challenge=TEST123"

# Deve retornar: TEST123
```

### 2. Enviar Mensagem via WhatsApp

1. Abrir WhatsApp no celular
2. Enviar mensagem para: **+57 322 8616012** (número da SNKHOUSE)
3. Mensagem de teste: `Hola! Quiero ver zapatillas Nike`

### 3. Verificar Logs

**Logs Vercel:**
- https://vercel.com/dashboard → Seu Projeto → Deployments → Logs

**Verificar:**
- ✅ Webhook POST recebido
- ✅ Customer criado/encontrado
- ✅ Conversation criada
- ✅ Mensagem salva
- ✅ AI Agent processou
- ✅ Resposta enviada

**Logs esperados:**
```
[Webhook] Processing webhook async...
[Webhook] Processing incoming message: { id: 'wamid.XXX', from: '5491***', type: 'text' }
[MessageProcessor] Processing message from: { phone: '5491***', name: 'Nome do Cliente' }
[CustomerHelper] Customer found: uuid-xxx
[ConversationHelper] Active conversation found: uuid-xxx
[MessageProcessor] Sending to AI Agent...
[OpenAI] Injetado customer_id=123
[MessageProcessor] AI response received: { length: 234, has_tools: true }
[WhatsApp] Message sent to 5491***
[MessageProcessor] ✅ Message processed successfully
```

### 4. Verificar Supabase

**Customers:**
```sql
SELECT * FROM customers WHERE phone = '5491112345678';
```

**Conversations:**
```sql
SELECT * FROM conversations WHERE channel = 'whatsapp' ORDER BY created_at DESC LIMIT 5;
```

**Messages:**
```sql
SELECT * FROM messages
WHERE conversation_id = 'uuid-da-conversa'
ORDER BY created_at DESC;
```

**Analytics:**
```sql
SELECT * FROM analytics_events
WHERE metadata->>'channel' = 'whatsapp'
ORDER BY created_at DESC LIMIT 10;
```

---

## 🔐 Segurança em Produção

### 1. Habilitar Signature Validation

**Arquivo:** `apps/whatsapp-service/src/app/api/webhooks/whatsapp/route.ts`

Linha 46-48, **descomentar**:

```typescript
const isValid = verifyWebhookSignature(rawBody, signature, APP_SECRET);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

E **remover** a linha de warning:

```typescript
// REMOVER ESTA LINHA:
// console.warn('[Webhook] ⚠️ Invalid signature - processing anyway for testing');
```

### 2. App Secret

Atualmente usando `WHATSAPP_ACCESS_TOKEN` como secret. Idealmente usar `App Secret`:

1. Obter App Secret:
   - https://developers.facebook.com/apps/1319595436291003/settings/basic
   - Copiar "App Secret"

2. Adicionar env var na Vercel:
   ```
   WHATSAPP_APP_SECRET=xxxxxxxxx
   ```

3. Atualizar código:
   ```typescript
   const APP_SECRET = process.env.WHATSAPP_APP_SECRET || process.env.WHATSAPP_ACCESS_TOKEN!;
   ```

### 3. Rate Limiting

Meta permite **80 mensagens/segundo**.

Para produção, considerar:
- Implementar fila (Supabase Realtime, BullMQ, ou similar)
- Rate limiting por customer
- Backoff exponencial em caso de erro

---

## 📊 Monitoramento

### Métricas Importantes:

1. **Webhook Health:**
   - Taxa de sucesso (200 OK)
   - Tempo de resposta (< 5s)
   - Erros de signature

2. **Message Processing:**
   - Tempo médio de processamento
   - Taxa de sucesso AI Agent
   - Taxa de falha envio WhatsApp

3. **Customer Experience:**
   - Tempo de resposta do bot
   - Taxa de resolução
   - Satisfação (analytics)

### Alertas Sugeridos:

- ⚠️ Webhook > 4.5s (risco de timeout)
- ⚠️ Taxa de erro > 5%
- ⚠️ AI Agent timeout
- ⚠️ WhatsApp API down

---

## 🐛 Troubleshooting

### Webhook não valida (403 Forbidden)

**Problema:** Meta retorna erro ao configurar webhook.

**Soluções:**
1. Verificar `WHATSAPP_VERIFY_TOKEN` na Vercel
2. Testar URL manualmente:
   ```bash
   curl "https://SEU-DOMINIO.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=snkh_webhook_secret_2025&hub.challenge=TEST"
   ```
3. Ver logs Vercel para identificar erro

### Mensagens não chegam

**Problema:** Bot não responde mensagens enviadas.

**Soluções:**
1. Verificar número está na whitelist
2. Ver logs Vercel: Deployment → Functions → Logs
3. Verificar webhook subscribed a "messages"
4. Testar POST manual:
   ```bash
   curl -X POST https://SEU-DOMINIO.vercel.app/api/webhooks/whatsapp \
     -H "Content-Type: application/json" \
     -d '{"object":"whatsapp_business_account","entry":[...]}'
   ```

### Bot responde mas mensagem não envia

**Problema:** Processamento OK, mas envio falha.

**Erros comuns:**
- `#131030`: Número não na whitelist (adicionar no Meta)
- `#100`: Token inválido/expirado (gerar novo)
- `#80007`: Rate limit (esperar ou implementar fila)

**Soluções:**
1. Verificar logs: `[WhatsApp] Error sending message`
2. Validar `WHATSAPP_ACCESS_TOKEN` válido
3. Verificar `WHATSAPP_PHONE_NUMBER_ID` correto

### AI Agent não responde

**Problema:** Mensagem recebida, mas AI não processa.

**Soluções:**
1. Verificar `OPENAI_API_KEY` válida
2. Ver logs: `[MessageProcessor] Sending to AI Agent...`
3. Verificar customer context (email, customer_id)
4. Validar tools disponíveis (WooCommerce, FAQs)

### Database errors

**Problema:** Erro ao salvar customer/conversation/message.

**Soluções:**
1. Verificar `SUPABASE_SERVICE_KEY` na Vercel
2. Validar migration aplicada:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'customers' AND column_name = 'phone';
   ```
3. Verificar RLS policies (service key bypass RLS)

---

## 📈 Próximas Melhorias

### Funcionalidades:
- [ ] Suporte a imagens (enviar fotos de produtos)
- [ ] Suporte a documentos (enviar nota fiscal)
- [ ] Templates aprovados (notificações proativas)
- [ ] Botões interativos (quick replies)
- [ ] Listas de seleção (menu de produtos)

### Infraestrutura:
- [ ] Fila de mensagens (Redis/BullMQ)
- [ ] Cache de respostas (Redis)
- [ ] Observability (Sentry, DataDog)
- [ ] Dashboard de métricas (Grafana)

### Integrações:
- [ ] CRM (Pipedrive, HubSpot)
- [ ] Notificações Slack
- [ ] Sistema de tickets
- [ ] Handoff para humano

---

## 📝 Commits Realizados

1. `c5aa645` - feat(whatsapp): setup base structure for whatsapp-service app
2. `1225ff4` - feat(integrations): add WhatsApp Cloud API client for sending messages
3. `9ca1a43` - feat(whatsapp): implement webhook receiver with GET/POST handlers
4. `6d3f0ea` - feat(whatsapp): implement message processor with AI agent integration

---

## ✅ Checklist de Deploy

Antes de considerar completo:

### Infraestrutura:
- [ ] Deploy Vercel realizado
- [ ] Todas env vars configuradas
- [ ] URL pública acessível
- [ ] Logs Vercel funcionando

### Meta Configuration:
- [ ] Token permanente gerado
- [ ] Webhook configurado e validado
- [ ] Subscriptions ativas (messages + message_status)
- [ ] Número de teste na whitelist

### Testes:
- [ ] GET verification funciona
- [ ] POST webhook aceito
- [ ] Mensagem de teste enviada
- [ ] Bot responde corretamente
- [ ] Customer criado no Supabase
- [ ] Conversation criada
- [ ] Messages salvas
- [ ] Analytics tracked

### Segurança:
- [ ] Signature validation habilitada
- [ ] App Secret configurado
- [ ] Phones sanitizados em logs
- [ ] Service key protegida

### Monitoramento:
- [ ] Logs configurados
- [ ] Alertas definidos
- [ ] Dashboard de métricas (opcional)

---

## 🆘 Suporte

**Documentação Meta:**
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Webhooks: https://developers.facebook.com/docs/graph-api/webhooks
- Message Types: https://developers.facebook.com/docs/whatsapp/cloud-api/messages

**Suporte Meta:**
- Community: https://developers.facebook.com/community/forums
- Bug Reports: https://developers.facebook.com/support/bugs

**Repositório:**
- Issues: [GitHub Issues do projeto]
- Docs: `packages/ai-agent/README.md`

---

**Última atualização:** 2025-10-10
**Versão:** 1.0.0
**Status:** ✅ Pronto para deploy em produção
