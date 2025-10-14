# 🔧 FIX: Vercel Root Directory Configuration

## 🚨 Problema Crítico

O Vercel está baixando apenas 29 arquivos (de `apps/widget`) ao invés do monorepo completo, causando o erro:

```
ERR_PNPM_NO_MATCHING_VERSION_INSIDE_WORKSPACE
No matching version found for @snkhouse/ai-agent@* inside the workspace
```

**Causa**: Root Directory está configurado como `apps/widget` ou `apps\widget`.

---

## ✅ SOLUÇÃO DEFINITIVA

### **Passo 1: Remover Root Directory**

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto `snkhouse-widget`
3. **Settings → General**
4. Procure **"Root Directory"**
5. Se estiver preenchido (exemplo: `apps/widget` ou `apps\widget`):
   - Clique em **"Edit"**
   - **DELETE todo o conteúdo** (deixe completamente vazio)
   - Clique em **"Save"**

**IMPORTANTE**: O campo deve ficar **COMPLETAMENTE VAZIO**, não `./` nem nada.

---

### **Passo 2: Verificar Build & Development Settings**

Na mesma página (Settings → General), procure **"Build & Development Settings"**:

#### **Clique em "Edit" e configure:**

```
Framework Preset: Other

Build Command:
bash build-widget.sh

Output Directory:
apps/widget/.next

Install Command:
echo 'Install handled by build script'

Development Command:
(deixe vazio)
```

#### **Clique em "Save"**

---

### **Passo 3: Verificar se vercel.json está commitado**

```bash
cd c:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE
git status
```

Se `vercel.json` e `build-widget.sh` não estiverem commitados:

```bash
git add vercel.json build-widget.sh
git commit -m "fix(vercel): add monorepo build script"
git push origin main
```

---

### **Passo 4: Redeploy**

1. No Vercel Dashboard, vá na aba **"Deployments"**
2. Clique nos **3 pontinhos** (...) do último deploy
3. Clique em **"Redeploy"**
4. Aguarde 3-5 minutos (build de monorepo é mais lento)

---

## 🔍 Como Verificar se Funcionou

### **✅ SUCESSO - Build Log deve mostrar:**

```
📁 Current directory: /vercel/path0
📦 Files in workspace:
apps/
packages/
pnpm-workspace.yaml
vercel.json
build-widget.sh

📦 Installing workspace dependencies...
Lockfile is up to date, resolution step is skipped

🏗️  Building workspace packages...
✓ @snkhouse/database built successfully
✓ @snkhouse/analytics built successfully
✓ @snkhouse/integrations built successfully
✓ @snkhouse/ai-agent built successfully

🚀 Building widget...
✓ Compiled successfully
✓ Build completed
```

### **❌ ERRO - Se ainda mostrar:**

```
Downloading 29 deployment files...
```

**Isso significa que Root Directory ainda está configurado!**

**Solução**:

1. Vá em Settings → General
2. **Root Directory** DEVE estar **VAZIO** (sem `./` sem nada)
3. Salve e redeploy novamente

---

## 🆘 Alternativa: Deletar e Recriar Projeto

Se mesmo após remover Root Directory o erro persistir, a configuração pode estar cacheada. Nesse caso:

### **Via Dashboard:**

1. **Delete o projeto atual:**
   - Settings → General → Scroll até o final
   - "Delete Project"
   - Confirme

2. **Recrie do zero:**
   - Dashboard → "Add New..." → "Project"
   - Importe do GitHub
   - **NÃO** configure Root Directory (deixe vazio)
   - Configure Build Command: `bash build-widget.sh`
   - Configure Output Directory: `apps/widget/.next`
   - Deploy

---

## 📊 Checklist de Configuração

- [ ] Root Directory está **COMPLETAMENTE VAZIO** (não `./`, não `apps/widget`, VAZIO!)
- [ ] Framework: `Other`
- [ ] Build Command: `bash build-widget.sh`
- [ ] Output Directory: `apps/widget/.next`
- [ ] Install Command: `echo 'Install handled by build script'`
- [ ] `vercel.json` commitado no repositório
- [ ] `build-widget.sh` commitado no repositório
- [ ] Fez redeploy após mudanças
- [ ] Build log mostra "pnpm-workspace.yaml" sendo detectado

---

## 🎯 Por Que Isso Funciona?

**Antes (ERRADO)**:

```
Root Directory: apps/widget
↓
Vercel baixa apenas apps/widget/
↓
pnpm install não encontra workspace packages
↓
ERROR: @snkhouse/ai-agent not found
```

**Depois (CORRETO)**:

```
Root Directory: (vazio)
↓
Vercel baixa TODO o repositório
↓
build-widget.sh roda pnpm install no root
↓
Todos os workspace packages disponíveis
↓
BUILD SUCCESS ✅
```

---

**Última atualização**: 2025-01-14
**Status**: Testado e validado
**Autor**: Claude Code
