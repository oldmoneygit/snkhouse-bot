# FASE 1: Implementação Vercel AI SDK + Claude 3.5 Sonnet

**Status:** ✅ COMPLETO
**Data:** 2025-10-12
**Duração:** ~1.5 horas

---

## 📋 RESUMO

Substituímos o OpenAI Agent Builder por Vercel AI SDK + Claude 3.5 Sonnet como processador alternativo, mantendo o OpenAI como fallback. O sistema agora permite A/B testing entre ambos processadores via variável de ambiente.

---

## ✅ IMPLEMENTAÇÕES REALIZADAS

### 1. Dependências Instaladas
```bash
pnpm add ai @ai-sdk/anthropic zod
```

**Versões:**
- `ai`: 5.0.68
- `@ai-sdk/anthropic`: 2.0.27
- `zod`: 3.25.76

---

### 2. Arquivo Criado: `claude-processor.ts`

**Localização:** [apps/whatsapp-service/src/lib/claude-processor.ts](../apps/whatsapp-service/src/lib/claude-processor.ts)

**Função Principal:**
```typescript
export async function processMessageWithClaude({
  message: string,
  conversationId: string,
  customerId: string,
  customerPhone: string
}): Promise<string>
```

**Model:** `claude-3-5-sonnet-20241022`

**System Prompt:** Baseado no workflow v4 com instruções do vendedor argentino "Javier" da SNKHOUSE.

---

### 3. Tools Implementadas (WooCommerce)

#### **Tool 1: searchProducts**
- **Descrição:** Busca produtos no catálogo por palavras-chave
- **Parâmetros:**
  - `query` (string): Termo de busca (ex: "jordan 1", "nike dunk")
  - `limit` (number, opcional): Quantidade de resultados (default: 5)
- **Retorna:** Array de produtos com `id`, `name`, `price`, `stock`, `url`, `image`
- **WooCommerce Endpoint:** `GET /products?search={query}`

#### **Tool 2: getOrderDetails**
- **Descrição:** Consulta detalhes completos de um pedido
- **Parâmetros:**
  - `order_id` (string): Número do pedido
  - `email` (string): Email do cliente **para validação de ownership** (segurança)
- **Retorna:** Detalhes do pedido: `status`, `products[]`, `shipping_address`, `tracking`, `date`
- **Segurança:** Valida se `billing.email === email` antes de retornar dados
- **WooCommerce Endpoint:** `GET /orders/{order_id}`

#### **Tool 3: checkProductStock**
- **Descrição:** Verifica disponibilidade de stock de um produto
- **Parâmetros:**
  - `product_id` (string): ID do produto
  - `size` (string, opcional): Talle específico (ex: "42", "M")
- **Retorna:** `in_stock`, `quantity`, `name`, `price`
- **TODO:** Verificação de talle específico (por enquanto retorna stock geral)
- **WooCommerce Endpoint:** `GET /products/{product_id}`

---

### 4. Webhook Atualizado: `route.ts`

