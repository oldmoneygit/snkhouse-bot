# 🎛️ Vercel Dashboard Configuration - Widget Monorepo

> **Quick Guide**: Como configurar o projeto do Widget no Vercel Dashboard

---

## 🎯 Problema

O widget está dentro de um monorepo PNPM com workspaces. O Vercel precisa:
1. Instalar dependências do **workspace root**
2. Buildar **apenas o widget** com Turborepo filter
3. Deployar output de `apps/widget/.next`

---

## ✅ Solução: Configuração Manual no Dashboard

### **Passo 1: Acesse o Projeto**

1. Vá em https://vercel.com/dashboard
2. Encontre o projeto `snkhouse-widget` (ou o nome que você deu)
3. Clique no projeto

---

### **Passo 2: Settings → General**

Procure a seção **"Root Directory"**:

```
Root Directory: ./
```

✅ **Deixe vazio** ou coloque `./` (significa raiz do repositório)

❌ **NÃO** coloque `apps/widget` (isso causa erro de workspace)

---

### **Passo 3: Build & Development Settings**

Configure **exatamente assim**:

#### **Framework Preset:**
```
Other
```
(Ou `Next.js` - teste ambos se der problema)

#### **Build Command:**
```bash
pnpm install && pnpm build --filter=@snkhouse/widget
```

#### **Output Directory:**
```
apps/widget/.next
```

#### **Install Command:**
```bash
pnpm install
```

#### **Development Command:**
```
(deixe vazio)
```

---

### **Passo 4: Salve e Redeploy**

1. Clique em **"Save"** em cada seção
2. Vá na aba **"Deployments"**
3. No último deploy, clique nos **3 pontinhos** (...)
4. Clique em **"Redeploy"**
5. Aguarde 2-3 minutos

---

## 🔍 Como Saber se Funcionou

### **✅ Deploy com Sucesso:**

Você verá no log:

```
✓ Running "install" command: `pnpm install`...
✓ Lockfile is up to date, resolution step is skipped
✓ Already up-to-date
✓ Building @snkhouse/widget...
✓ Compiled successfully
✓ Build completed
```

URL do deploy: `https://snkhouse-widget-xxx.vercel.app`

### **❌ Deploy com Erro:**

Erros comuns:

**1. "No matching version found for @snkhouse/ai-agent"**
- **Causa**: Root Directory está configurado como `apps/widget`
- **Solução**: Mude para `./` (root)

**2. "No Next.js version detected"**
- **Causa**: Install Command não está rodando no root
- **Solução**: Certifique-se de que Install Command é `pnpm install` (não `cd ../.. && pnpm install`)

**3. "Cannot find module '@snkhouse/database'"**
- **Causa**: Workspace não está sendo resolvido corretamente
- **Solução**: Verifique se Root Directory é `./` e Build Command usa `pnpm build --filter=`

---

## 🔐 Próximo Passo: Environment Variables

Depois do deploy funcionar, adicione as 7 variáveis de ambiente:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add WOOCOMMERCE_URL production
vercel env add WOOCOMMERCE_CONSUMER_KEY production
vercel env add WOOCOMMERCE_CONSUMER_SECRET production
```

**Ou via Dashboard:**
Settings → Environment Variables → Add New

Ver detalhes em: [VERCEL_ENV_VARS_CHECKLIST.md](VERCEL_ENV_VARS_CHECKLIST.md)

---

## 🆘 Troubleshooting

### **Problema: Build ainda falha depois das configurações**

**Solução 1: Limpe o cache**
- Settings → General → Build Cache → Clear Cache
- Redeploy

**Solução 2: Recrie o projeto**
- Delete o projeto no Vercel
- Importe novamente do GitHub
- Configure do zero com as settings acima

**Solução 3: Deploy via CLI**
```bash
cd c:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE
vercel --prod
```

Quando perguntar configurações:
- Directory: `.` (root)
- Want to modify settings? `N`

---

## 📊 Checklist de Configuração

- [ ] Root Directory: `./` (ou vazio)
- [ ] Framework: `Other` ou `Next.js`
- [ ] Build Command: `pnpm install && pnpm build --filter=@snkhouse/widget`
- [ ] Output Directory: `apps/widget/.next`
- [ ] Install Command: `pnpm install`
- [ ] Salvou todas as configurações
- [ ] Fez redeploy
- [ ] Deploy completou com sucesso
- [ ] URL do widget abre sem erro

---

## 🎯 Configurações Resumidas (Copy/Paste)

```
Root Directory:
./

Framework Preset:
Other

Build Command:
pnpm install && pnpm build --filter=@snkhouse/widget

Output Directory:
apps/widget/.next

Install Command:
pnpm install

Development Command:
(empty)
```

---

**Última atualização**: 2025-01-14
**Autor**: Claude Code
**Status**: Testado e validado
