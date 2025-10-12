# 🔧 FIX: WooCommerce 401 Unauthorized

**Erro:** `[Claude Tool] ❌ searchProducts error: Request failed with status code 401`

**Causa:** Credenciais WooCommerce incorretas ou não configuradas na Vercel.

---

## ✅ SOLUÇÃO PASSO A PASSO

### **PASSO 1: Verificar Credenciais WooCommerce Locais**

As credenciais no `.env.local` são:

```env
WOOCOMMERCE_URL=https://snkhouse.com
WOOCOMMERCE_CONSUMER_KEY=ck_43e18153503d488872d15f57e77a8c4b38f0423e
WOOCOMMERCE_CONSUMER_SECRET=cs_9265083c26e7106c1994218a20964dd557153760
```

**⚠️ Importante:** Essas credenciais precisam estar **exatamente iguais** na Vercel.

---

### **PASSO 2: Gerar Novas Credenciais WooCommerce (Recomendado)**

**Por que gerar novas?**
- Credenciais atuais podem estar expiradas
- Podem não ter permissões corretas
- Mais seguro gerar novas

**Como gerar:**

1. Acesse: https://snkhouse.com/wp-admin
2. Vá em: **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. Clique em: **Add key**
4. Configure:
   - **Description:** `Claude Processor API`
   - **User:** Escolha um usuário administrador
   - **Permissions:** **Read/Write** ✅ (IMPORTANTE!)
5. Clique em: **Generate API key**
6. **COPIE** as credenciais geradas:
   - `Consumer key`: `ck_...`
   - `Consumer secret`: `cs_...`

**⚠️ ATENÇÃO:** Copie agora! A secret só aparece UMA vez.

---

### **PASSO 3: Atualizar .env.local (Desenvolvimento)**

```bash
# Abra: apps/whatsapp-service/.env.local

# Substitua:
WOOCOMMERCE_CONSUMER_KEY=ck_NOVA_KEY_AQUI
WOOCOMMERCE_CONSUMER_SECRET=cs_NOVA_SECRET_AQUI
```

---

### **PASSO 4: Atualizar Variáveis na Vercel (Produção)**

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto `whatsapp-service`
3. Vá em: **Settings** → **Environment Variables**
4. **Procure** por `WOOCOMMERCE_CONSUMER_KEY`:
   - Se existir: Clique em **Edit** e substitua pelo novo valor
   - Se não existir: Clique em **Add New** e adicione

5. **Procure** por `WOOCOMMERCE_CONSUMER_SECRET`:
   - Se existir: Clique em **Edit** e substitua pelo novo valor
   - Se não existir: Clique em **Add New** e adicione

6. **Procure** por `WOOCOMMERCE_URL`:
   - Deve ser: `https://snkhouse.com` (com HTTPS!)
   - Se estiver como `http://` → mude para `https://`

**✅ Certifique-se:** Todas as variáveis devem estar marcadas para:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### **PASSO 5: Testar Localmente ANTES de Deploy**

```bash
# Na raiz do projeto
cd apps/whatsapp-service

# Rodar em dev
pnpm run dev

# Em outro terminal, testar endpoint de diagnóstico
curl http://localhost:3003/api/test-woocommerce
```

**Esperado:**
```json
{
  "timestamp": "...",
  "environment": {
    "WOOCOMMERCE_URL": "https://snkhouse.com",
    "WOOCOMMERCE_CONSUMER_KEY": "ck_43e1815...",
    "WOOCOMMERCE_CONSUMER_SECRET": "cs_9265083..."
  },
  "tests": {
    "listProducts": {
      "status": "SUCCESS",
      "count": 3,
      "products": [...]
    },
    "searchProducts": {
      "status": "SUCCESS",
      "query": "jordan",
      "count": 2,
      "products": [...]
    }
  },
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "allPassed": true
  }
}
```

**❌ Se falhar:**
- Verificar se as credenciais estão corretas
- Verificar se a URL está com `https://`
- Verificar permissões (deve ser Read/Write)
- Verificar se o usuário WooCommerce tem permissões de administrador

