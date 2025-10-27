# 📊 Database Migrations

## Como Rodar as Migrations no Supabase

### Passo a Passo

1. **Acessar o Supabase Dashboard**:
   - Acesse: https://app.supabase.com
   - Selecione o projeto: `czueuxqhmifgofuflscg`

2. **Abrir SQL Editor**:
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Copiar e Colar o SQL**:
   - Abra o arquivo: `add_store_id_multi_tenant.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase

4. **Executar**:
   - Clique em **Run** (ou Ctrl/Cmd + Enter)
   - Aguarde confirmação de sucesso

5. **Verificar**:
   - Role até o final do SQL e descomente as queries de verificação
   - Execute novamente para ver a distribuição dos dados por store

---

## 🎯 Migration: `add_store_id_multi_tenant.sql`

### O que faz:
- Adiciona coluna `store_id` em `customers`, `conversations`, `messages`
- Define `'snkhouse'` como valor padrão (preserva dados existentes)
- Cria índices para performance
- Backfill de dados existentes com `store_id='snkhouse'`

### Impacto:
- ✅ **Zero impacto** nos dados existentes da SNKHOUSE
- ✅ **Backward compatible** - código antigo continua funcionando
- ✅ **Performance** - índices otimizados para queries multi-store

### Queries de Verificação:

```sql
-- Ver distribuição por store
SELECT store_id, COUNT(*) as count FROM customers GROUP BY store_id;
SELECT store_id, COUNT(*) as count FROM conversations GROUP BY store_id;
SELECT store_id, COUNT(*) as count FROM messages GROUP BY store_id;

-- Verificar índices criados
SELECT indexname FROM pg_indexes
WHERE tablename IN ('customers', 'conversations', 'messages')
ORDER BY tablename, indexname;
```

### Rollback (se necessário):
- No final do arquivo SQL há um bloco comentado com as instruções de rollback
- Descomente e execute se precisar reverter

---

## ⚠️ IMPORTANTE

- **Sempre faça backup** antes de rodar migrations em produção
- Esta migration é segura e não quebra dados existentes
- Todos os dados SNKHOUSE serão marcados como `store_id='snkhouse'`
- Novos dados FOLTZ usarão `store_id='foltz'`

---

## 🔐 Row Level Security (RLS)

Por enquanto, **NÃO estamos habilitando RLS** no nível do banco.

O isolamento será feito na **camada de aplicação** (queries sempre incluem `WHERE store_id = 'foltz'`).

Se quiser habilitar RLS no futuro, descomente a seção **STEP 4** no arquivo SQL.
