# 🐛 Análise de Bugs e Problemas - Widget SNKHOUSE

**Data:** 2025-01-13
**Versão analisada:** main branch
**Analisado por:** Claude Code

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Bugs Críticos](#bugs-críticos)
3. [Bugs Graves](#bugs-graves)
4. [Bugs Menores](#bugs-menores)
5. [Problemas de Segurança](#problemas-de-segurança)
6. [Problemas de Performance](#problemas-de-performance)
7. [Problemas de UX](#problemas-de-ux)
8. [Code Smells](#code-smells)
9. [Priorização de Correções](#priorização-de-correções)

---

## 📊 RESUMO EXECUTIVO

### Status Geral do Widget

**Estado:** ✅ **FUNCIONAL** (com problemas não-bloqueantes)

**Análise TypeScript:** ✅ ZERO ERROS
**Build Status:** ✅ SUCESSO
**Runtime Status:** ✅ FUNCIONANDO

### Métricas de Problemas Identificados

| Severidade     | Quantidade | Bloqueante? |
| -------------- | ---------- | ----------- |
| 🔴 Críticos    | 0          | ❌ Não      |
| 🟠 Graves      | 4          | ❌ Não      |
| 🟡 Menores     | 8          | ❌ Não      |
| 🔵 Segurança   | 3          | ⚠️ Atenção  |
| 🟣 Performance | 3          | ❌ Não      |
| ⚪ UX          | 5          | ❌ Não      |

**Total:** 23 problemas identificados

---

## 🔴 BUGS CRÍTICOS

> **Definição:** Bugs que impedem o funcionamento básico do widget ou causam perda de dados.

### ✅ NENHUM BUG CRÍTICO ENCONTRADO

O widget está **funcionalmente estável** e não possui bugs críticos que impedam seu uso.

**Validações realizadas:**

- ✅ TypeScript compila sem erros
- ✅ Build de produção funciona
- ✅ API de chat responde corretamente
- ✅ Mensagens são salvas no banco de dados
- ✅ Histórico de conversa funciona
- ✅ Integração com IA funciona (Claude + OpenAI fallback)
- ✅ Integração com WooCommerce funciona

---

## 🟠 BUGS GRAVES

> **Definição:** Bugs que afetam funcionalidades importantes mas não impedem o uso básico.

### Bug #1: Mensagens duplicadas no histórico ao recarregar página

**Severidade:** 🟠 Grave
**Impacto:** UX negativo, confunde usuário

**Descrição:**
O widget não carrega o histórico de mensagens do banco de dados ao iniciar. Quando o usuário fecha e reabre o widget (ou recarrega a página), todas as mensagens anteriores são perdidas do frontend, mesmo estando salvas no Supabase.

**Como reproduzir:**

1. Abrir o widget
2. Enviar 3-4 mensagens
3. Recarregar a página (F5)
4. Reabrir o widget
5. **Resultado:** Chat aparece vazio (histórico perdido)
6. **Esperado:** Histórico deveria ser carregado do banco

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 31-50

**Código problemático:**

```typescript
export default function Widget() {
  const [messages, setMessages] = useState<Message[]>([]); // ❌ Sempre inicia vazio
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // ❌ Só carrega email, NÃO carrega mensagens
    const savedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("snkhouse_customer_email")
        : null;
    if (savedEmail) {
      setCustomerEmail(savedEmail);
    } else {
      setShowEmailPrompt(true);
    }
  }, []);

  // ❌ FALTA: Carregar mensagens do banco ao iniciar
}
```

**Causa raiz:**
Não há lógica para carregar mensagens anteriores do Supabase quando o componente monta.

**Sugestão de fix:**

```typescript
useEffect(() => {
  async function loadPreviousMessages() {
    if (!customerEmail || !conversationId) return;

    try {
      // Buscar mensagens do Supabase
      const response = await fetch(
        `/api/chat/history?conversationId=${conversationId}`,
      );
      const data = await response.json();

      if (data.messages) {
        setMessages(
          data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.created_at),
          })),
        );
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  }

  loadPreviousMessages();
}, [customerEmail, conversationId]);
```

**Prioridade:** 🔥 ALTA (afeta retenção de contexto)

---

### Bug #2: Email prompt bloqueia toda a página (modal fullscreen)

**Severidade:** 🟠 Grave
**Impacto:** UX muito negativo, invasivo

**Descrição:**
Quando o usuário não tem email salvo, um modal fullscreen (`fixed inset-0`) bloqueia **toda a página**, impedindo que o usuário navegue pelo site ou veja produtos enquanto decide se quer usar o chat.

**Como reproduzir:**

1. Limpar localStorage: `localStorage.clear()`
2. Acessar o widget pela primeira vez
3. **Resultado:** Modal cobre TODA a tela, impossível clicar em qualquer coisa do site
4. **Esperado:** Modal deveria ser apenas no widget flutuante, não fullscreen

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 152-177

**Código problemático:**

```typescript
if (showEmailPrompt) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* ☝️ fixed inset-0 = FULLSCREEN MODAL - muito invasivo! */}
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">¡Hola! 👋</h2>
        <p className="text-gray-600 mb-4">
          Para ayudarte con tus pedidos, necesito tu email:
        </p>
        {/* ... */}
      </div>
    </div>
  )
}
```

**Por que é grave:**

- ❌ Usuário não pode navegar no site enquanto modal está aberto
- ❌ Experiência MUITO invasiva para primeira visita
- ❌ Não há opção de "fechar" ou "depois"
- ❌ Força captura de email antes de permitir navegação

**Sugestão de fix:**

**Opção 1 - Não-invasiva (RECOMENDADA):**

```typescript
// Email prompt DENTRO do widget flutuante, não fullscreen
if (showEmailPrompt && isOpen) {
  return (
    <div className="fixed bottom-24 right-6 z-40 w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">¡Hola! 👋</h2>
        <p className="text-gray-600 mb-4">
          Para ayudarte mejor, ingresá tu email:
        </p>
        <input type="email" {...} />
        <button onClick={handleEmailSubmit}>Continuar</button>
        <button onClick={() => setShowEmailPrompt(false)}>Después</button>
      </div>
    </div>
  );
}
```

**Opção 2 - Opcional:**

```typescript
// Permitir usar chat sem email (modo anônimo)
// Só pedir email quando usuário perguntar sobre pedidos específicos
```

**Prioridade:** 🔥 ALTA (afeta conversão e UX)

---

### Bug #3: Race condition em IDs de mensagens (Date.now())

**Severidade:** 🟠 Grave
**Impacto:** Mensagens podem ter IDs duplicados, causando bugs de rendering no React

**Descrição:**
IDs de mensagens são gerados com `Date.now().toString()` e `(Date.now() + 1).toString()`. Se duas mensagens forem criadas no mesmo milissegundo (possível em respostas rápidas da IA), os IDs podem colidir.

**Como reproduzir:**

1. Enviar mensagem rápida
2. IA responder instantaneamente
3. Em alguns casos, ambas mensagens terão timestamp muito próximo
4. **Resultado:** React warning "Duplicate key" ou mensagens não renderizadas corretamente

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 77-82, 127-132, 141-146

**Código problemático:**

```typescript
// Mensagem do usuário
const userMessage: Message = {
  id: Date.now().toString(), // ❌ Pode colidir
  content: input,
  role: "user",
  timestamp: new Date(),
};

// Mensagem do assistente (logo depois)
const assistantMessage: Message = {
  id: (Date.now() + 1).toString(), // ❌ +1 não garante unicidade
  content: data.message,
  role: "assistant",
  timestamp: new Date(),
};
```

**Por que é grave:**

- React usa `key` para identificar componentes
- IDs duplicados causam bugs de rendering
- Mensagens podem desaparecer ou não atualizar

**Sugestão de fix:**

**Opção 1 - UUID (RECOMENDADA):**

```typescript
import { v4 as uuidv4 } from "uuid";

const userMessage: Message = {
  id: uuidv4(), // ✅ Garante unicidade
  content: input,
  role: "user",
  timestamp: new Date(),
};
```

**Opção 2 - Incremento:**

```typescript
// Fora do componente
let messageIdCounter = 0;

const userMessage: Message = {
  id: `msg-${Date.now()}-${++messageIdCounter}`, // ✅ Garante unicidade
  content: input,
  role: "user",
  timestamp: new Date(),
};
```

**Prioridade:** 🔶 MÉDIA-ALTA (pode causar bugs visuais)

---

### Bug #4: conversationId não é persistido entre reloads

**Severidade:** 🟠 Grave
**Impacto:** Nova conversa é criada a cada reload, perdendo contexto

**Descrição:**
O `conversationId` é armazenado apenas em memória React (`useState`). Quando o usuário recarrega a página, uma NOVA conversa é criada no banco de dados, mesmo que a anterior ainda esteja ativa.

**Como reproduzir:**

1. Iniciar conversa no widget
2. Enviar 3 mensagens
3. Recarregar página (F5)
4. Enviar outra mensagem
5. **Resultado:** Nova conversa criada no Supabase (duplicação)
6. **Esperado:** Continuar na mesma conversa

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linha 37

**Código problemático:**

```typescript
const [conversationId, setConversationId] = useState<string | null>(null);
// ❌ Não persiste em localStorage
```

**Sugestão de fix:**

```typescript
// Salvar conversationId no localStorage
const [conversationId, setConversationId] = useState<string | null>(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("snkhouse_conversation_id");
  }
  return null;
});

// Atualizar localStorage quando conversationId mudar
useEffect(() => {
  if (conversationId) {
    localStorage.setItem("snkhouse_conversation_id", conversationId);
  }
}, [conversationId]);
```

**Prioridade:** 🔥 ALTA (causa duplicação de dados e perda de contexto)

---

## 🟡 BUGS MENORES

> **Definição:** Bugs que afetam a experiência mas não impedem o uso.

### Bug #5: Validação de email muito fraca

**Severidade:** 🟡 Menor
**Impacto:** Aceita emails inválidos

**Descrição:**
A validação de email no frontend apenas verifica se contém `@`, aceitando inputs inválidos como `a@b`, `test@`, `@test.com`.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linha 61

**Código problemático:**

```typescript
const handleEmailSubmit = () => {
  if (emailInput && emailInput.includes("@")) {
    // ❌ Validação muito fraca
    localStorage.setItem("snkhouse_customer_email", emailInput);
    setCustomerEmail(emailInput);
    setShowEmailPrompt(false);
  } else {
    alert("Por favor, ingresá un email válido");
  }
};
```

**Sugestão de fix:**

```typescript
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const handleEmailSubmit = () => {
  if (emailInput && EMAIL_REGEX.test(emailInput)) {
    // ✅ Validação robusta
    localStorage.setItem("snkhouse_customer_email", emailInput.toLowerCase());
    setCustomerEmail(emailInput.toLowerCase());
    setShowEmailPrompt(false);
  } else {
    alert("Por favor, ingresá un email válido (ej: tu@email.com)");
  }
};
```

---

### Bug #6: onKeyPress deprecated (React warning)

**Severidade:** 🟡 Menor
**Impacto:** Console warning, será removido em React futuro

**Descrição:**
`onKeyPress` está deprecated no React 18+. Deveria usar `onKeyDown` ou `onKeyUp`.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linha 341

**Código problemático:**

```typescript
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}  // ⚠️ Deprecated
  placeholder="Escribe tu mensaje..."
  // ...
/>
```

**Sugestão de fix:**

```typescript
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {  // ✅ Usar onKeyDown
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }}
  placeholder="Escribe tu mensaje..."
  // ...
/>
```

---

### Bug #7: Typing indicator não desaparece em caso de erro

**Severidade:** 🟡 Menor
**Impacto:** Indicador "Escribiendo..." fica travado se houver erro de rede

**Descrição:**
No bloco `catch` de erro, `setIsTyping(false)` é chamado DEPOIS de criar a mensagem de erro. Se houver outro erro ao criar mensagem, o typing indicator fica travado.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 137-149

**Código problemático:**

```typescript
} catch (error) {
  console.error('Error:', error)
  setIsTyping(false)  // ⚠️ Se falhar aqui, typing fica travado

  const errorMessage: Message = {
    id: (Date.now() + 1).toString(),
    content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
    role: 'assistant',
    timestamp: new Date()
  }
  setMessages(prev => [...prev, errorMessage])
  setIsLoading(false)
}
```

**Sugestão de fix:**

```typescript
} catch (error) {
  console.error('Error:', error)

  // ✅ Garantir que estados sejam resetados PRIMEIRO
  setIsTyping(false)
  setIsLoading(false)

  // Depois tentar adicionar mensagem de erro
  try {
    const errorMessage: Message = {
      id: uuidv4(),
      content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, errorMessage])
  } catch (innerError) {
    console.error('Failed to add error message:', innerError);
  }
}
```

---

### Bug #8: Scroll automático pode não funcionar em todas situações

**Severidade:** 🟡 Menor
**Impacto:** Usuário pode não ver novas mensagens

**Descrição:**
`scrollIntoView({ behavior: 'smooth' })` é chamado toda vez que `messages` muda, mas se o usuário estiver scrollando manualmente para ver mensagens antigas, isso interrompe a ação.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 52-58

**Código problemático:**

```typescript
useEffect(() => {
  scrollToBottom(); // ❌ Sempre scroll, mesmo se usuário estiver lendo histórico
}, [messages]);
```

**Sugestão de fix:**

```typescript
// Só fazer scroll se usuário estiver no final do chat
useEffect(() => {
  if (messagesEndRef.current) {
    const container = messagesEndRef.current.parentElement;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }
}, [messages]);
```

---

### Bug #9: Sem loading state visual durante envio de mensagem

**Severidade:** 🟡 Menor
**Impacto:** Usuário não sabe se mensagem foi enviada

**Descrição:**
Embora haja `isLoading` state, não há indicador visual de que a mensagem do usuário está sendo enviada. Só o botão fica disabled.

**Sugestão de fix:**

```typescript
// Adicionar spinner no botão de envio
<button
  onClick={sendMessage}
  disabled={!input.trim() || isLoading}
  className="..."
>
  {isLoading ? (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )}
</button>
```

---

### Bug #10: Sem timeout para requisições da API

**Severidade:** 🟡 Menor
**Impacto:** Usuário pode ficar esperando indefinidamente

**Descrição:**
O `fetch('/api/chat')` não tem timeout. Se a API travar, o usuário fica esperando para sempre.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 95-105

**Sugestão de fix:**

```typescript
// Adicionar timeout de 30 segundos
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: historyForRequest,
      conversationId,
      customerEmail,
    }),
    signal: controller.signal, // ✅ Timeout
  });

  clearTimeout(timeoutId);

  // ... resto do código
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === "AbortError") {
    console.error("Request timeout after 30s");
  }
  // ... error handling
}
```

---

### Bug #11: Preços na demo page desatualizados

**Severidade:** 🟡 Menor
**Impacto:** Informação incorreta para usuário

**Descrição:**
A demo page mostra preços em USD (`$998,99`) mas a loja opera em ARS (60K-110K). Isso pode confundir o usuário.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 190-206

**Código problemático:**

```typescript
<div className="bg-white rounded-xl p-6 shadow-lg">
  <div className="text-3xl mb-4">👟</div>
  <h3 className="text-lg font-semibold mb-2">Nike Air Max</h3>
  <p className="text-gray-600">Desde $998,99</p>  {/* ❌ USD? */}
</div>
```

**Sugestão de fix:**

```typescript
<div className="bg-white rounded-xl p-6 shadow-lg">
  <div className="text-3xl mb-4">👟</div>
  <h3 className="text-lg font-semibold mb-2">Nike Air Max</h3>
  <p className="text-gray-600">Desde ARS $60.000</p>  {/* ✅ Preço correto */}
</div>
```

---

### Bug #12: Badge de notificações mostra count total, não não-lidas

**Severidade:** 🟡 Menor
**Impacto:** Badge fica gigante após várias mensagens

**Descrição:**
O badge vermelho mostra `messages.length` (total de mensagens), mas deveria mostrar apenas mensagens não-lidas.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 239-244

**Código problemático:**

```typescript
{messages.length > 0 && (
  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
    {messages.length}  {/* ❌ Mostra TODAS as mensagens */}
  </div>
)}
```

**Sugestão de fix:**

```typescript
// Adicionar state para mensagens não-lidas
const [unreadCount, setUnreadCount] = useState(0);

// Incrementar quando nova mensagem do assistente chegar
useEffect(() => {
  if (!isOpen && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      setUnreadCount(prev => prev + 1);
    }
  }
}, [messages, isOpen]);

// Resetar quando abrir o chat
useEffect(() => {
  if (isOpen) {
    setUnreadCount(0);
  }
}, [isOpen]);

// Badge mostra só não-lidas
{unreadCount > 0 && (
  <div className="...">
    {unreadCount}
  </div>
)}
```

---

## 🔵 PROBLEMAS DE SEGURANÇA

### Segurança #1: XSS via dangerouslySetInnerHTML

**Severidade:** 🔵 Segurança ALTA
**Risco:** XSS (Cross-Site Scripting)

**Descrição:**
O conteúdo das mensagens é renderizado com `dangerouslySetInnerHTML` após processamento de markdown básico. Se a IA retornar HTML malicioso (ou se houver bug na IA), isso pode executar JavaScript no navegador.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 24-29, 300-303

**Código problemático:**

```typescript
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // ⚠️ Sem sanitização
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

// Uso:
<div
  className="whitespace-pre-wrap text-sm leading-relaxed"
  dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
  // ☝️ PERIGOSO se message.content contém HTML
/>
```

**Cenário de ataque:**

```javascript
// Se IA retornar isso:
"**Olá** <script>alert('XSS')</script>";

// Resultado após formatMarkdown:
"<strong>Olá</strong> <script>alert('XSS')</script>";

// E será executado no navegador! ⚠️
```

**Sugestão de fix:**

**Opção 1 - Usar biblioteca de markdown segura (RECOMENDADA):**

```typescript
import DOMPurify from "dompurify";
import marked from "marked";

function formatMarkdown(text: string): string {
  const html = marked(text);
  return DOMPurify.sanitize(html); // ✅ Remove scripts
}
```

**Opção 2 - Remover dangerouslySetInnerHTML:**

```typescript
// Usar biblioteca de componentes React para markdown
import ReactMarkdown from 'react-markdown';

// No JSX:
<ReactMarkdown>{message.content}</ReactMarkdown>
```

**Prioridade:** 🔥 MUITO ALTA (segurança)

---

### Segurança #2: Email em localStorage sem encriptação

**Severidade:** 🔵 Segurança MÉDIA
**Risco:** LGPD/Privacy

**Descrição:**
O email do cliente é armazenado em `localStorage` em texto plano. Qualquer script malicioso no site pode ler esse dado.

**Arquivo afetado:**
[apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx) - linhas 44, 62, 119

**Código problemático:**

```typescript
localStorage.setItem("snkhouse_customer_email", emailInput); // ❌ Texto plano
```

**Risco LGPD:**

- Email é dado pessoal
- Armazenamento em texto plano não é seguro
- Violação de LGPD se vazado

**Sugestão de fix:**

**Opção 1 - Usar cookie httpOnly (MAIS SEGURO):**

```typescript
// Não armazenar no frontend
// Enviar email na primeira requisição e criar session cookie no backend
// Cookie httpOnly não é acessível por JavaScript
```

**Opção 2 - Encriptar:**

```typescript
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || "fallback-key";

function encryptEmail(email: string): string {
  return CryptoJS.AES.encrypt(email, SECRET_KEY).toString();
}

function decryptEmail(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Uso:
localStorage.setItem("snkhouse_customer_email", encryptEmail(emailInput));
```

**Prioridade:** 🔶 MÉDIA-ALTA (compliance LGPD)

---

### Segurança #3: Sem rate limiting no frontend

**Severidade:** 🔵 Segurança BAIXA
**Risco:** Spam/DoS

**Descrição:**
Não há limite de quantas mensagens o usuário pode enviar por minuto. Um bot malicioso pode enviar milhares de requisições.

**Sugestão de fix:**

```typescript
const [lastMessageTime, setLastMessageTime] = useState(0);
const MESSAGE_COOLDOWN = 2000; // 2 segundos entre mensagens

const sendMessage = async () => {
  const now = Date.now();
  if (now - lastMessageTime < MESSAGE_COOLDOWN) {
    alert("Por favor, aguarde um momento antes de enviar outra mensagem.");
    return;
  }

  setLastMessageTime(now);

  // ... resto do código
};
```

**Prioridade:** 🟡 BAIXA (backend já tem proteção)

---

## 🟣 PROBLEMAS DE PERFORMANCE

### Performance #1: Sem code splitting

**Severidade:** 🟣 Performance MÉDIA
**Impacto:** Bundle inicial maior que o necessário

**Descrição:**
Todo o código do widget é carregado mesmo se o usuário nunca abrir o chat.

**Sugestão de fix:**

```typescript
// Usar dynamic import para carregar chat apenas quando aberto
import dynamic from 'next/dynamic';

const ChatWindow = dynamic(() => import('./components/ChatWindow'), {
  loading: () => <div>Carregando chat...</div>,
  ssr: false
});

// Renderizar só quando isOpen = true
{isOpen && <ChatWindow {...props} />}
```

---

### Performance #2: Re-renders desnecessários

**Severidade:** 🟣 Performance BAIXA
**Impacto:** Componente re-renderiza toda vez que messages muda

**Descrição:**
Cada mensagem individual deveria ser memoizada para evitar re-render de toda a lista.

**Sugestão de fix:**

```typescript
import { memo } from 'react';

const MessageBubble = memo(({ message }: { message: Message }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {/* ... */}
    </div>
  );
});

// No JSX:
{messages.map((message) => (
  <MessageBubble key={message.id} message={message} />
))}
```

---

### Performance #3: Muitos console.logs em produção

**Severidade:** 🟣 Performance BAIXA
**Impacto:** Logs desnecessários em produção

**Descrição:**
Há 20 `console.log` no código do widget. Devem ser removidos ou condicionados a `NODE_ENV === 'development'`.

**Arquivos afetados:**

- [apps/widget/src/app/page.tsx](apps/widget/src/app/page.tsx)
- [apps/widget/src/app/api/chat/route.ts](apps/widget/src/app/api/chat/route.ts)

**Sugestão de fix:**

```typescript
// Criar logger helper
const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args); // Errors sempre logam
  },
};

// Uso:
logger.log("🔄 [Widget] Email actualizado:", data);
```

---

## ⚪ PROBLEMAS DE UX

### UX #1: Sem feedback de erro específico

**Severidade:** ⚪ UX MÉDIA

**Descrição:**
Quando há erro na API, usuário vê apenas "Lo siento, hubo un error". Não sabe se é problema de rede, server down, ou outro.

**Sugestão de fix:**

```typescript
} catch (error) {
  let errorMessage = 'Lo siento, hubo un error. Por favor intenta de nuevo.';

  if (error.name === 'AbortError') {
    errorMessage = 'La conexión tardó demasiado. Verificá tu internet e intenta de nuevo.';
  } else if (!navigator.onLine) {
    errorMessage = 'Sin conexión a internet. Verificá tu conexión.';
  }

  const msg: Message = {
    id: uuidv4(),
    content: errorMessage,
    role: 'assistant',
    timestamp: new Date()
  };
  setMessages(prev => [...prev, msg]);
}
```

---

### UX #2: Sem indicador de "última vez online"

**Descrição:**
Header diz "En línea ahora" mas não há backend real de presença. Se o serviço estiver down, ainda mostrará "online".

**Sugestão:**

- Remover "En línea ahora" OU
- Implementar health check e mostrar status real

---

### UX #3: Sem botão de "limpar conversa"

**Descrição:**
Usuário não consegue iniciar nova conversa. Tem que limpar localStorage manualmente.

**Sugestão:**

```typescript
<button onClick={() => {
  setMessages([]);
  setConversationId(null);
  localStorage.removeItem('snkhouse_conversation_id');
}}>
  Nueva conversación
</button>
```

---

### UX #4: Sem preview de links

**Descrição:**
Se IA enviar link de produto, aparece apenas texto. Deveria mostrar card visual.

**Sugestão:**
Detectar URLs e renderizar cards ricos para produtos da loja.

---

### UX #5: Sem suporte a emojis visuais

**Descrição:**
Emojis funcionam mas não há picker. Usuário precisa copiar/colar ou usar teclado do OS.

**Sugestão:**
Adicionar emoji picker (biblioteca `emoji-mart`)

---

## 💡 CODE SMELLS

### Code Smell #1: Componente Widget muito grande

**Descrição:**
O arquivo `page.tsx` tem 365 linhas. Deveria ser dividido em componentes menores.

**Sugestão de refactoring:**

```
components/
├── Widget.tsx (container principal)
├── ChatButton.tsx (botão flutuante)
├── ChatWindow.tsx (janela de chat)
├── MessageList.tsx (lista de mensagens)
├── MessageBubble.tsx (bubble individual)
├── TypingIndicator.tsx (indicador "escribiendo")
├── ChatInput.tsx (input + botão enviar)
└── EmailPrompt.tsx (modal de email)
```

---

### Code Smell #2: Lógica de API misturada com UI

**Descrição:**
Toda lógica de fetch da API está no componente React. Deveria estar em hook separado.

**Sugestão:**

```typescript
// hooks/useChat.ts
export function useChat(customerEmail: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    // ... lógica de fetch
  };

  return { messages, sendMessage, isLoading };
}

// No componente:
const { messages, sendMessage, isLoading } = useChat(customerEmail);
```

---

### Code Smell #3: Magic numbers e strings hardcoded

**Descrição:**
Valores como `500px`, `96 width`, cores, etc estão hardcoded no JSX.

**Sugestão:**

```typescript
const CHAT_CONFIG = {
  width: 384, // w-96 = 24rem = 384px
  height: 500,
  maxMessageLength: 2000,
  colors: {
    primary: "yellow-400",
    secondary: "blue-500",
  },
} as const;
```

---

## 🎯 PRIORIZAÇÃO DE CORREÇÕES

### Matriz de Impacto vs Esforço

```
Alto Impacto
│
│  Bug #2 (Modal fullscreen)        Bug #1 (Histórico perdido)
│  Seg #1 (XSS)                      Bug #4 (conversationId)
│
│
│  Bug #3 (Race condition IDs)      Code Smell #1 (Refactoring)
│  Seg #2 (Email localStorage)
│
│  Bug #7, #8, #9                    Perf #1, #2
│  UX #1, #2, #3
│
└─────────────────────────────────────────────────> Esforço
   Baixo (1-2h)     Médio (1 dia)      Alto (2-3 dias)
```

### Ordem de Correção Recomendada

#### 🔥 SPRINT 1 - CRÍTICO (1-2 dias)

**Prioridade MÁXIMA:**

1. ✅ **Segurança #1 - XSS** (2h) - Implementar sanitização de HTML
2. ✅ **Bug #2 - Modal fullscreen** (1h) - Tornar não-invasivo
3. ✅ **Bug #1 - Carregar histórico** (3h) - Implementar /api/chat/history
4. ✅ **Bug #4 - Persistir conversationId** (30min) - localStorage

**Resultado:** Widget seguro e com UX aceitável

---

#### 🟠 SPRINT 2 - IMPORTANTE (2-3 dias)

5. ✅ **Bug #3 - IDs únicos** (1h) - Usar UUID
6. ✅ **Segurança #2 - Email encriptado** (2h) - Implementar encriptação
7. ✅ **Bug #10 - Timeout** (1h) - AbortController
8. ✅ **Bug #5 - Validação email** (30min) - Regex robusto
9. ✅ **Performance #3 - Remover logs** (1h) - Logger helper

**Resultado:** Widget robusto e performático

---

#### 🟡 SPRINT 3 - MELHORIAS (3-4 dias)

10. ✅ **Code Smell #1 - Refactoring** (1 dia) - Dividir em componentes
11. ✅ **UX #1, #2, #3** (1 dia) - Melhorias de experiência
12. ✅ **Bug #6, #7, #8, #9** (2h) - Bugs menores
13. ✅ **Performance #1, #2** (3h) - Otimizações

**Resultado:** Widget polido e escalável

---

#### 🔵 BACKLOG - FUTURO

- UX #4 - Preview de links
- UX #5 - Emoji picker
- Segurança #3 - Rate limiting
- Code Smell #2, #3 - Refactorings

---

## 📊 MÉTRICAS ANTES/DEPOIS

### Antes das Correções

| Métrica           | Valor          |
| ----------------- | -------------- |
| Bugs Críticos     | 0              |
| Bugs Graves       | 4              |
| Vulnerabilidades  | 3              |
| Bundle Size       | ~250KB         |
| TypeScript Errors | 0              |
| Linhas de Código  | 886            |
| Componentes       | 1 (monolítico) |

### Depois das Correções (Estimado)

| Métrica           | Valor  | Melhoria                    |
| ----------------- | ------ | --------------------------- |
| Bugs Críticos     | 0      | ✅ Mantido                  |
| Bugs Graves       | 0      | ✅ -4                       |
| Vulnerabilidades  | 0      | ✅ -3                       |
| Bundle Size       | ~180KB | ✅ -28%                     |
| TypeScript Errors | 0      | ✅ Mantido                  |
| Linhas de Código  | ~1200  | ⚠️ +35% (melhor organizado) |
| Componentes       | 8      | ✅ +700% modularidade       |

---

## ✅ CONCLUSÃO

### Status Atual

O widget SNKHOUSE está **funcionalmente estável** e pronto para uso, mas possui:

- ✅ **Zero bugs críticos**
- ⚠️ **4 bugs graves** que afetam UX
- ⚠️ **3 vulnerabilidades de segurança** que precisam atenção
- ⚠️ **8 bugs menores** que podem ser corrigidos incrementalmente

### Recomendação

**Correções OBRIGATÓRIAS antes de produção:**

1. Segurança #1 (XSS)
2. Bug #2 (Modal invasivo)
3. Bug #1 (Histórico)
4. Bug #4 (conversationId)

**Tempo estimado:** 1-2 dias de desenvolvimento

Após essas correções, o widget estará **production-ready** com segurança e UX aceitáveis.

### Próximos Passos

1. ✅ Corrigir bugs críticos (Sprint 1)
2. ✅ Implementar testes automatizados
3. ✅ Refatorar componentes (Sprint 3)
4. ✅ Adicionar features avançadas (Backlog)

---

**Documentado por:** Claude Code
**Data:** 2025-01-13
**Versão:** 1.0
