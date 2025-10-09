# 🚀 Como Rodar e Testar o Projeto Completo

> **Guia completo para testar visualmente o Admin Dashboard e Widget**

---

## ⚡ INÍCIO RÁPIDO (2 comandos)

### 1️⃣ Liberar as Portas
```bash
pnpm kill:ports
```

### 2️⃣ Iniciar Todos os Apps
```bash
pnpm dev
```

**Pronto! Agora acesse:**
- 📊 **Admin Dashboard**: http://localhost:3001
- 🎨 **Widget Chat**: http://localhost:3002

---

## 📋 PASSO A PASSO DETALHADO

### 1. Abrir Terminal na Raiz do Projeto

**Windows PowerShell/CMD:**
```
C:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE
```

---

### 2. Verificar se as Dependências Estão Instaladas

```bash
# Se ainda não instalou, execute:
pnpm install
```

---

### 3. Matar Processos nas Portas (Importante!)

```bash
pnpm kill:ports
```

**Você verá:**
```
🔍 Procurando processos nas portas...
✅ Porta 3001 liberada!
✅ Porta 3002 liberada!
```

---

### 4. Iniciar o Projeto

```bash
pnpm dev
```

**Você verá algo como:**
```
@snkhouse/admin:dev: > next dev --port 3001
@snkhouse/widget:dev: > next dev --port 3002

@snkhouse/admin:dev: ✓ Ready on http://localhost:3001
@snkhouse/widget:dev: ✓ Ready on http://localhost:3002
```

---

## 🌐 ACESSAR OS APPS

### 📊 Admin Dashboard (Porta 3001)

**URL:** http://localhost:3001

**O que você vai ver:**

1. **Dashboard Principal (`/`)**
   - 4 cards de métricas:
     - Total Conversas
     - Conversas Ativas
     - Total Mensagens
     - Taxa de Resolução
   - Lista de conversas recentes (últimas 10)

2. **Lista de Conversas (`/conversations`)**
   - Todas as conversas do banco
   - Badges coloridos:
     - 🟢 Active (verde)
     - ⚪ Resolved (cinza)
     - 🔴 Archived (vermelho)
   - Click em "Ver detalhes" para abrir conversa

