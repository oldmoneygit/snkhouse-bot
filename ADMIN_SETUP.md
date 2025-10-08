# 🚀 Setup Rápido - Admin Dashboard

## ✅ O que foi criado?

### 📦 Estrutura Completa

```
apps/admin/                           ← App Next.js do Admin
├── src/app/
│   ├── page.tsx                     ← Dashboard principal
│   ├── layout.tsx                   ← Layout global
│   ├── globals.css                  ← Estilos Tailwind
│   ├── not-found.tsx                ← Página 404
│   └── conversations/
│       ├── page.tsx                 ← Lista de conversas
│       └── [id]/page.tsx            ← Detalhes da conversa
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md

packages/database/                    ← Pacote Supabase
└── src/index.ts                     ← Cliente + Types
```

---

## 🎯 Funcionalidades Implementadas

### 1. **Dashboard Principal** (`http://localhost:3001`)
- ✅ 4 cards de métricas em tempo real
- ✅ Lista das 10 conversas mais recentes
- ✅ Links para todas as seções
- ✅ Design responsivo

### 2. **Lista de Conversas** (`/conversations`)
- ✅ Todas as conversas do banco
- ✅ Informações do cliente
- ✅ Badges de canal e status
- ✅ Ordenação por atualização

### 3. **Detalhes da Conversa** (`/conversations/[id]`)
- ✅ Histórico completo de mensagens
- ✅ Informações do cliente
- ✅ Timeline visual
- ✅ Mensagens coloridas (cliente/assistente)

---

## 🚀 Como Iniciar

### 1️⃣ Configure as variáveis de ambiente

```bash
cd apps/admin
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> 💡 **Onde encontrar?** Vá em: Supabase Dashboard → Settings → API

---

### 2️⃣ Instale as dependências (se ainda não fez)

```bash
# Na raiz do projeto
pnpm install
```

---

### 3️⃣ Inicie o servidor de desenvolvimento

```bash
# Na raiz do projeto
cd apps/admin
pnpm dev
```

Ou use o comando direto:

```bash
pnpm --filter @snkhouse/admin dev
```

---

### 4️⃣ Acesse o dashboard

Abra no navegador: **http://localhost:3001**

---

## 🗄️ Estrutura do Banco (Supabase)

Certifique-se de ter essas tabelas criadas no Supabase:

### **customers**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **conversations**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  channel TEXT CHECK (channel IN ('widget', 'whatsapp')),
  status TEXT CHECK (status IN ('active', 'resolved', 'archived')),
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Preview das Telas

### Dashboard Principal
- 📊 4 cards de métricas
- 📋 Lista de conversas recentes
- 🎨 Badges coloridos
- 🔗 Navegação intuitiva

### Lista de Conversas
- 📋 Todas as conversas
- 👤 Info do cliente
- 🏷️ Status e canal
- 🖱️ Clique para detalhes

### Detalhes da Conversa
- 💬 Chat completo
- ⏰ Timestamps
- 🎨 Mensagens coloridas
- 📝 Info completa

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Inicia dev server (porta 3001)

# Build
pnpm build            # Build para produção
pnpm start            # Inicia servidor de produção

# Linting
pnpm lint             # Executa ESLint

# Teste de estrutura
npm run test:admin    # Verifica se tudo foi criado
```

---

## 🐛 Troubleshooting

### Problema: "Supabase credentials not found"

**Solução**: Configure o `.env.local` corretamente

### Problema: Conversas não aparecem

**Soluções**:
1. Verifique se o Supabase está conectado
2. Teste as tabelas no Supabase SQL Editor
3. Verifique RLS (Row Level Security) - desative temporariamente para teste

### Problema: Build falha

**Soluções**:
1. Execute `pnpm install` novamente
2. Verifique se o pacote `@snkhouse/database` está instalado
3. Limpe cache: `rm -rf .next node_modules && pnpm install`

---

## 📚 Próximos Passos

### Fase 2 - Melhorias
- [ ] Adicionar filtros (canal, status, data)
- [ ] Busca por cliente (nome/email)
- [ ] Exportar conversas (CSV/JSON)
- [ ] Resposta manual via admin
- [ ] Notificações em tempo real

### Fase 3 - Analytics
- [ ] Gráficos de conversas por período
- [ ] Métricas de performance da IA
- [ ] Dashboard analítico completo
- [ ] Relatórios automatizados

---

## 📖 Documentação Completa

Veja: **`docs/11-admin-dashboard.md`**

---

## 🎉 Pronto!

Seu Admin Dashboard está funcionando!

**Acesse**: http://localhost:3001

Para dúvidas, consulte a documentação ou entre em contato com a equipe.
