# 🗺️ Widget - Roadmap Detalhado em Fases

> **Plano de evolução do Widget: De 6.5/10 para 10/10**
> Timeline: 12 semanas | Esforço total: ~120 horas dev

---

## 📊 Visão Geral

### **Estado Atual vs Estado Desejado**

```
HOJE (Baseline)                      META (12 semanas)
┌──────────────────┐                ┌──────────────────┐
│ Paridade: 6.5/10 │                │ Paridade: 10/10  │
│ WCAG AA: 40%     │   ────────▶    │ WCAG AA: 100%    │
│ Conversion: 3.2% │                │ Conversion: 6.2% │
│ Vulnerabilities:1│                │ Vulnerabilities:0│
└──────────────────┘                └──────────────────┘
```

### **Filosofia do Roadmap**

1. **Safety First**: Resolver vulnerabilidades críticas ANTES de features
2. **Quick Wins Early**: Maximizar ROI nas primeiras semanas
3. **Foundation Then Features**: Base sólida → Features avançadas
4. **Measure Everything**: Métricas em cada milestone

---

## 🚀 FASE 0: Emergency Fixes (Semana 1)

**Objetivo**: Resolver problemas críticos de segurança e UX bloqueantes

**Duração**: 1 semana (40 horas de trabalho)
**Esforço Dev**: ~12 horas
**Risco**: 🟢 Baixo (mudanças localizadas)

### **Entregas**

#### **E0.1: Security Hardening (CRÍTICO)**

**Problema**: XSS vulnerability via dangerouslySetInnerHTML

**Tasks**:

- [ ] Instalar DOMPurify (`pnpm add dompurify @types/dompurify`)
- [ ] Implementar sanitização em [page.tsx:302](apps/widget/src/app/page.tsx#L302)
- [ ] Adicionar testes de segurança (XSS injection attempts)
- [ ] Code review de segurança

**Acceptance Criteria**:

- ✅ Zero vulnerabilidades XSS em scan
- ✅ DOMPurify sanitiza HTML antes de render
- ✅ Whitelist de tags permitidas configurada

**Estimativa**: 2 horas | **ROI**: 60

---

#### **E0.2: Persistência de conversationId**

**Problema**: conversationId perdido ao recarregar página

**Tasks**:

- [ ] Adicionar localStorage.setItem em [page.tsx:32](apps/widget/src/app/page.tsx#L32)
- [ ] Carregar conversationId do localStorage ao montar
- [ ] Adicionar fallback se localStorage não disponível
- [ ] Testar em modo anônimo/privado

**Acceptance Criteria**:

- ✅ conversationId persiste após reload
- ✅ Funciona em navegação privada (fallback)
- ✅ Logs confirmam persistência

**Estimativa**: 1 hora | **ROI**: 14

---

#### **E0.3: Modal de Email Não-Invasivo**

**Problema**: Modal fullscreen bloqueia site (45% bounce rate estimado)

**Tasks**:

- [ ] Converter modal de fullscreen para widget-scoped
- [ ] Adicionar botão "X" para fechar modal
- [ ] Implementar blur overlay (não black/50)
- [ ] Adicionar animação suave de entrada
- [ ] Testar responsividade mobile

**Acceptance Criteria**:

- ✅ Modal não bloqueia site fora do widget
- ✅ Usuário pode fechar modal e navegar
- ✅ Pode reabrir modal depois (não perde chance de converter)

**Estimativa**: 2 horas | **ROI**: 14

---

#### **E0.4: Validação de Email Robusta**

**Problema**: Regex atual aceita emails inválidos

**Tasks**:

- [ ] Implementar RFC 5322 compliant regex
- [ ] Adicionar blacklist de domínios temporários
- [ ] Rejeitar emails com ".." ou "--"
- [ ] Adicionar feedback visual de validação
- [ ] Testar com 20+ casos de edge cases

**Acceptance Criteria**:

- ✅ Rejeita "test@test..com"
- ✅ Rejeita "test@-invalid.com"
- ✅ Rejeita domínios temporários conhecidos
- ✅ Feedback visual imediato (verde/vermelho)

**Estimativa**: 1 hora | **ROI**: 44

---

#### **E0.5: Loading States Visuais**

**Problema**: Nenhum feedback durante 3-4 segundos de espera

**Tasks**:

- [ ] Implementar skeleton loading (3 linhas)
- [ ] Adicionar typing indicator (3 dots pulsing)
- [ ] Animar entrada da resposta
- [ ] Testar perceived performance

**Acceptance Criteria**:

- ✅ Skeleton aparece imediatamente ao enviar
- ✅ Typing indicator durante geração
- ✅ Resposta anima suavemente ao aparecer

**Estimativa**: 1.5 horas | **ROI**: 22

---

#### **E0.6: Retry Logic em Falhas de API**

**Problema**: Mensagens perdidas em network glitches

**Tasks**:

- [ ] Criar função `fetchWithRetry` em [lib/retry.ts](apps/widget/src/lib/retry.ts)
- [ ] Implementar exponential backoff (1s, 2s, 4s)
- [ ] Adicionar timeout de 15 segundos por tentativa
- [ ] Integrar no sendMessage
- [ ] Testar com network throttling

**Acceptance Criteria**:

- ✅ Retry automático em falhas 5xx
- ✅ Máximo 3 tentativas
- ✅ Exponential backoff funciona
- ✅ Usuário vê feedback de retry

**Estimativa**: 1.5 horas | **ROI**: 20

---

### **Milestone 0: Entrega**

**Checkpoint**: Fim da Semana 1

**Critérios de Sucesso**:

- ✅ Zero vulnerabilidades críticas
- ✅ conversationId persiste entre sessões
- ✅ Modal não-invasivo implementado
- ✅ Email validation robusta
- ✅ Loading states visuais ativos
- ✅ Retry logic implementado

**Métricas Esperadas**:
| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Security Vulnerabilities | 1 critical | 0 | -100% |
| Bounce Rate (Modal) | 45% | 28% | -38% |
| Session Continuity | 45% | 60% | +33% |
| Request Success Rate | 92% | 97% | +5% |
| Perceived Performance | 5/10 | 7/10 | +40% |

**Deploy**: Staging → Canary (10% traffic) → Production (100%)

---

## 🏗️ FASE 1: Foundation (Semanas 2-3)

**Objetivo**: Construir fundação sólida para features avançadas

**Duração**: 2 semanas
**Esforço Dev**: ~18 horas
**Risco**: 🟡 Médio (mudanças estruturais)

### **Entregas**

#### **E1.1: Carregar Histórico de Conversas (CRITICAL)**

**Problema**: Backend salva, frontend nunca carrega (Bug #1)

**Tasks**:

- [ ] Criar endpoint GET /api/chat/history
  - [ ] Query por conversationId
  - [ ] Query por customerEmail (busca última conversa ativa)
  - [ ] Retornar mensagens ordenadas por created_at
  - [ ] Incluir conversationId no response
- [ ] Implementar useEffect de carregamento no frontend
  - [ ] Buscar localStorage (conversationId, email)
  - [ ] Fazer request ao /api/chat/history
  - [ ] Popular messages state
  - [ ] Scroll automático ao último
- [ ] Persistir customerEmail no localStorage
  - [ ] Salvar ao submeter email
  - [ ] Carregar ao montar componente
- [ ] Adicionar loading skeleton durante fetch
- [ ] Tratar erro de network (fallback gracioso)

**Acceptance Criteria**:

- ✅ Histórico carrega automaticamente ao abrir widget
- ✅ Se não tiver conversationId, busca por email
- ✅ Mensagens aparecem na ordem correta
- ✅ Scroll automático ao último
- ✅ Loading skeleton durante fetch

**Estimativa**: 6 horas | **ROI**: 7.6

**Arquivos Modificados**:

- `apps/widget/src/app/api/chat/history/route.ts` (NOVO)
- `apps/widget/src/app/page.tsx` (modificar useEffect)

---

#### **E1.2: System Prompt Customizado (WhatsApp-inspired)**

**Problema**: Widget usa prompt genérico (vs 330 linhas do WhatsApp)

**Tasks**:

- [ ] Criar arquivo [widget-system-prompt.ts](apps/widget/src/lib/widget-system-prompt.ts)
  - [ ] Copiar estrutura do WhatsApp prompt
  - [ ] Adaptar para contexto Widget:
    - Respostas mais curtas (2-4 linhas vs 5-8)
    - Links diretos a produtos (não "visite snkhouse.com")
    - Menos emojis (1-2 vs 2-3)
    - Tono mais profissional
  - [ ] Incluir instruções críticas:
    - ⚠️ Autenticidade (originais vs réplicas)
    - Talles sempre disponíveis (38-45)
    - Cobertura geográfica (Argentina only)
    - Pricing e descontos (10% OFF 2+)
  - [ ] Protocolo de resposta (4 cenários principais)
  - [ ] Estratégias de venda (5 técnicas não-agressivas)
- [ ] Integrar prompt em [route.ts:280](apps/widget/src/app/api/chat/route.ts#L280)
  - [ ] Adicionar como system message
  - [ ] Passar antes de aiMessages
- [ ] Testar 20+ cenários de conversa
  - [ ] Busca de produto
  - [ ] Pergunta sobre autenticidade
  - [ ] Tracking de pedido
  - [ ] Recomendação
- [ ] Comparar qualidade vs prompt antigo (A/B test)

**Acceptance Criteria**:

- ✅ Respostas seguem tono Widget (não WhatsApp)
- ✅ Instruções de autenticidade respeitadas
- ✅ Links diretos a produtos (não "visite site")
- ✅ +40% response quality score (vs baseline)

**Estimativa**: 8 horas | **ROI**: 5.4

**Arquivos Modificados**:

- `apps/widget/src/lib/widget-system-prompt.ts` (NOVO)
- `apps/widget/src/app/api/chat/route.ts` (modificar)

---

#### **E1.3: Melhorias de Performance Backend**

**Problema**: 3.6s avg response time (82% em AI)

**Tasks**:

- [ ] Implementar paralelização de queries independentes

  ```typescript
  // Antes: Serial (300ms total)
  const customer = await getCustomer();
  const conversation = await getConversation();

  // Depois: Parallel (150ms total)
  const [customer, conversation] = await Promise.all([
    getCustomer(),
    getConversation(),
  ]);
  ```

- [ ] Adicionar índices no Supabase
  - [ ] `customers(email)` - btree index
  - [ ] `conversations(customer_id, channel, status)` - composite index
  - [ ] `messages(conversation_id, created_at)` - composite index
- [ ] Implementar connection pooling (se não ativo)
- [ ] Adicionar caching de WooCommerce customer lookup (5 min TTL)
- [ ] Otimizar query de messages (limit 50 últimas)

**Acceptance Criteria**:

- ✅ DB queries: 150-200ms → 100-120ms (-30%)
- ✅ WooCommerce lookup: 500ms → 50ms (cached) (-90%)
- ✅ Total response: 3600ms → 3200ms (-11%)

**Estimativa**: 4 horas

**Arquivos Modificados**:

- `apps/widget/src/app/api/chat/route.ts`
- Supabase console (criar índices via SQL)

---

### **Milestone 1: Entrega**

**Checkpoint**: Fim da Semana 3

**Critérios de Sucesso**:

- ✅ Histórico de conversas carrega automaticamente
- ✅ System prompt customizado ativo
- ✅ Performance melhorada em 10-15%
- ✅ Zero regressões de Fase 0

**Métricas Esperadas**:
| Métrica | Fase 0 | Fase 1 | Melhoria |
|---------|--------|--------|----------|
| Session Continuity | 60% | 80% | +33% |
| Response Quality | 6.5/10 | 9/10 | +38% |
| Avg Response Time | 3600ms | 3200ms | -11% |
| User Retention | 35% | 50% | +43% |
| Conversion Rate | 3.8% | 5.2% | +37% |

**Deploy**: Staging → Canary (25% traffic) → Production (100%)

---

## 🎨 FASE 2: UX Excellence (Semanas 4-6)

**Objetivo**: Transformar UX de "bom" para "excepcional"

**Duração**: 3 semanas
**Esforço Dev**: ~26 horas
**Risco**: 🟡 Médio (mudanças visuais significativas)

### **Entregas**

#### **E2.1: Streaming (Server-Sent Events)**

**Problema**: Usuário espera 3-4s sem feedback (resposta completa)

**Tasks**:

- [ ] Instalar Vercel AI SDK (`pnpm add ai`)
- [ ] Criar endpoint /api/chat/stream
  - [ ] Configurar edge runtime
  - [ ] Implementar streaming com OpenAI
  - [ ] Retornar StreamingTextResponse
  - [ ] Passar conversationId em header
- [ ] Modificar frontend para consumir stream
  - [ ] Usar hook `useChat` do Vercel AI SDK
  - [ ] Remover lógica de fetch manual
  - [ ] Mostrar palavras aparecendo (não skeleton)
- [ ] Criar endpoint /api/chat/save-message
  - [ ] Salvar mensagem completa após stream terminar
  - [ ] Trigger no onFinish do useChat
- [ ] Adicionar cancelation (usuário pode interromper)
- [ ] Testar em mobile (performance de streaming)

**Acceptance Criteria**:

- ✅ Primeira palavra aparece em <1.2s (vs 4s antes)
- ✅ Palavras aparecem progressivamente (typewriter effect)
- ✅ Usuário pode interromper resposta
- ✅ Mensagem completa salva no DB ao terminar
- ✅ Funciona em mobile (não trava)

**Estimativa**: 10 horas | **ROI**: 3.4

**Arquivos Modificados**:

- `apps/widget/src/app/api/chat/stream/route.ts` (NOVO)
- `apps/widget/src/app/api/chat/save-message/route.ts` (NOVO)
- `apps/widget/src/app/page.tsx` (refatorar sendMessage)

---

#### **E2.2: Responsividade Mobile Completa**

**Problema**: Fixed width quebra em mobile < 375px

**Tasks**:

- [ ] Refatorar layout para fluid width
  ```typescript
  // Antes: width: 400px (fixed)
  // Depois: width: min(400px, 100vw - 32px)
  ```
- [ ] Testar em 5 breakpoints:
  - [ ] 320px (iPhone SE)
  - [ ] 375px (iPhone 12/13)
  - [ ] 390px (iPhone 14 Pro)
  - [ ] 414px (iPhone 14 Pro Max)
  - [ ] 768px (Tablet)
- [ ] Ajustar font sizes para mobile (16px mínimo - evita zoom)
- [ ] Aumentar touch targets (close button 48x48px)
- [ ] Testar em modo landscape
- [ ] Testar com teclado virtual aberto (viewport resize)

**Acceptance Criteria**:

- ✅ Widget funciona perfeitamente em 320px
- ✅ Touch targets ≥ 48x48px (WCAG AA)
- ✅ Texto legível sem zoom
- ✅ Teclado não sobrepõe input
- ✅ Scroll funciona com teclado aberto

**Estimativa**: 4 horas

**Arquivos Modificados**:

- `apps/widget/src/app/page.tsx` (ajustar classes Tailwind)
- `apps/widget/src/app/globals.css` (media queries)

---

#### **E2.3: Animações e Micro-interactions**

**Problema**: Experiência visual plana (sem delighters)

**Tasks**:

- [ ] Adicionar animação de entrada de mensagem
  ```typescript
  className = "animate-in slide-in-from-bottom-2 fade-in duration-300";
  ```
- [ ] Bounce suave no botão de enviar (ao hover)
- [ ] Pulse no avatar do bot durante "typing"
- [ ] Shake no input se enviar vazio
- [ ] Confetti ao completar primeira compra (opcional)
- [ ] Smooth scroll ao adicionar nova mensagem
- [ ] Implementar prefers-reduced-motion
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
    }
  }
  ```
- [ ] Testar performance (60 FPS em mobile)

**Acceptance Criteria**:

- ✅ Animações suaves (60 FPS)
- ✅ prefers-reduced-motion respeitado
- ✅ Micro-interactions dão feedback claro
- ✅ Não afeta performance

**Estimativa**: 5 horas

**Arquivos Modificados**:

- `apps/widget/src/app/page.tsx`
- `apps/widget/src/app/globals.css`

---

#### **E2.4: Melhorias Visuais (Design Polish)**

**Tasks**:

- [ ] Atualizar palette de cores (contrast WCAG AA)
  - [ ] Placeholder: #6B7280 (4.5:1 ratio)
  - [ ] Input border: #D1D5DB (3:1 ratio)
- [ ] Adicionar glassmorphism no header
  ```css
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  ```
- [ ] Melhorar sombras (layered shadows)
  ```css
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08);
  ```
- [ ] Adicionar gradient no avatar do bot
- [ ] Melhorar tipografia (line-height, letter-spacing)
- [ ] Implementar dark mode (opcional)

**Acceptance Criteria**:

- ✅ Todos os contrasts passam WCAG AA
- ✅ Design moderno e polished
- ✅ Consistente com brand SNKHOUSE

**Estimativa**: 4 horas

---

#### **E2.5: Error Handling Visual**

**Problema**: Erros não são comunicados claramente

**Tasks**:

- [ ] Criar componente ErrorMessage
  ```tsx
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-800">❌ {error.message}</p>
    <button>Reintentar</button>
  </div>
  ```
- [ ] Adicionar toast notifications (react-hot-toast)
- [ ] Mostrar erro inline se API falhar
- [ ] Botão "Reintentar" ao lado da mensagem falhada
- [ ] Timeout visual (countdown timer)

**Acceptance Criteria**:

- ✅ Erros visíveis e claros
- ✅ Usuário pode reintentar facilmente
- ✅ Não quebra UX (error boundary)

**Estimativa**: 3 horas

---

### **Milestone 2: Entrega**

**Checkpoint**: Fim da Semana 6

**Critérios de Sucesso**:

- ✅ Streaming implementado (ChatGPT-like)
- ✅ 100% responsivo (320px+)
- ✅ Animações polished
- ✅ WCAG AA contrast compliance
- ✅ Error handling visual

**Métricas Esperadas**:
| Métrica | Fase 1 | Fase 2 | Melhoria |
|---------|--------|--------|----------|
| Perceived Performance | 7/10 | 9/10 | +29% |
| Mobile Usability | 6/10 | 9/10 | +50% |
| User Satisfaction | 7.2/10 | 8.5/10 | +18% |
| Bounce Rate | 28% | 18% | -36% |

**Deploy**: Staging → Canary (50% traffic) → Production (100%)

---

## ♿ FASE 3: Accessibility (Semanas 7-8)

**Objetivo**: 100% WCAG 2.1 Level AA compliance

**Duração**: 2 semanas
**Esforço Dev**: ~14 horas
**Risco**: 🟢 Baixo (mudanças incrementais)

### **Entregas**

#### **E3.1: Keyboard Navigation Completo**

**Tasks**:

- [ ] Implementar focus management
  - [ ] Focus no input ao abrir widget
  - [ ] Focus no botão fechar modal (ao abrir modal)
  - [ ] Focus trap em modal (Tab circular)
- [ ] Adicionar focus visible styles
  ```css
  :focus-visible {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
  }
  ```
- [ ] Suportar Escape para fechar modal
- [ ] Suportar Enter para enviar mensagem
- [ ] Suportar ↑/↓ para navegar histórico (opcional)
- [ ] Testar com navegação 100% keyboard

**Acceptance Criteria**:

- ✅ Todo workflow acessível via keyboard
- ✅ Focus visible em todos os elementos
- ✅ Escape fecha modal
- ✅ Enter envia mensagem

**Estimativa**: 4 horas

---

#### **E3.2: ARIA Attributes e Semântica**

**Tasks**:

- [ ] Adicionar role="log" no container de mensagens
  ```tsx
  <div
    role="log"
    aria-live="polite"
    aria-atomic="false"
    aria-relevant="additions text"
  >
  ```
- [ ] Adicionar aria-label em todos os botões
  ```tsx
  <button aria-label="Cerrar chat">✕</button>
  <button aria-label="Enviar mensaje">→</button>
  ```
- [ ] Adicionar aria-expanded no toggle button (se houver)
- [ ] Adicionar aria-describedby em input
  ```tsx
  <input
    aria-describedby="input-hint"
    aria-required="true"
  />
  <p id="input-hint">Escribe tu mensaje aquí</p>
  ```
- [ ] Testar com screen readers (NVDA, JAWS, VoiceOver)

**Acceptance Criteria**:

- ✅ Screen readers anunciam mensagens corretamente
- ✅ Todos os elementos interativos têm labels
- ✅ Estrutura semântica correta

**Estimativa**: 4 horas

---

#### **E3.3: Screen Reader Testing e Fixes**

**Tasks**:

- [ ] Testar com NVDA (Windows)
- [ ] Testar com JAWS (Windows)
- [ ] Testar com VoiceOver (Mac/iOS)
- [ ] Testar com TalkBack (Android)
- [ ] Documentar bugs encontrados
- [ ] Corrigir anúncios incorretos
- [ ] Adicionar live regions para notificações
- [ ] Testar mensagens de erro (devem ser anunciadas)

**Acceptance Criteria**:

- ✅ Widget 100% navegável via screen reader
- ✅ Mensagens anunciadas corretamente
- ✅ Erros anunciados imediatamente

**Estimativa**: 6 horas

---

### **Milestone 3: Entrega**

**Checkpoint**: Fim da Semana 8

**Critérios de Sucesso**:

- ✅ 100% WCAG 2.1 Level AA compliance
- ✅ Keyboard navigation completo
- ✅ Screen readers funcionam perfeitamente
- ✅ Passa em audit de accessibility (Lighthouse, axe)

**Métricas Esperadas**:
| Métrica | Fase 2 | Fase 3 | Melhoria |
|---------|--------|--------|----------|
| WCAG AA Compliance | 40% | 100% | +150% |
| Accessibility Score (Lighthouse) | 72 | 95+ | +32% |
| Keyboard Navigable | 60% | 100% | +67% |
| Screen Reader Compatible | 40% | 100% | +150% |

**Deploy**: Staging → Production (100%) - Low risk

---

## 🧠 FASE 4: Intelligence (Semanas 9-10)

**Objetivo**: Context-aware AI (Smart features)

**Duração**: 2 semanas
**Esforço Dev**: ~16 horas
**Risco**: 🟡 Médio (integração com parent page)

### **Entregas**

#### **E4.1: Product Page Context Detection**

**Tasks**:

- [ ] Implementar postMessage para capturar contexto
  ```javascript
  // snkhouse.com/produto/nike-dunk
  window.addEventListener("load", () => {
    const iframe = document.querySelector("iframe[data-widget]");
    iframe.contentWindow.postMessage(
      {
        type: "PAGE_CONTEXT",
        data: {
          page: "product",
          productId: 12345,
          productName: 'Nike Dunk Low "Panda"',
          productPrice: 74900,
          productCategory: "Nike",
        },
      },
      "*",
    );
  });
  ```
- [ ] Receber contexto no Widget
  ```typescript
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "PAGE_CONTEXT") {
        setPageContext(event.data.data);
      }
    });
  }, []);
  ```
- [ ] Passar contexto no request /api/chat
- [ ] Modificar system prompt para usar contexto
  - [ ] Se página de produto: Falar SOBRE esse produto
  - [ ] Se categoria: Recomendar dessa categoria
  - [ ] Se homepage: Overview geral
- [ ] Testar em 3 tipos de página

**Acceptance Criteria**:

- ✅ Widget detecta página de produto
- ✅ AI responde com contexto do produto visível
- ✅ Reduz perguntas redundantes ("cuánto cuesta")

**Estimativa**: 8 horas | **ROI**: 4.3

---

#### **E4.2: User Behavior Tracking**

**Tasks**:

- [ ] Implementar tracking de interações
  - [ ] Mensagens enviadas
  - [ ] Produtos clicados
  - [ ] Tempo médio de resposta
  - [ ] Taxa de conversão (widget → checkout)
- [ ] Criar dashboard de analytics
- [ ] Identificar padrões (produtos mais perguntados)
- [ ] A/B testing framework (testar variants de prompt)

**Acceptance Criteria**:

- ✅ Tracking de eventos implementado
- ✅ Dashboard mostra métricas key
- ✅ Pode fazer A/B tests

**Estimativa**: 8 horas

---

### **Milestone 4: Entrega**

**Checkpoint**: Fim da Semana 10

**Critérios de Sucesso**:

- ✅ Context-aware responses funcionando
- ✅ Tracking de analytics implementado
- ✅ A/B testing framework pronto

**Métricas Esperadas**:
| Métrica | Fase 3 | Fase 4 | Melhoria |
|---------|--------|--------|----------|
| Context-Aware Responses | 0% | 80% | +∞ |
| Conversion Rate | 5.2% | 6.2% | +19% |
| Avg Order Value | ARS 85k | ARS 105k | +24% |

**Deploy**: Staging → Canary (25% traffic) → Production (100%)

---

## 🚀 FASE 5: Optimization (Semanas 11-12)

**Objetivo**: Performance, scale, polish final

**Duração**: 2 semanas
**Esforço Dev**: ~18 horas
**Risco**: 🟢 Baixo (otimizações)

### **Entregas**

#### **E5.1: Performance Optimization**

**Tasks**:

- [ ] Implementar lazy loading de mensagens antigas
  - [ ] Carregar últimas 20 mensagens
  - [ ] "Load more" ao scroll top
- [ ] Otimizar bundle size
  - [ ] Code splitting por rota
  - [ ] Tree-shaking de dependencies
  - [ ] Analisar com @next/bundle-analyzer
- [ ] Implementar Service Worker (PWA)
  - [ ] Cache de assets
  - [ ] Offline fallback
- [ ] Otimizar imagens (se houver)
- [ ] Minificar CSS/JS

**Acceptance Criteria**:

- ✅ Bundle size < 150kb (gzipped)
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 2.5s

**Estimativa**: 6 horas

---

#### **E5.2: Rate Limiting & Security**

**Tasks**:

- [ ] Implementar rate limiting no backend
  - [ ] 20 mensagens/min por IP
  - [ ] 100 mensagens/hora por email
- [ ] Adicionar CAPTCHA em caso de abuse (opcional)
- [ ] Implementar CSP headers
  ```javascript
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    connect-src 'self' https://api.openai.com https://api.anthropic.com;
  ```
- [ ] Adicionar request signing (HMAC)
- [ ] Audit de segurança completo

**Acceptance Criteria**:

- ✅ Rate limiting ativo
- ✅ CSP headers configurados
- ✅ Zero vulnerabilidades em scan

**Estimativa**: 4 horas

---

#### **E5.3: Monitoring & Alerting**

**Tasks**:

- [ ] Configurar Sentry (error tracking)
- [ ] Adicionar custom metrics (DataDog/Prometheus)
  - [ ] Avg response time
  - [ ] Error rate
  - [ ] Conversion rate
  - [ ] User satisfaction (CSAT)
- [ ] Criar alertas para:
  - [ ] Error rate > 5%
  - [ ] Response time > 10s (p95)
  - [ ] Conversion rate drop > 20%
- [ ] Dashboard de health check

**Acceptance Criteria**:

- ✅ Sentry capturando erros
- ✅ Métricas customizadas trackeadas
- ✅ Alertas configurados

**Estimativa**: 4 horas

---

#### **E5.4: Documentation & Handoff**

**Tasks**:

- [ ] Documentar API endpoints (OpenAPI spec)
- [ ] Criar README.md para Widget
- [ ] Documentar system prompt (como modificar)
- [ ] Guia de troubleshooting
- [ ] Runbook para oncall
- [ ] Vídeo demo (Loom)

**Acceptance Criteria**:

- ✅ Documentação completa
- ✅ Qualquer dev pode fazer deploy
- ✅ Runbook cobre 90% dos problemas

**Estimativa**: 4 horas

---

### **Milestone 5: Entrega FINAL**

**Checkpoint**: Fim da Semana 12

**Critérios de Sucesso**:

- ✅ Performance otimizada (Lighthouse 90+)
- ✅ Security hardened (rate limiting, CSP)
- ✅ Monitoring completo (Sentry, metrics)
- ✅ Documentação completa

**Métricas Finais**:
| Métrica | Baseline | Final | Melhoria |
|---------|----------|-------|----------|
| **Paridade Widget/WhatsApp** | 6.5/10 | 10/10 | +54% |
| **WCAG AA Compliance** | 40% | 100% | +150% |
| **Conversion Rate** | 3.2% | 6.2% | +94% |
| **Avg Response Time** | 3600ms | 2800ms | -22% |
| **User Satisfaction (CSAT)** | 7.2/10 | 9/10 | +25% |
| **Security Vulnerabilities** | 1 critical | 0 | -100% |
| **Bundle Size** | 280kb | 145kb | -48% |
| **Lighthouse Score** | 72 | 95+ | +32% |

**Deploy**: Production (100%) - CELEBRATION! 🎉

---

## 📊 Resumo Executivo

### **Esforço Total**

| Fase                    | Duração        | Esforço Dev | Risco    | ROI Agregado |
| ----------------------- | -------------- | ----------- | -------- | ------------ |
| Fase 0: Emergency Fixes | 1 semana       | 12h         | 🟢 Baixo | ⭐⭐⭐⭐⭐   |
| Fase 1: Foundation      | 2 semanas      | 18h         | 🟡 Médio | ⭐⭐⭐⭐     |
| Fase 2: UX Excellence   | 3 semanas      | 26h         | 🟡 Médio | ⭐⭐⭐⭐     |
| Fase 3: Accessibility   | 2 semanas      | 14h         | 🟢 Baixo | ⭐⭐⭐       |
| Fase 4: Intelligence    | 2 semanas      | 16h         | 🟡 Médio | ⭐⭐⭐⭐     |
| Fase 5: Optimization    | 2 semanas      | 18h         | 🟢 Baixo | ⭐⭐⭐       |
| **TOTAL**               | **12 semanas** | **104h**    | -        | -            |

### **Budget Estimado**

Assumindo:

- 1 Full-Stack Developer Sr. (USD $80/h)
- 1 Designer (5h total - USD $60/h)
- 1 QA Engineer (10h total - USD $50/h)

**Total**: USD $9,120 + USD $300 + USD $500 = **USD $9,920**

### **ROI Esperado**

**Custos**:

- Desenvolvimento: USD $9,920
- Infraestrutura (Vercel, Supabase): USD $200/mês

**Benefícios** (primeiro ano):

- +94% conversion rate: 3.2% → 6.2%
- Assumindo 10k visitors/mês no Widget:
  - Conversions antes: 320/mês
  - Conversions depois: 620/mês
  - Delta: +300 conversions/mês
- Average Order Value: ARS $90,000 (USD $100)
- Revenue incremental: USD $30,000/mês = **USD $360,000/ano**

**ROI**: (USD $360k - USD $12k) / USD $12k = **2,900%** 🚀

---

## 🎯 Recomendação Final

### **Cenário 1: Fast Track (Prioridade MÁXIMA)**

**Focar apenas em**:

- Fase 0 (Emergency Fixes) - 1 semana
- Fase 1 (Foundation) - 2 semanas
- E2.1 (Streaming) - 1 semana

**Total**: 4 semanas, USD $3,200
**Resultado**: Paridade 8/10, conversão +50%, zero vulnerabilidades

---

### **Cenário 2: Balanced (Recomendado)**

**Implementar**:

- Fase 0 + Fase 1 + Fase 2 + Fase 3

**Total**: 8 semanas, USD $7,200
**Resultado**: Paridade 9/10, conversão +80%, WCAG 100%, UX excepcional

---

### **Cenário 3: Full Excellence**

**Implementar todas as 5 fases**

**Total**: 12 semanas, USD $9,920
**Resultado**: Paridade 10/10, conversão +94%, melhor widget do mercado

**Recomendação**: **Cenário 2 (Balanced)** oferece melhor custo-benefício.

---

**FIM DO ROADMAP**

Próximo passo: Aprovar cenário e iniciar Fase 0 (Emergency Fixes).
