# 🚀 Guia de Desenvolvimento - SNKHOUSE Bot

> Guia rápido para rodar o projeto em desenvolvimento

---

## ⚡ Início Rápido

### 1️⃣ Matar Processos nas Portas (se necessário)

Se você receber erro `EADDRINUSE`, execute:

**Windows (PowerShell):**
```powershell
.\kill-ports.ps1
```

**Linux/Mac:**
```bash
./kill-ports.sh
```

**Multiplataforma (Node):**
```bash
pnpm kill:ports
```

---

### 2️⃣ Rodar Todos os Apps

```bash
pnpm dev
```

Isso iniciará:
- 🎨 **Widget** (porta 3002): http://localhost:3002
- 📊 **Admin** (porta 3001): http://localhost:3001
- 🤖 **AI Agent** (watch mode)

---

### 3️⃣ Rodar Apps Individualmente

```bash
# Apenas o Admin Dashboard
pnpm dev:admin
# Acesse: http://localhost:3001

# Apenas o Widget
pnpm dev:widget
# Acesse: http://localhost:3002
```

---

## 🔧 Troubleshooting

### Erro: `EADDRINUSE: address already in use`

**Problema**: Já existe um processo rodando na porta.

**Solução**:
```bash
pnpm kill:ports
```

---

### Erro: `Module '@snkhouse/database' not found`

**Problema**: Dependências não instaladas.

**Solução**:
```bash
pnpm install
```

---

### Widget não carrega

**Problema**: Admin pode estar rodando na porta errada.

**Solução**:
1. Pare todos os processos (Ctrl+C)
2. Execute `pnpm kill:ports`
3. Inicie novamente `pnpm dev`

---

## 📊 Portas Usadas

| App | Porta | URL |
|-----|-------|-----|
| Admin Dashboard | 3001 | http://localhost:3001 |
| Widget | 3002 | http://localhost:3002 |

---

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
pnpm dev              # Roda todos os apps
pnpm dev:admin        # Roda apenas admin
pnpm dev:widget       # Roda apenas widget
pnpm kill:ports       # Mata processos nas portas
```

### Build
```bash
pnpm build            # Build de todos os apps
```

### Testes
```bash
pnpm test             # Roda todos os testes
pnpm test:admin       # Valida admin
pnpm test:final       # Validação completa
```

### Linting
```bash
pnpm lint             # ESLint
pnpm format           # Prettier
```

---

## 📁 Estrutura do Projeto

```
/
├── apps/
│   ├── admin/        # Dashboard admin (porta 3001)
│   └── widget/       # Widget do site (porta 3002)
├── packages/
│   ├── ai-agent/     # Agente IA
│   ├── database/     # Cliente Supabase
│   └── integrations/ # WooCommerce, etc
└── scripts/          # Scripts utilitários
```

---

## 🔐 Variáveis de Ambiente

### Admin Dashboard (`apps/admin/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Widget (`apps/widget/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
```

---

## 🐛 Debug

### Ver logs do Admin
```bash
pnpm dev:admin
```

### Ver logs do Widget
```bash
pnpm dev:widget
```

### Verificar se as portas estão livres

**Windows:**
```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

**Linux/Mac:**
```bash
lsof -i :3001
lsof -i :3002
```

---

## 📚 Documentação

- **Admin Dashboard**: `docs/11-admin-dashboard.md`
- **Setup Completo**: `ADMIN_SETUP.md`
- **Widget**: `apps/widget/README.md`

---

## 🆘 Ajuda

Se você ainda tiver problemas:

1. Pare todos os processos (Ctrl+C)
2. Execute `pnpm kill:ports`
3. Delete `node_modules` e `.next`:
   ```bash
   rm -rf apps/*/node_modules apps/*/.next
   ```
4. Reinstale:
   ```bash
   pnpm install
   ```
5. Tente novamente:
   ```bash
   pnpm dev
   ```

---

**Boa codificação! 🚀**
