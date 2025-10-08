# 🚀 Getting Started - SNKHOUSE Admin Dashboard

Bem-vindo ao Admin Dashboard do SNKHOUSE Bot! Este guia vai te ajudar a começar em menos de 5 minutos.

---

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configure o Ambiente (2 min)

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> 💡 **Onde encontrar?** Supabase → Settings → API

---

### 2️⃣ Instale as Dependências (2 min)

```bash
# Na raiz do projeto
pnpm install
```

---

### 3️⃣ Inicie o Servidor (1 min)

```bash
# Dentro de apps/admin/
pnpm dev
```

Ou da raiz do projeto:

```bash
pnpm --filter @snkhouse/admin dev
```

---

### 4️⃣ Acesse o Dashboard! 🎉

Abra no navegador: **http://localhost:3001**

---

## 📱 O que você vai ver?

### Dashboard Principal
```
┌────────────────────────────────────────────────────┐
│  🏠 SNKHOUSE Admin                    Dashboard    │
├────────────────────────────────────────────────────┤
│                                                    │
│  📊 Total Conversas    🟢 Conversas Ativas         │
│      123                  45                       │
│                                                    │
│  💬 Total Mensagens    ✅ Taxa Resolução           │
│      1,234                87%                      │
│                                                    │
│  📋 Conversas Recentes                             │
│  ├─ João Silva • Há 5min                          │
│  ├─ Maria Santos • Há 1h                          │
│  └─ Pedro Costa • Há 2h                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Lista de Conversas
```
┌────────────────────────────────────────────────────┐
│  ← Todas as Conversas                              │
├────────────────────────────────────────────────────┤
│                                                    │
│  👤 João Silva                    [widget] [active]│
│     joao@email.com                                 │
│                                                    │
│  👤 Maria Santos               [whatsapp] [active] │
│     maria@email.com                                │
│                                                    │
│  👤 Pedro Costa                  [widget] [resolved]│
│     pedro@email.com                                │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Detalhes da Conversa
```
┌────────────────────────────────────────────────────┐
│  ← Conversa com João Silva                         │
│     📧 joao@email.com  📅 08/10/2025  🟢 active    │
├────────────────────────────────────────────────────┤
│                                                    │
│  💬 Mensagens (12)                                 │
│                                                    │
│  [Cliente] ┌─────────────────────────┐             │
│           │ Olá! Preciso de ajuda   │             │
│           │ 14:30                   │             │
│           └─────────────────────────┘             │
│                                                    │
│            ┌─────────────────────────┐ [Bot]      │
│            │ Olá! Como posso ajudar? │            │
│            │ 14:30                   │            │
│            └─────────────────────────┘            │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🎨 Cores e Badges

### Status da Conversa
- 🟢 **active** - Conversa em andamento
- ⚪ **resolved** - Conversa resolvida
- 🔴 **archived** - Conversa arquivada

### Canal
- 🔵 **widget** - Chat do site
- 🟢 **whatsapp** - WhatsApp

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor (porta 3001)

# Produção
pnpm build            # Build otimizado
pnpm start            # Inicia servidor de produção

# Qualidade
pnpm lint             # Verifica código
pnpm type-check       # Verifica tipos TypeScript
```

---

## 🗄️ Banco de Dados

O admin precisa de 3 tabelas no Supabase:

### 1. customers
Armazena informações dos clientes
```sql
- id (uuid)
- name (text)
- email (text)
- phone (text)
- created_at (timestamp)
```

### 2. conversations
Armazena conversas
```sql
- id (uuid)
- customer_id (uuid → customers)
- channel (widget | whatsapp)
- status (active | resolved | archived)
- created_at (timestamp)
```

### 3. messages
Armazena mensagens
```sql
- id (uuid)
- conversation_id (uuid → conversations)
- role (user | assistant | system)
- content (text)
- created_at (timestamp)
```

---

## 🐛 Problemas Comuns

### "Supabase credentials not found"
❌ **Problema**: Variáveis de ambiente não configuradas  
✅ **Solução**: Configure o `.env.local` corretamente

### Conversas não aparecem
❌ **Problema**: Banco vazio ou RLS bloqueando  
✅ **Solução**: 
1. Verifique se há dados no Supabase
2. Desative RLS temporariamente para teste
3. Verifique as credenciais

### Erro ao instalar
❌ **Problema**: Dependências desatualizadas  
✅ **Solução**: 
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 Próximos Passos

### Aprender Mais
- 📖 [Documentação Completa](../../docs/11-admin-dashboard.md)
- 🚀 [Setup Detalhado](../../ADMIN_SETUP.md)
- 📊 [Resumo da Implementação](../../IMPLEMENTATION_SUMMARY.md)

### Adicionar Funcionalidades
- Filtros por status/canal
- Busca por cliente
- Exportar conversas
- Responder manualmente
- Notificações em tempo real

### Personalizar
- Modificar cores em `tailwind.config.js`
- Adicionar componentes em `src/components/`
- Customizar layout em `src/app/layout.tsx`

---

## 🆘 Suporte

### Documentação
- **README**: Este arquivo
- **Docs Completa**: `docs/11-admin-dashboard.md`
- **Setup**: `ADMIN_SETUP.md`

### Scripts de Teste
```bash
npx tsx scripts/test-admin-dashboard.ts
```

---

## 🎉 Pronto!

Seu Admin Dashboard está funcionando!

**Acesse agora**: http://localhost:3001

Bom trabalho! 🚀
