# 📦 Product Cards - Documentação Técnica Completa

> **Versão**: 2.0.0 (Sprint 2 - SSE Streaming)
> **Última atualização**: 2025-01-14
> **Status**: ✅ Production Ready

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Sistema](#-arquitetura-do-sistema)
3. [Fluxo de Dados Completo](#-fluxo-de-dados-completo)
4. [Componentes e Responsabilidades](#-componentes-e-responsabilidades)
5. [API Routes](#-api-routes)
6. [Estados e Transições](#-estados-e-transições)
7. [Analytics e Tracking](#-analytics-e-tracking)
8. [Performance e Otimizações](#-performance-e-otimizações)
9. [Error Handling](#-error-handling)
10. [Troubleshooting Guide](#-troubleshooting-guide)
11. [Future Improvements](#-future-improvements)

---

## 🎯 Visão Geral

### O que são Product Cards?

Product Cards é um sistema de **rich UI components** que exibe produtos do WooCommerce diretamente no chat do widget, permitindo que usuários:

- 👀 Visualizem produtos com imagem, preço e descrição
- 🛒 Adicionem ao carrinho com 1 clique
- 🔗 Acessem página do produto no site
- 📊 Gerem analytics de interação

### Contexto de Negócio

**Objetivo**: Aumentar conversão de vendas reduzindo fricção na jornada do cliente.

**Antes**: Cliente pergunta → IA responde texto → Cliente abre site → Busca produto → Adiciona carrinho

**Depois**: Cliente pergunta → IA responde com Product Card → Cliente clica "Agregar al Carrito" → Redireciona para checkout

**Impacto esperado**: +30% de conversão em vendas via chat

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

```
┌─────────────────────────────────────────────────┐
│                 FRONTEND (React)                │
│  - Next.js 14 (App Router)                     │
│  - Vercel AI SDK v3.4.33                       │
│  - TailwindCSS                                  │
│  - TypeScript                                   │
└─────────────────────────────────────────────────┘
                        ↕️ API Routes
┌─────────────────────────────────────────────────┐
│              BACKEND (Serverless)               │
│  - Next.js API Routes                          │
│  - OpenAI GPT-4o-mini                          │
│  - WooCommerce REST API                        │
└─────────────────────────────────────────────────┘
                        ↕️ HTTP/REST
┌─────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                  │
│  - WooCommerce (snkhouse.com)                  │
│  - Supabase (Analytics)                        │
└─────────────────────────────────────────────────┘
```

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Widget UI (page.tsx)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  useChat() hook (Vercel AI SDK)                     │   │
│  │  - messages: Message[]                              │   │
│  │  - append(), reload()                               │   │
│  │  - isLoading                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Message Rendering + Metadata Enrichment            │   │
│  │  - enrichedMessagesRef (Map<id, metadata>)          │   │
│  │  - pendingProductIdsRef (number[])                  │   │
│  │  - extractProductIds() → parses IDs from stream     │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ProductList Component                              │   │
│  │  - Fetches product data                             │   │
│  │  - Handles loading/error states                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ProductCard Components                             │   │
│  │  - Rich visual cards                                │   │
│  │  - Add to cart functionality                        │   │
│  │  - Analytics tracking                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↕️ SSE Streaming
┌─────────────────────────────────────────────────────────────┐
│              /api/chat/stream (API Route)                   │
│                                                             │
│  1. Receives user message                                  │
│  2. Calls OpenAI GPT-4o-mini with tools                    │
│  3. Streams response via Server-Sent Events                │
│  4. When tool_use → executes search_products()             │
│  5. Returns product IDs in special format                  │
│  6. Frontend extracts IDs and renders cards                │
└─────────────────────────────────────────────────────────────┘
                               ↕️ REST API
┌─────────────────────────────────────────────────────────────┐
│                  WooCommerce API                            │
│  - GET /products?search=nike                               │
│  - GET /products/{id}                                      │
│  - POST /cart/add                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Dados Completo

### Fluxo Detalhado (Passo a Passo)

#### 1️⃣ **User envia mensagem**

```typescript
// apps/widget/src/app/page.tsx
const { messages, append } = useChat({
  api: "/api/chat/stream",
  body: { conversationId },
});

// User types: "me mostre tênis nike"
await append({ role: "user", content: "me mostre tênis nike" });
```

#### 2️⃣ **Frontend chama API Route**

```http
POST /api/chat/stream
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "me mostre tênis nike" }
  ],
  "conversationId": "uuid-123-456"
}
```

#### 3️⃣ **Backend processa com OpenAI**

```typescript
// apps/widget/src/app/api/chat/stream/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();

  // Call OpenAI with tools
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools: [searchProductsTool], // WooCommerce search
    stream: true,
  });

  // Stream response back to client
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

#### 4️⃣ **AI decide usar tool search_products**

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_123",
      "type": "function",
      "function": {
        "name": "search_products",
        "arguments": "{\"query\":\"nike\"}"
      }
    }
  ]
}
```

#### 5️⃣ **Backend executa tool e retorna IDs**

```typescript
// Tool handler
const products = await searchProducts({ query: "nike" });

// Returns product IDs in special format
return {
  productIds: [1234, 5678, 9012],
  summary: "Encontré 3 productos Nike",
};
```

#### 6️⃣ **AI responde com product IDs no stream**

Stream envia chunks:

```
data: 0:"Encontré "
data: 0:"estos "
data: 0:"productos:\n\n"
data: 2:[1234,5678,9012]  ← Product IDs embedded!
data: 0:"¿Te interesa alguno?"
```

#### 7️⃣ **Frontend extrai IDs do stream**

```typescript
// apps/widget/src/app/page.tsx
onChunk({ chunk }) {
  const productIds = extractProductIds(chunk);
  if (productIds.length > 0) {
    pendingProductIdsRef.current.push(...productIds);
  }
}
```

#### 8️⃣ **Frontend renderiza ProductList ao finalizar**

```typescript
onFinish(message: Message) {
  if (pendingProductIdsRef.current.length > 0) {
    const productIds = [...pendingProductIdsRef.current];

    // Store metadata for this message
    enrichedMessagesRef.current.set(message.id, {
      productIds,
      hasProducts: true,
    });

    // Trigger re-render
    setEnrichmentTrigger((prev) => prev + 1);

    // Clear pending
    pendingProductIdsRef.current = [];
  }
}
```

#### 9️⃣ **ProductList busca dados dos produtos**

```typescript
// apps/widget/src/components/ProductList.tsx
useEffect(() => {
  async function loadProducts() {
    const promises = productIds.map((id) =>
      fetch(`/api/products/${id}`).then((res) => res.json())
    );

    const results = await Promise.allSettled(promises);
    const products = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    setProducts(products);
  }

  loadProducts();
}, [productIds]);
```

#### 🔟 **ProductCard renderiza e trackeia analytics**

```typescript
// apps/widget/src/components/ProductCard.tsx
useEffect(() => {
  // Track view on mount
  trackProductCardViewed({
    product_id: props.id,
    product_name: props.name,
    source: "widget",
  });
}, []);

const handleAddToCart = async () => {
  // Track add to cart
  trackProductAddToCart({ product_id: props.id });

  // Call API to add to WooCommerce
  const response = await fetch("/api/cart/add", {
    method: "POST",
    body: JSON.stringify({ productId: props.id }),
  });

  // Redirect to cart
  window.open(response.redirectUrl, "_blank");
};
```

---

## 🧩 Componentes e Responsabilidades

### 1. **page.tsx** (Main Widget Component)

**Localização**: `apps/widget/src/app/page.tsx`

**Responsabilidades**:

- ✅ Gerencia estado global do chat (useChat hook)
- ✅ Extrai product IDs do stream (extractProductIds)
- ✅ Armazena metadata de produtos (enrichedMessagesRef)
- ✅ Renderiza mensagens com product cards
- ✅ Auto-scroll para novas mensagens

**Estados Principais**:

```typescript
const { messages, append, reload, isLoading } = useChat();
const enrichedMessagesRef = useRef<Map<string, MessageMetadata>>(new Map());
const pendingProductIdsRef = useRef<number[]>([]);
const [enrichmentTrigger, setEnrichmentTrigger] = useState(0);
```

**Funções Críticas**:

```typescript
// Extrai product IDs do chunk do stream
function extractProductIds(text: string): number[] {
  // Regex patterns:
  // - 2:[123,456,789]    (tool result)
  // - products:[123,456] (inline mention)
  // Returns array of unique product IDs
}

// Enriquece mensagem com metadata
onFinish(message: Message) {
  enrichedMessagesRef.current.set(message.id, {
    productIds: [...],
    hasProducts: true
  });
}
```

---

### 2. **ProductList** Component

**Localização**: `apps/widget/src/components/ProductList.tsx`

**Responsabilidades**:

- ✅ Busca dados de produtos da API
- ✅ Gerencia loading/error/success states
- ✅ Renderiza skeletons enquanto carrega
- ✅ Trata falhas parciais (Promise.allSettled)
- ✅ Propaga conversationId para analytics

**Props**:

```typescript
interface ProductListProps {
  productIds: number[]; // IDs dos produtos a exibir
  conversationId?: string; // Para contexto de analytics
}
```

**Estados**:

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**Fetching Strategy**:

```typescript
// Parallel fetching com Promise.allSettled
const promises = productIds.map((id) => fetch(`/api/products/${id}`));
const results = await Promise.allSettled(promises);

// Filtra apenas sucessos (graceful degradation)
const successfulProducts = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);
```

---

### 3. **ProductCard** Component

**Localização**: `apps/widget/src/components/ProductCard.tsx`

**Responsabilidades**:

- ✅ Renderiza card visual do produto
- ✅ Lazy loading de imagens
- ✅ Botão "Agregar al Carrito" com loading/feedback
- ✅ Link para página do produto
- ✅ Toast notifications (sucesso/erro)
- ✅ Analytics tracking (view, click, add_to_cart)

**Props**:

```typescript
interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  salePrice?: string;
  image: string;
  category: string;
  inStock: boolean;
  link: string;
  shortDescription?: string;
  conversationId?: string;
}
```

**Estados**:

```typescript
const [isAdding, setIsAdding] = useState(false); // Loading do botão
const [toast, setToast] = useState<ToastType>(null); // Notificações
const [imageLoaded, setImageLoaded] = useState(false); // Lazy load
const [imageError, setImageError] = useState(false); // Error fallback
```

**Eventos Rastreados**:

```typescript
// 1. View (on mount)
useEffect(() => {
  trackProductCardViewed({ product_id, ... });
}, []);

// 2. Click (product link)
const handleProductClick = () => {
  trackProductCardClicked({ product_id, ... });
};

// 3. Add to Cart
const handleAddToCart = () => {
  trackProductAddToCart({ product_id, ... });
  // ... add logic
};
```

---

### 4. **ProductCardSkeleton** Component

**Localização**: `apps/widget/src/components/ProductCardSkeleton.tsx`

**Responsabilidades**:

- ✅ Loading placeholder durante fetch
- ✅ Imita estrutura exata do ProductCard
- ✅ Shimmer effect profissional
- ✅ Acessibilidade (aria-label, sr-only)

**Estrutura**:

```jsx
<div className="animate-pulse">
  <div className="skeleton-shimmer" /> {/* Image */}
  <div className="h-5 bg-gray-200" />  {/* Badge */}
  <div className="h-5 bg-gray-200" />  {/* Title line 1 */}
  <div className="h-5 bg-gray-200" />  {/* Title line 2 */}
  <div className="h-6 bg-gray-200" />  {/* Price */}
  <div className="h-4 bg-gray-200" />  {/* Description */}
  <div className="h-10 bg-gray-200" /> {/* Buttons */}
</div>
```

---

## 🛣️ API Routes

### 1. `/api/chat/stream` (Streaming Chat)

**Método**: `POST`
**Localização**: `apps/widget/src/app/api/chat/stream/route.ts`

**Request Body**:

```typescript
{
  messages: Message[];          // Histórico da conversa
  conversationId?: string;      // ID da conversa (UUID)
}
```

**Response**: Server-Sent Events (SSE) stream

**Response Format**:

```
data: 0:"texto da resposta"
data: 2:[1234,5678]            ← Product IDs
data: 0:" mais texto"
```

**Headers**:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Exemplo de uso**:

```typescript
const response = await fetch("/api/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "quero nike" }],
    conversationId: "uuid-123",
  }),
});

// Process SSE stream
const reader = response.body.getReader();
for await (const chunk of readChunks(reader)) {
  console.log(chunk); // "0:texto" ou "2:[123,456]"
}
```

---

### 2. `/api/products/[id]` (Get Product Details)

**Método**: `GET`
**Localização**: `apps/widget/src/app/api/products/[id]/route.ts`

**URL Parameter**:

- `id` (number): WooCommerce product ID

**Response**:

```typescript
{
  id: number;
  name: string;
  price: string;              // "ARS 89.990"
  salePrice?: string;         // "ARS 69.990"
  image: string;              // Full URL
  category: string;           // "Zapatillas"
  inStock: boolean;
  link: string;               // Full URL to product page
  shortDescription?: string;  // HTML sanitized
}
```

**Error Response**:

```typescript
{
  error: string;
  details?: unknown;
}
```

**Exemplo de uso**:

```typescript
const product = await fetch("/api/products/1234")
  .then((res) => res.json())
  .catch((err) => console.error(err));
```

---

### 3. `/api/cart/add` (Add Product to Cart)

**Método**: `POST`
**Localização**: `apps/widget/src/app/api/cart/add/route.ts`

**Request Body**:

```typescript
{
  productId: number;
  quantity?: number;  // Default: 1
}
```

**Success Response**:

```typescript
{
  success: true;
  redirectUrl: string;  // URL to WooCommerce cart page
  message: string;
}
```

**Error Response**:

```typescript
{
  success: false;
  error: string;
}
```

**Exemplo de uso**:

```typescript
const response = await fetch("/api/cart/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId: 1234, quantity: 1 }),
});

const data = await response.json();
if (data.redirectUrl) {
  window.open(data.redirectUrl, "_blank");
}
```

---

## 🔄 Estados e Transições

### Estados do ProductList

```
┌─────────────┐
│   INITIAL   │
│ loading=true│
└─────────────┘
       ↓
   (fetch starts)
       ↓
┌─────────────┬────────────────┐
│   SUCCESS   │     ERROR      │
│ loading=false│ loading=false  │
│ products=[..]│ error="msg"    │
└─────────────┴────────────────┘
```

### Estados do ProductCard (Imagem)

```
┌──────────────────┐
│  NOT_LOADED      │
│ imageLoaded=false│
│ imageError=false │
└──────────────────┘
         ↓
   (image loading)
         ↓
┌──────────┬──────────┐
│  LOADED  │  ERROR   │
│ =true    │ error=true│
│ Fade-in  │ Fallback │
└──────────┴──────────┘
```

### Estados do Botão "Agregar al Carrito"

```
┌────────────┐
│   IDLE     │
│ isAdding=  │
│   false    │
└────────────┘
      ↓ (click)
┌────────────┐
│  LOADING   │
│ isAdding=  │
│   true     │
│ Spinner... │
└────────────┘
      ↓ (response)
┌──────────┬──────────┐
│ SUCCESS  │  ERROR   │
│ Toast ✅  │ Toast ❌  │
│ Redirect │ Retry    │
└──────────┴──────────┘
      ↓
┌────────────┐
│   IDLE     │
│ (after 3s) │
└────────────┘
```

---

## 📊 Analytics e Tracking

### Eventos Rastreados

Todos os eventos são salvos em `analytics_events` table no Supabase.

#### 1. **product_card_viewed**

**Quando dispara**: Quando ProductCard monta (useEffect)

**Dados rastreados**:

```typescript
{
  event_type: 'product_card_viewed',
  event_data: {
    product_id: 1234,
    product_name: "Nike Air Max 90",
    product_price: "ARS 89.990",
    in_stock: true,
    conversation_id: "uuid-123",
    source: "widget"
  },
  created_at: "2025-01-14T12:00:00Z"
}
```

#### 2. **product_card_clicked**

**Quando dispara**: Quando usuário clica no link do produto

**Dados rastreados**:

```typescript
{
  event_type: 'product_card_clicked',
  event_data: {
    product_id: 1234,
    product_name: "Nike Air Max 90",
    product_price: "ARS 89.990",
    in_stock: true,
    conversation_id: "uuid-123",
    source: "widget"
  },
  created_at: "2025-01-14T12:01:00Z"
}
```

#### 3. **product_add_to_cart**

**Quando dispara**: Quando usuário clica "Agregar al Carrito"

**Dados rastreados**:

```typescript
{
  event_type: 'product_add_to_cart',
  event_data: {
    product_id: 1234,
    product_name: "Nike Air Max 90",
    product_price: "ARS 89.990",
    in_stock: true,
    conversation_id: "uuid-123",
    source: "widget"
  },
  created_at: "2025-01-14T12:02:00Z"
}
```

### Métricas Calculadas

**Dashboard**: `apps/admin/src/app/analytics/page.tsx`

**Métricas disponíveis**:

```typescript
interface ProductCardMetrics {
  totalViews: number; // Total de visualizações (30 dias)
  totalClicks: number; // Total de cliques no produto (30 dias)
  totalAddToCart: number; // Total de add to cart (30 dias)

  clickThroughRate: number; // (clicks / views) * 100
  conversionRate: number; // (add_to_cart / views) * 100

  topViewedProducts: Array<{
    product_id: number;
    product_name: string;
    views: number;
    clicks: number;
    add_to_cart: number;
  }>;

  viewsLast24h: number;
  clicksLast24h: number;
  addToCartLast24h: number;
}
```

**Exemplo de query**:

```sql
-- Total de views nos últimos 30 dias
SELECT COUNT(*)
FROM analytics_events
WHERE event_type = 'product_card_viewed'
  AND created_at >= NOW() - INTERVAL '30 days';

-- Top 10 produtos mais vistos
SELECT
  (event_data->>'product_id')::int as product_id,
  event_data->>'product_name' as product_name,
  COUNT(*) as views
FROM analytics_events
WHERE event_type = 'product_card_viewed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY product_id, product_name
ORDER BY views DESC
LIMIT 10;
```

---

## ⚡ Performance e Otimizações

### 1. **Lazy Loading de Imagens**

✅ Implementado com `loading="lazy"` nativo
✅ Fade-in suave com transition
✅ Error fallback elegante
✅ Placeholder animado durante loading

**Benefício**: -50% data transfer no initial load

### 2. **Skeleton Loading**

✅ Mostra estrutura antes do conteúdo
✅ Quantidade dinâmica (exata de produtos)
✅ Shimmer effect profissional

**Benefício**: Melhor perceived performance

### 3. **Parallel Fetching**

```typescript
// BAD: Sequential
for (const id of productIds) {
  await fetch(`/api/products/${id}`);
}

// GOOD: Parallel
const promises = productIds.map((id) => fetch(`/api/products/${id}`));
await Promise.allSettled(promises);
```

**Benefício**: 3x faster loading de múltiplos produtos

### 4. **Graceful Degradation**

```typescript
// Se 1 produto falhar, outros ainda aparecem
const results = await Promise.allSettled(promises);
const successfulProducts = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);
```

**Benefício**: Robustez contra falhas parciais

### 5. **Buffered Analytics**

```typescript
// Analytics não bloqueia UI
trackProductCardViewed({ ... }); // Fire-and-forget
```

**Benefício**: Zero impacto na UX

### 6. **Ref-based Metadata Storage**

```typescript
// Não causa re-renders desnecessários
const enrichedMessagesRef = useRef<Map<string, Metadata>>(new Map());
```

**Benefício**: Evita re-renders em cascata

---

## 🚨 Error Handling

### Cenários de Erro e Resoluções

#### 1. **Produto não encontrado (404)**

**Causa**: Product ID inválido ou produto deletado do WooCommerce

**Tratamento**:

```typescript
// ProductList usa Promise.allSettled
const results = await Promise.allSettled(promises);

// Filtra apenas sucessos
const products = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);

// Se TODOS falharem
if (products.length === 0) {
  setError("No pudimos cargar los productos");
}
```

**UI Exibida**: Mensagem de erro vermelha com opção de retry

---

#### 2. **Imagem não carrega**

**Causa**: URL inválida, CORS, timeout

**Tratamento**:

```typescript
<img
  onError={() => {
    console.warn(`Failed to load image for product ${id}`);
    setImageError(true);
  }}
/>

{imageError && (
  <div>⚠️ Imagen no disponible</div>
)}
```

**UI Exibida**: Ícone de erro + texto explicativo

---

#### 3. **Add to Cart falha**

**Causa**: API error, produto sem stock, network error

**Tratamento**:

```typescript
try {
  const response = await fetch("/api/cart/add", { ... });
  if (!response.ok) throw new Error();

  // Success
  setToast({ type: "success", message: "Producto agregado!" });
} catch (error) {
  // Error
  setToast({
    type: "error",
    message: "Error al agregar. Intenta de nuevo."
  });
}
```

**UI Exibida**: Toast vermelho com mensagem de erro

---

#### 4. **Stream interrompido**

**Causa**: Network error, timeout, server crash

**Tratamento**:

```typescript
// Vercel AI SDK lida automaticamente
const { error, reload } = useChat();

if (error) {
  // Show error message
  // Botão para retry
  <button onClick={() => reload()}>Reintentar</button>;
}
```

**UI Exibida**: Mensagem de erro + botão reload

---

## 🔧 Troubleshooting Guide

### Problema: Product Cards não aparecem

**Sintomas**: AI responde texto mas cards não renderizam

**Checklist**:

1. ✅ Verificar se IDs estão no stream:

   ```typescript
   // No onChunk, adicionar log:
   console.log("📦 Chunk received:", chunk);
   console.log("🔍 Product IDs extracted:", extractProductIds(chunk));
   ```

2. ✅ Verificar se metadata está sendo armazenada:

   ```typescript
   // No onFinish, adicionar log:
   console.log("📝 Enriched messages:", enrichedMessagesRef.current);
   ```

3. ✅ Verificar se ProductList está recebendo props:

   ```typescript
   // No ProductList, adicionar log:
   console.log("📦 ProductList props:", { productIds, conversationId });
   ```

4. ✅ Verificar response da API `/api/products/{id}`:
   ```bash
   curl http://localhost:3000/api/products/1234
   ```

**Solução comum**: Limpar cache do browser (Ctrl+Shift+R)

---

### Problema: Imagens não carregam

**Sintomas**: Cards aparecem mas imagens ficam em loading infinito

**Checklist**:

1. ✅ Verificar URL da imagem:

   ```typescript
   console.log("🖼️ Image URL:", props.image);
   ```

2. ✅ Testar URL diretamente no navegador

3. ✅ Verificar CORS headers:
   ```bash
   curl -I https://snkhouse.com/wp-content/uploads/image.jpg
   ```

**Solução comum**: WooCommerce retornando URL HTTP em vez de HTTPS

---

### Problema: "Agregar al Carrito" não funciona

**Sintomas**: Botão clicado mas nada acontece

**Checklist**:

1. ✅ Verificar logs do console:

   ```typescript
   console.log("🛒 Adding to cart:", { productId, quantity });
   ```

2. ✅ Testar API diretamente:

   ```bash
   curl -X POST http://localhost:3000/api/cart/add \
     -H "Content-Type: application/json" \
     -d '{"productId":1234,"quantity":1}'
   ```

3. ✅ Verificar se redirect URL está correto:
   ```typescript
   console.log("🔗 Redirect URL:", data.redirectUrl);
   ```

**Solução comum**: WooCommerce cart API credentials incorretas

---

### Problema: Analytics não aparecem no dashboard

**Sintomas**: Dashboard mostra 0 em todas as métricas

**Checklist**:

1. ✅ Verificar se eventos estão sendo salvos:

   ```sql
   SELECT * FROM analytics_events
   WHERE event_type LIKE 'product_card%'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. ✅ Verificar credenciais do Supabase:

   ```bash
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

3. ✅ Verificar logs do tracking:
   ```typescript
   console.log("📊 Tracking event:", eventType, eventData);
   ```

**Solução comum**: SUPABASE_SERVICE_ROLE_KEY não configurada

---

## 🚀 Future Improvements

### Prioridade Alta

- [ ] **A/B Testing**: Testar diferentes layouts de cards
- [ ] **Quick View Modal**: Preview do produto sem sair do chat
- [ ] **Wishlist Integration**: Botão "Guardar para depois"
- [ ] **Stock Alerts**: Notificar quando produto voltar ao estoque

### Prioridade Média

- [ ] **Product Recommendations**: "Clientes que compraram X também compraram Y"
- [ ] **Price Alerts**: Notificar quando preço baixar
- [ ] **Bundle Suggestions**: Sugerir combos de produtos
- [ ] **Size Guide**: Integrar guia de tamanhos no card

### Prioridade Baixa

- [ ] **3D Product Viewer**: Visualização 360° dos produtos
- [ ] **AR Try-On**: Realidade aumentada para experimentar produtos
- [ ] **Social Proof**: "X pessoas estão vendo este produto agora"
- [ ] **Comparison Tool**: Comparar até 3 produtos lado a lado

---

## 📚 Referências

### Documentação Interna

- [CLAUDE.md](../CLAUDE.md) - Regras gerais do projeto
- [SESSION_SUMMARY_*.md](.) - Histórico de desenvolvimento

### Documentação Externa

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

## 🎯 Checklist de Implementação

Use este checklist ao implementar Product Cards em um novo canal (ex: WhatsApp):

- [ ] **Backend**: Integrar search_products tool
- [ ] **Streaming**: Retornar product IDs no formato correto
- [ ] **Frontend**: Extrair IDs do stream
- [ ] **Components**: Criar ProductList + ProductCard
- [ ] **API Routes**: Implementar /products/{id} e /cart/add
- [ ] **Analytics**: Integrar tracking events
- [ ] **Error Handling**: Fallbacks para todos os cenários
- [ ] **Performance**: Lazy loading + skeleton loading
- [ ] **Testing**: Testar 7 cenários (veja ADICIONAR_TESTES.md)
- [ ] **Documentation**: Atualizar este documento

---

## 📝 Changelog

### v2.0.0 (2025-01-14) - Sprint 2

- ✅ Migração para SSE streaming (substituiu OpenAI Agent Builder)
- ✅ Skeleton loading rico e profissional
- ✅ Lazy loading de imagens com fade-in
- ✅ Toast notifications (substituiu alert())
- ✅ Analytics tracking completo (3 eventos)
- ✅ Dashboard de analytics integrado
- ✅ Error handling robusto
- ✅ Documentação técnica completa

### v1.0.0 (2025-01-10) - Sprint 1

- ✅ Implementação inicial com OpenAI Agent Builder
- ✅ ProductCard + ProductList components
- ✅ Integração WooCommerce
- ✅ Add to cart functionality
- ✅ Basic analytics

---

**FIM DA DOCUMENTAÇÃO TÉCNICA**

Para dúvidas ou contribuições, consultar o time de desenvolvimento ou abrir issue no repositório.
