# 🚀 Como Rodar o Projeto SNKHOUSE Bot

> Guia visual passo-a-passo em português

---

## ⚡ Solução Rápida do Erro

Você recebeu este erro?
```
Error: listen EADDRINUSE: address already in use :::3002
```

### ✅ Solução em 2 Passos:

**1. Mate os processos nas portas:**
```bash
pnpm kill:ports
```

**2. Inicie o projeto:**
```bash
pnpm dev
```

**Pronto! 🎉**

---

## 📋 Passo-a-Passo Completo

### 1️⃣ Abra o Terminal no Diretório do Projeto

**Windows**: 
- PowerShell ou CMD no diretório `C:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE`

**Linux/Mac**:
- Terminal no diretório do projeto

---

### 2️⃣ Mate os Processos nas Portas (se necessário)

Execute este comando:

```bash
pnpm kill:ports
```

**Saída esperada:**
```
🔍 Procurando processos nas portas...

Verificando portas do projeto...

✅ Encontrado processo na porta 3002 (PID: 12345)
   ✓ Processo na porta 3002 encerrado!
ℹ️  Porta 3001 está livre

✅ Portas liberadas!

Agora você pode executar: pnpm dev
```

---

### 3️⃣ Inicie o Projeto

```bash
pnpm dev
```

**Isso vai iniciar:**
- 📊 Admin Dashboard na porta **3001**
- 🎨 Widget na porta **3002**  
- 🤖 AI Agent em modo watch

---

### 4️⃣ Acesse os Apps

**Admin Dashboard:**
```
http://localhost:3001
```

**Widget:**
```
http://localhost:3002
```

---

## 🎯 Comandos Úteis

### Rodar Tudo de Uma Vez
```bash
pnpm kill:ports && pnpm dev
```

### Rodar Apenas um App

```bash
# Apenas Admin Dashboard (porta 3001)
pnpm dev:admin

# Apenas Widget (porta 3002)
pnpm dev:widget
```

---

## 🐛 Resolvendo Problemas

### Erro: "Module '@snkhouse/admin' not found"

**Solução:**
```bash
pnpm install
```

---

### Erro: Porta ainda em uso

**Solução Manual (Windows):**

1. Veja qual processo está usando a porta:
```powershell
netstat -ano | findstr :3002
```

2. Mate o processo (substitua 12345 pelo PID real):
```powershell
taskkill /F /PID 12345
```

**Solução Manual (Linux/Mac):**
```bash
kill -9 $(lsof -ti:3002)
```

---

### Nada funciona?

**Solução Drástica:**

```bash
# 1. Mate TODOS os processos Node.js
# Windows:
taskkill /F /IM node.exe

# Linux/Mac:
killall node

# 2. Limpe tudo
rm -rf apps/*/node_modules apps/*/.next

# 3. Reinstale
pnpm install

# 4. Tente novamente
pnpm dev
```

---

## 📊 Estrutura das Portas

| App | Porta | URL | Comando |
|-----|-------|-----|---------|
| Admin Dashboard | 3001 | http://localhost:3001 | `pnpm dev:admin` |
| Widget | 3002 | http://localhost:3002 | `pnpm dev:widget` |

---

## 🔐 Configuração (Importante!)

### Antes de rodar, configure as variáveis de ambiente:

**Admin Dashboard:**
```bash
cd apps/admin
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase
```

**Widget:**
```bash
cd apps/widget
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

---

## 📚 Documentação Adicional

- 📖 **Guia Completo**: `DEV_GUIDE.md`
- 🔧 **Resolver Erro de Porta**: `FIX_PORT_ERROR.md`
- 📊 **Admin Dashboard**: `ADMIN_SETUP.md`
- 📝 **Documentação Técnica**: `docs/11-admin-dashboard.md`

---

## 🎉 Tudo Funcionando?

Agora você pode:

1. **Acessar o Admin Dashboard** em http://localhost:3001
   - Ver todas as conversas
   - Métricas em tempo real
   - Histórico de mensagens

2. **Acessar o Widget** em http://localhost:3002
   - Testar o chat
   - Ver o bot em ação

---

## 💡 Dicas Pro

### Sempre verificar portas antes de iniciar:
```bash
pnpm kill:ports && pnpm dev
```

### Build para produção:
```bash
pnpm build
```

### Testar estrutura do admin:
```bash
pnpm test:admin
```

---

## 🆘 Precisa de Ajuda?

1. Verifique se as credenciais estão corretas nos arquivos `.env.local`
2. Execute `pnpm kill:ports` antes de iniciar
3. Consulte `FIX_PORT_ERROR.md` para problemas de porta
4. Consulte `DEV_GUIDE.md` para guia completo

---

**Boa sorte! 🚀**

Se tudo estiver funcionando, você verá:
- ✅ Admin Dashboard rodando em http://localhost:3001
- ✅ Widget rodando em http://localhost:3002
- ✅ Sem erros no console

**Agora é só desenvolver! 💪**