**Localização:** [apps/whatsapp-service/src/app/api/webhooks/whatsapp/route.ts:415-457](../apps/whatsapp-service/src/app/api/webhooks/whatsapp/route.ts#L415-L457)

**Modificação:**
```typescript
const USE_CLAUDE = process.env.USE_CLAUDE_PROCESSOR === 'true';

if (USE_CLAUDE) {
  response = await processMessageWithClaude({...});
} else {
  response = await processMessageWithAgentBuilder({...}); // fallback
}
```

**Logs:** Sistema imprime qual processador está sendo usado para facilitar debugging.

---

### 5. Variáveis de Ambiente

**Arquivo:** [apps/whatsapp-service/.env.local:20-26](../apps/whatsapp-service/.env.local#L20-L26)

```env
# ANTHROPIC (Claude) - Primary Processor
ANTHROPIC_API_KEY=sk-ant-api03-...

# Processor selection: 'true' = Claude, 'false' = OpenAI Agent Builder
USE_CLAUDE_PROCESSOR=true
```

---

## 🧪 VALIDAÇÕES

### ✅ TypeScript Build
```bash
pnpm run type-check
```
**Resultado:** ✅ Sem erros

### ✅ Arquivos Modificados
- ✅ Criado: `apps/whatsapp-service/src/lib/claude-processor.ts`
- ✅ Modificado: `apps/whatsapp-service/src/app/api/webhooks/whatsapp/route.ts`
- ✅ Modificado: `apps/whatsapp-service/.env.local`

### ✅ Compatibilidade
- ✅ OpenAI Agent Builder preservado como fallback
- ✅ Pode alternar processadores via env var
- ✅ Rollback seguro (`USE_CLAUDE_PROCESSOR=false`)

---

## 🚧 PENDENTE: TESTES MANUAIS

**IMPORTANTE:** Ainda não testamos as tools em produção. Próximos passos:

### Teste 1: searchProducts
```
Input: "Tienen Jordan 1?"
Expected:
- Claude chama searchProducts("jordan 1")
- Retorna lista de produtos
- Bot responde: "Sí! Tenemos Jordan 1\n$75.000, envío gratis"
```

### Teste 2: getOrderDetails
```
Input: "Pedido 27072, email: test@example.com"
Expected:
- Claude chama getOrderDetails("27072", "test@example.com")
- Valida ownership (billing.email === test@example.com)
- Retorna detalhes do pedido
- Se email incorreto → retorna erro
```

### Teste 3: checkProductStock
```
Input: "Tienen talle 42 de las Nike Dunk?"
Expected:
- Claude chama searchProducts("nike dunk") primeiro
- Depois chama checkProductStock(product_id, "42")
- Retorna disponibilidade
```

### Teste 4: Rollback
```
Ação: Alterar USE_CLAUDE_PROCESSOR=false
Expected:
- Sistema volta para OpenAI Agent Builder
- Sem erros
```

---

## 📊 COMPARAÇÃO: OpenAI vs Claude

| Métrica | OpenAI Agent Builder | Claude (Vercel AI SDK) |
|---------|---------------------|------------------------|
| Tool calling | 60-70% confiável | **Esperado: 93%+** |
| Latência | 3-7s | **Esperado: 2-4s** |
| Custo/1K msgs | $3-5 | **Esperado: ~$3** (sem otimizações) |
| Context | Thread ID (OpenAI) | **Próxima fase:** Supabase history |
| Timeout | Problemas frequentes | **Próxima fase:** Inngest |

---

## 🎯 DECISÕES TÉCNICAS

### 1. Por que `inputSchema` em vez de `parameters`?
Vercel AI SDK v5 usa `inputSchema` para definir o schema das tools (não `parameters`).

### 2. Por que manter OpenAI Agent Builder?
Rollback seguro. Se Claude falhar, podemos voltar para OpenAI instantaneamente via env var.

### 3. Por que Zod?
Validação de tipos em runtime + integração nativa com Vercel AI SDK.

### 4. Por que não remover OpenAI Agent Builder agora?
Aguardar validação completa da FASE 1, 2, 3 e 4 antes de remover código legado.

---

## ⚠️ LIMITAÇÕES CONHECIDAS

1. **Tool checkProductStock:** Não verifica talle específico (retorna stock geral)
2. **Sem contexto:** Ainda não implementamos histórico de conversas (FASE 2)
3. **Timeout:** Ainda pode dar timeout no Vercel (resolver na FASE 3 com Inngest)
4. **Custo:** Ainda não otimizado (FASE 4: caching, model routing)

---

## 🚀 PRÓXIMOS PASSOS

### FASE 2: Sistema de Conversas (4-6h)
- Criar `session-manager.ts`
- Usar tabelas Supabase existentes (`conversations`, `messages`)
- Buscar últimas 10 mensagens para contexto
- Passar histórico para Claude

### FASE 3: Inngest Background Processing (2-4h)
- Instalar Inngest
- Webhook enfileira mensagem (retorna 200 rápido)
- Worker processa em background (sem timeout)

### FASE 4: Otimizações de Custo (2-4h)
- Prompt caching (90% desconto)
- Redis cache (WooCommerce API calls)
- Model routing (queries simples → Haiku)

---

## 📝 LOGS IMPORTANTES

**Formato de logs implementado:**
```
🤖 [Claude Processor] Processing message for conv {conversationId}
✅ [Claude Processor] User message saved
[Claude Tool] searchProducts: "jordan 1", limit: 5
[Claude Tool] ✅ Found 3 products
✅ [Claude Processor] Response generated: {duration, usage}
✅ [Claude Processor] Assistant response saved
```

**Uso de tokens registrado em metadata:**
```typescript
metadata: {
  processor: 'claude',
  model: 'claude-3-5-sonnet-20241022',
  execution_time_ms: 2341,
  usage: { inputTokens: 450, outputTokens: 120 }
}
```

---

## ✅ CHECKLIST FINAL FASE 1

- [x] Dependências instaladas
- [x] `claude-processor.ts` criado
- [x] 3 tools WooCommerce implementadas
- [x] Webhook atualizado com flag
- [x] `.env.local` configurado
- [x] Build TypeScript sem erros
- [ ] **PENDENTE:** Testes manuais das 3 tools
- [ ] **PENDENTE:** Validação de tool calling confiável
- [ ] **PENDENTE:** Deploy e teste em produção

---

**Próxima etapa:** Realizar testes manuais das tools via WhatsApp ou começar FASE 2 (sistema de conversas).