---

### **PASSO 6: Fazer Deploy na Vercel**

```bash
# Commit das mudanças (se alterou .env.local, NÃO commitar!)
git add apps/whatsapp-service/src/app/api/test-woocommerce/route.ts
git commit -m "feat: add WooCommerce diagnostic endpoint"
git push origin main
```

**Aguardar:** Deploy automático (~2-5 min)

---

### **PASSO 7: Testar em Produção**

#### **Teste 1: Endpoint de Diagnóstico**

```bash
# Substituir SEU_APP pela URL do Vercel
curl https://SEU_APP.vercel.app/api/test-woocommerce
```

**Esperado:** `"allPassed": true`

**❌ Se falhar:**
- Verificar logs da Vercel: Dashboard → Runtime Logs
- Procurar por erro específico
- Verificar se variáveis de ambiente foram salvas

#### **Teste 2: WhatsApp Real**

Envie via WhatsApp:
```
Tienen Jordan 1?
```

**Esperado:**
- Logs devem mostrar: `[Claude Tool] searchProducts: "jordan 1", limit: 5`
- Logs devem mostrar: `[Claude Tool] ✅ Found X products`
- Bot responde com lista de produtos

---

## 🐛 TROUBLESHOOTING DETALHADO

### **Erro: 401 Unauthorized**

**Causas possíveis:**

1. **Credenciais incorretas**
   - Solução: Gerar novas credenciais (PASSO 2)

2. **Credenciais sem permissões Read/Write**
   - Solução: Ir em WooCommerce → REST API → Editar key → Mudar para Read/Write

3. **Usuário WooCommerce sem permissões**
   - Solução: Criar key com usuário administrador

4. **URL incorreta (http vs https)**
   - Solução: Verificar que é `https://snkhouse.com`

5. **Credenciais não configuradas na Vercel**
   - Solução: Adicionar no Settings → Environment Variables

---

### **Erro: 404 Not Found**

**Causas:**
- URL incorreta (ex: `https://snkhouse.com/wp-json` em vez de `https://snkhouse.com`)
- WooCommerce REST API desabilitada

**Solução:**
1. Verificar que `WOOCOMMERCE_URL=https://snkhouse.com` (sem `/wp-json`)
2. Ir em WooCommerce → Settings → Advanced → REST API → Ativar

---

### **Erro: Connection Timeout**

**Causas:**
- Firewall bloqueando Vercel
- WooCommerce offline

**Solução:**
1. Testar se site está online: `curl https://snkhouse.com`
2. Adicionar IP do Vercel na whitelist do firewall

---

## ✅ CHECKLIST FINAL

Após seguir todos os passos:

- [ ] **Novas credenciais WooCommerce geradas** (Read/Write)
- [ ] **`.env.local` atualizado** com novas credenciais
- [ ] **Vercel Environment Variables atualizadas**
- [ ] **Teste local passou** (`curl localhost:3003/api/test-woocommerce`)
- [ ] **Deploy feito** (`git push origin main`)
- [ ] **Teste produção passou** (`curl SEU_APP.vercel.app/api/test-woocommerce`)
- [ ] **Teste WhatsApp passou** ("Tienen Jordan 1?")

---

## 📊 VERIFICAÇÃO DE PERMISSÕES WOOCOMMERCE

As credenciais devem ter permissão para acessar:

- ✅ `GET /products` - Listar produtos
- ✅ `GET /products?search=X` - Buscar produtos
- ✅ `GET /products/{id}` - Detalhes do produto
- ✅ `GET /orders/{id}` - Detalhes do pedido

**Se algum endpoint retornar 401, as permissões estão incorretas.**

---

## 🚀 APÓS CORRIGIR

Quando tudo estiver funcionando:

1. ✅ Remover endpoint de diagnóstico (ou deixar para debug futuro)
2. ✅ Fazer commit final
3. ✅ Continuar com FASE 2 (sistema de conversas)

---

**Boa sorte! 🎯**
