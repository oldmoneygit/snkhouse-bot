# 🔧 APLICAR MIGRATION: effective_email

## ⚠️ AÇÃO NECESSÁRIA

A migration `20250110_add_effective_email.sql` precisa ser aplicada **manualmente** no Supabase Dashboard.

---

## 📋 PASSO A PASSO

### 1. Acessar Supabase Dashboard

🔗 **URL:** https://supabase.com/dashboard/project/czueuxqhmifgofuflscg/editor

### 2. Ir para SQL Editor

- No menu lateral esquerdo, clique em **SQL Editor**
- Ou acesse direto: https://supabase.com/dashboard/project/czueuxqhmifgofuflscg/sql/new

### 3. Copiar e Colar o SQL Abaixo

```sql
-- Migration: Add effective_email to conversations table
-- Purpose: Persist email used in conversation to avoid asking user repeatedly
-- Date: 2025-01-10

-- Add effective_email column to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS effective_email TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_effective_email
ON conversations(effective_email);

-- Add comment explaining the column
COMMENT ON COLUMN conversations.effective_email IS
'Email efetivo usado nesta conversa. Pode ser diferente do customer.email se atualizado durante a conversa. Persiste entre mensagens para evitar pedir email repetidamente.';

-- Update existing conversations to use customer email as default
UPDATE conversations c
SET effective_email = cu.email
FROM customers cu
WHERE c.customer_id = cu.id
  AND c.effective_email IS NULL;
```

### 4. Executar o SQL

- Clique no botão **"Run"** (ou pressione Ctrl+Enter / Cmd+Enter)
- Aguarde a confirmação de sucesso

### 5. Verificar Resultado

Executar este SQL para confirmar:

```sql
SELECT
  id,
  customer_id,
  effective_email,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 5;
```

**Resultado esperado:**
- Coluna `effective_email` deve aparecer
- Conversas existentes devem ter `effective_email` preenchido com email do customer

---

## ✅ CONFIRMAR SUCESSO

Após executar, rodar o widget novamente. Os erros devem desaparecer:

❌ **Antes:**
```
Error: Could not find the 'effective_email' column of 'conversations'
```

✅ **Depois:**
```
💬 [Widget API] Nova conversa criada com email: jeferson***@gmail.com
♻️ [Widget API] Reutilizando email salvo da conversa
```

---

## 🔍 TROUBLESHOOTING

### Erro: "permission denied"
**Solução:** Certifique-se de estar logado como owner do projeto Supabase

### Erro: "column already exists"
**Solução:** Migration já foi aplicada! Pode ignorar e testar o widget

### Erro: "syntax error"
**Solução:** Copie o SQL exatamente como está acima, sem modificações

---

## 📞 SUPORTE

Se continuar com erro após aplicar a migration:
1. Verificar logs do servidor widget
2. Verificar se coluna foi criada: `\d conversations` no SQL Editor
3. Reiniciar servidor do widget: `cd apps/widget && pnpm dev`