3. **Detalhes da Conversa (`/conversations/[id]`)**
   - Info completa do cliente
   - Histórico de mensagens (timeline)
   - Mensagens do usuário (fundo amarelo #FFED00)
   - Mensagens do assistente (fundo cinza claro)

---

### 🎨 Widget Chat (Porta 3002)

**URL:** http://localhost:3002

**O que você vai ver:**

1. **Botão Flutuante (canto inferior direito)**
   - Fundo amarelo (#FFED00)
   - Logo SNKHOUSE

2. **Modal de Chat**
   - Header preto com logo
   - Área de mensagens
   - Input de texto
   - Botão enviar (amarelo)

3. **Testar o Chat:**
   - Digite: "Hola, ¿tienen Nike Air Max?"
   - A IA vai:
     - Buscar produtos reais do WooCommerce
     - Responder em espanhol argentino
     - Mostrar preços, links, stock

---

## 🧪 TESTES PARA FAZER

### ✅ Admin Dashboard

**Teste 1: Dashboard Principal**
- [ ] Acesse http://localhost:3001
- [ ] Veja se os 4 cards aparecem
- [ ] Veja se a lista de conversas recentes carrega
- [ ] Click em "Ver todas" para ir para `/conversations`

**Teste 2: Lista de Conversas**
- [ ] Acesse http://localhost:3001/conversations
- [ ] Veja todas as conversas
- [ ] Veja os badges coloridos (Active, Resolved)
- [ ] Click em "Ver detalhes" de alguma conversa

**Teste 3: Detalhes da Conversa**
- [ ] Veja as informações do cliente (nome, email, telefone)
- [ ] Veja o histórico de mensagens
- [ ] Veja as cores corretas:
  - Usuário: fundo amarelo
  - Assistente: fundo cinza

---

### ✅ Widget Chat

**Teste 1: Interface**
- [ ] Acesse http://localhost:3002
- [ ] Veja o botão flutuante amarelo (canto inferior direito)
- [ ] Click no botão para abrir o modal
- [ ] Veja o header preto com logo
- [ ] Veja o input de texto e botão enviar

**Teste 2: Chat com IA (Produtos Nike)**
- [ ] Digite: `Hola, ¿tienen Nike Air Max?`
- [ ] Click em "Enviar" ou Enter
- [ ] Aguarde 2-5 segundos
- [ ] Veja a resposta da IA com:
  - Produtos reais da loja
  - Preços em ARS ($998,99)
  - Links para produtos
  - Status de stock (✅ En stock)
  - Badge 🔥 EN OFERTA se tiver oferta

**Teste 3: Chat com IA (Ofertas)**
- [ ] Digite: `¿Qué productos tienen en oferta?`
- [ ] Veja a IA listar produtos em promoção
- [ ] Veja os descontos (ex: "41% OFF")
- [ ] Veja preços antes/depois

**Teste 4: Chat com IA (Categorias)**
- [ ] Digite: `¿Qué categorías tienen?`
- [ ] Veja a IA listar as 28 categorias
- [ ] Veja quantidade de produtos por categoria

---

## 🔍 VERIFICAR LOGS (Console do Navegador)

### Admin Dashboard

Abra o DevTools (F12) e veja:
```
✅ Supabase conectado
✅ Query de conversas executada
✅ Dados carregados
```

### Widget Chat

Abra o DevTools (F12) e veja:
```
🤖 [OpenAI] Iniciando geração...
🔧 [Tool] search_products executada
✅ [WooCommerce] 3 produtos encontrados
✅ [OpenAI] Resposta gerada
```

---

## 🎨 DESIGN ESPERADO

### Admin Dashboard

**Cores:**
- Header: Branco com logo preto
- Cards: Brancos com bordas cinza
- Badges Active: Verde claro
- Badges Resolved: Cinza
- Mensagens Usuário: Amarelo (#FFED00)
- Mensagens Assistente: Cinza claro

### Widget Chat

**Cores:**
- Botão: Amarelo (#FFED00)
- Header: Preto (#000000)
- Mensagens Usuário: Amarelo (#FFED00) + texto preto
- Mensagens Assistente: Branco/cinza claro + texto preto
- Botão Enviar: Amarelo (#FFED00) + texto preto

---

## 🚨 PROBLEMAS COMUNS

### Erro: `EADDRINUSE`
**Solução:**
```bash
pnpm kill:ports
pnpm dev
```

### Erro: "Module not found"
**Solução:**
```bash
pnpm install
pnpm dev
```

### Admin não carrega dados
**Motivo:** Banco de dados Supabase pode estar vazio
**Solução:** Normal se não houver conversas ainda. Use o widget para criar conversas.

### Widget não responde
**Verificar:**
1. Console do navegador (F12) tem erros?
2. API keys estão no `.env.local`?
3. Terminal mostra logs da IA?

---

## 💡 DICAS PRO

### Rodar Apps Separadamente

**Apenas Admin:**
```bash
pnpm dev:admin
# Acesse: http://localhost:3001
```

**Apenas Widget:**
```bash
pnpm dev:widget
# Acesse: http://localhost:3002
```

### Ver Logs Detalhados

O terminal mostra TODOS os logs:
- 🤖 Logs da IA
- 🔧 Logs das tools
- 🛒 Logs do WooCommerce
- 💾 Logs do cache

### Hot Reload

Qualquer alteração de código recarrega automaticamente! Não precisa reiniciar.

---

## 🎯 CHECKLIST FINAL

Antes de dar como "testado", verifique:

### ✅ Admin Dashboard
- [ ] Dashboard principal carrega
- [ ] Cards de métricas aparecem
- [ ] Lista de conversas funciona
- [ ] Detalhes da conversa abrem
- [ ] Design está bonito (cores corretas)
- [ ] Responsivo (teste no mobile)

### ✅ Widget Chat
- [ ] Botão flutuante aparece
- [ ] Modal abre/fecha
- [ ] Chat envia mensagens
- [ ] IA responde (2-5s)
- [ ] Produtos reais aparecem
- [ ] Links funcionam
- [ ] Design está bonito (cores corretas)

### ✅ Integração IA
- [ ] OpenAI conecta
- [ ] Tools WooCommerce funcionam
- [ ] Cache funciona (logs mostram Hit/Miss)
- [ ] Respostas em espanhol argentino
- [ ] Produtos reais da snkhouse.com

---

## 🎉 TUDO FUNCIONANDO?

Se você conseguiu:
1. ✅ Acessar http://localhost:3001 (admin)
2. ✅ Acessar http://localhost:3002 (widget)
3. ✅ Ver o admin dashboard com design bonito
4. ✅ Conversar com a IA e receber produtos reais

**PARABÉNS! O PROJETO ESTÁ 100% FUNCIONAL! 🚀**

---

## 📊 PRÓXIMOS PASSOS

Após testar tudo:

1. **Popular o Banco** (se quiser ver dados no admin):
   - Use o widget para criar conversas
   - Envie várias mensagens
   - Acesse o admin para ver os dados

2. **Customizar**:
   - Ajustar cores no `tailwind.config.js`
   - Adicionar mais tools no `ai-agent`
   - Melhorar prompts em `packages/ai-agent/src/prompts.ts`

3. **Deploy**:
   - Vercel para admin e widget
   - Supabase já está em produção
   - WooCommerce já está em produção

---

## 🆘 PRECISA DE AJUDA?

**Comando mágico que resolve 90% dos problemas:**
```bash
pnpm kill:ports && pnpm install && pnpm dev
```

**Se ainda assim não funcionar:**
1. Verifique se Node.js está atualizado (v18+)
2. Verifique se pnpm está instalado
3. Verifique se as portas 3001 e 3002 não estão bloqueadas
4. Verifique o arquivo `.env.local` na raiz

---

**Boa sorte! 🍀**

*Última atualização: 2025-10-08*
