# 🚀 COMECE AQUI - SNKHOUSE Bot

> **Está com erro ao rodar o projeto? Leia este arquivo primeiro!**

---

## ⚡ Solução Rápida para o Erro `EADDRINUSE`

Se você viu este erro:
```
Error: listen EADDRINUSE: address already in use :::3002
```

### Execute estes 2 comandos:

```bash
# 1. Mate os processos nas portas
pnpm kill:ports

# 2. Inicie o projeto
pnpm dev
```

**Pronto! Problema resolvido! ✅**

---

## 📚 Documentação Disponível

### 🇧🇷 **Em Português** (Recomendado para você!)

1. **[COMO_RODAR.md](COMO_RODAR.md)** ⭐ **LEIA PRIMEIRO!**
   - Guia visual passo-a-passo
   - Como resolver o erro de porta
   - Comandos úteis

2. **[COMO_TESTAR_TUDO.md](COMO_TESTAR_TUDO.md)** 🎯 **GUIA COMPLETO DE TESTES!**
   - Como rodar e testar tudo visualmente
   - Admin Dashboard e Widget
   - Passo a passo detalhado

3. **[FIX_PORT_ERROR.md](FIX_PORT_ERROR.md)**
   - Resolver erro `EADDRINUSE`
   - Soluções para Windows/Linux/Mac
   - Comandos manuais

4. **[DEV_GUIDE.md](DEV_GUIDE.md)**
   - Guia completo de desenvolvimento
   - Todos os comandos disponíveis
   - Troubleshooting

### 🇬🇧 **Em Inglês** (Documentação Técnica)

5. **[ADMIN_SETUP.md](ADMIN_SETUP.md)**
   - Setup do Admin Dashboard
   - Configuração do Supabase

6. **[11-admin-dashboard.md](11-admin-dashboard.md)**
   - Documentação técnica completa
   - Arquitetura
   - Deploy

---

## 🎯 O Que Você Precisa Fazer

### 1️⃣ Primeira Vez Rodando?

```bash
# 1. Instale as dependências (se ainda não fez)
pnpm install

# 2. Configure as variáveis de ambiente
cd apps/admin
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase

cd ../widget
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Volte para a raiz
cd ../..

# 4. Mate processos nas portas (se necessário)
pnpm kill:ports

# 5. Inicie o projeto
pnpm dev
```

### 2️⃣ Já Configurou Tudo?

```bash
# Sempre faça isso antes de iniciar:
pnpm kill:ports && pnpm dev
```

---

## 🌐 Acessar os Apps

Depois que o projeto iniciar, acesse:

- **Admin Dashboard**: http://localhost:3001
- **Widget**: http://localhost:3002

---

## 📊 Comandos Principais

| Comando | O Que Faz |
|---------|-----------|
| `pnpm kill:ports` | Mata processos nas portas 3001 e 3002 |
| `pnpm dev` | Inicia todos os apps |
| `pnpm dev:admin` | Inicia apenas o admin (3001) |
| `pnpm dev:widget` | Inicia apenas o widget (3002) |
| `pnpm build` | Build de produção |
| `pnpm test:admin` | Valida estrutura do admin |

---

## 🆘 Ainda com Problemas?

### Erro: Porta em uso
➡️ Leia: **[FIX_PORT_ERROR.md](FIX_PORT_ERROR.md)**

### Erro: Module não encontrado
```bash
pnpm install
```

### Nada funciona?
```bash
# Limpe tudo e reinstale
rm -rf node_modules apps/*/node_modules
pnpm install
pnpm kill:ports
pnpm dev
```

---

## 🎉 Tudo Funcionando?

Se você vê isso no terminal:
```
✓ Ready on http://localhost:3001
✓ Ready on http://localhost:3002
```

**Parabéns! Agora é só codar! 🚀**

---

## 📁 Estrutura do Projeto

```
/
├── apps/
│   ├── admin/     # Dashboard (porta 3001)
│   └── widget/    # Widget do site (porta 3002)
├── packages/
│   ├── ai-agent/
│   ├── database/
│   └── integrations/
└── docs/
    ├── COMO_RODAR.md          ⭐ Leia primeiro!
    ├── COMO_TESTAR_TUDO.md    🎯 Guia de testes
    ├── FIX_PORT_ERROR.md      🔧 Resolver erros
    ├── DEV_GUIDE.md           📚 Guia completo
    └── START_HERE.md          📍 Este arquivo
```

---

## 💡 Dica Pro

**Sempre execute isso antes de iniciar:**
```bash
pnpm kill:ports && pnpm dev
```

Isso garante que as portas estejam livres e evita o erro `EADDRINUSE`!

---

## ✅ Checklist Rápido

Antes de abrir uma issue ou pedir ajuda, verifique:

- [ ] Executei `pnpm install`?
- [ ] Configurei os arquivos `.env.local`?
- [ ] Executei `pnpm kill:ports`?
- [ ] Verifiquei se as portas 3001 e 3002 estão livres?
- [ ] Li o arquivo **[COMO_RODAR.md](COMO_RODAR.md)**?

---

**Boa sorte! 🍀**

Para mais detalhes, leia: **[COMO_RODAR.md](COMO_RODAR.md)**
