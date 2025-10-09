# 🔧 Como Resolver o Erro de Porta Ocupada

> **Erro**: `EADDRINUSE: address already in use :::3002`

---

## 🎯 Solução Rápida (Recomendada)

### **Opção 1: Script Automático (Multiplataforma)** ⭐

```bash
pnpm kill:ports
```

Isso vai matar todos os processos nas portas 3001 e 3002 automaticamente!

---

## 🪟 Solução Manual - Windows

### Método 1: PowerShell Script
```powershell
.\kill-ports.ps1
```

### Método 2: Comandos Manuais
```powershell
# Ver o que está rodando na porta 3002
netstat -ano | findstr :3002

# Exemplo de saída:
# TCP    0.0.0.0:3002    0.0.0.0:0    LISTENING    12345

# Matar o processo (substitua 12345 pelo PID real)
taskkill /F /PID 12345

# Fazer o mesmo para porta 3001 se necessário
netstat -ano | findstr :3001
taskkill /F /PID <PID>
```

---

## 🐧 Solução Manual - Linux/Mac

### Método 1: Shell Script
```bash
./kill-ports.sh
```

### Método 2: Comandos Manuais
```bash
# Ver o que está rodando na porta 3002
lsof -i :3002

# Matar o processo
kill -9 $(lsof -ti:3002)

# Fazer o mesmo para porta 3001 se necessário
kill -9 $(lsof -ti:3001)
```

---

## 🚀 Depois de Liberar as Portas

Execute novamente:

```bash
pnpm dev
```

Ou execute apenas o app que você precisa:

```bash
# Apenas Admin Dashboard (porta 3001)
pnpm dev:admin

# Apenas Widget (porta 3002)
pnpm dev:widget
```

---

## 🔍 Verificar se as Portas Estão Livres

### Windows
```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

Se não retornar nada, as portas estão livres! ✅

### Linux/Mac
```bash
lsof -i :3001
lsof -i :3002
```

Se retornar erro ou nada, as portas estão livres! ✅

---

## 📊 Portas Usadas no Projeto

| App | Porta | Comando |
|-----|-------|---------|
| Admin Dashboard | 3001 | `pnpm dev:admin` |
| Widget | 3002 | `pnpm dev:widget` |

---

## 🐛 Outros Problemas Comuns

### "Module '@snkhouse/admin' not found"

**Solução**:
```bash
pnpm install
```

### Build falha

**Solução**:
```bash
# Limpar node_modules e .next
rm -rf apps/*/node_modules apps/*/.next

# Reinstalar
pnpm install

# Tentar novamente
pnpm dev
```

### Nenhum dos métodos funcionou

**Solução Drástica**:
```bash
# 1. Pare TODOS os processos Node.js

# Windows:
taskkill /F /IM node.exe

# Linux/Mac:
killall node

# 2. Reinstale tudo
pnpm install

# 3. Tente novamente
pnpm dev
```

---

## 💡 Dica Pro

Sempre execute `pnpm kill:ports` antes de iniciar o projeto para garantir que as portas estejam livres:

```bash
pnpm kill:ports && pnpm dev
```

---

## 📚 Mais Ajuda

- **Guia Completo**: `DEV_GUIDE.md`
- **Admin Setup**: `ADMIN_SETUP.md`
- **Documentação**: `docs/11-admin-dashboard.md`

---

**Problema resolvido? Agora é só codar! 🚀**
