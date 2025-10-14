"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat, type Message } from "ai/react";
import DOMPurify from "dompurify";
import { ProductList } from "../../components/ProductList";
import { hasProductMetadata } from "../../lib/product-utils";

/**
 * EMBED VERSION - Widget standalone sem página demo
 * Usado para embeding no WordPress via iframe
 *
 * URL: https://snkhouse-bot-widget.vercel.app/embed
 */

/**
 * Context da página que o usuário está vendo
 * Enviado pelo parent window (snkhouse.com) via postMessage
 */
interface PageContext {
  page: 'product' | 'category' | 'cart' | 'home' | 'checkout';
  productId?: number;
  productName?: string;
  productPrice?: number;
  productInStock?: boolean;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  cartItemsCount?: number;
  cartTotal?: number;
  timestamp?: string; // ISO string
}

/**
 * Mensagem recebida via postMessage
 */
interface PageContextMessage {
  type: 'PAGE_CONTEXT' | 'PAGE_CHANGED';
  source: 'snkhouse';
  data: PageContext;
}

/**
 * Sanitiza email para logs (LGPD compliance)
 */
function sanitizeEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***@***";
  const domainParts = domain.split(".");
  const tld =
    domainParts.length > 0 ? domainParts[domainParts.length - 1] : "***";
  return `${user[0]}***@***${tld}`;
}

/**
 * Robust email validation (RFC 5322 compliant)
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim());
}

/**
 * Converte markdown simples para HTML
 */
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

export default function EmbedWidget() {
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs para enriquecimento de mensagens (não causam re-render)
  const pendingProductIdsRef = useRef<number[]>([]);
  const enrichedMessagesRef = useRef<Map<string, any>>(new Map());
  const [enrichmentTrigger, setEnrichmentTrigger] = useState(0);

  // Estado de contexto da página (Context Awareness)
  const [pageContext, setPageContext] = useState<PageContext | null>(null);

  console.log('[Embed Widget] Current page context:', pageContext);

  // useChat() hook from Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat/stream",
    body: {
      customerEmail,
      conversationId,
      pageContext, // ← Context Awareness!
    },
    onResponse(response: Response) {
      console.log("🔄 [Embed Widget] Stream response received:", response.status);

      // Extract metadata from headers
      const newConversationId = response.headers.get("X-Conversation-Id");
      const newEmail = response.headers.get("X-Email");
      const productIdsHeader = response.headers.get("X-Product-Ids");

      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
        localStorage.setItem("snkhouse_conversation_id", newConversationId);
        console.log("💬 [Embed Widget] Conversation ID updated:", newConversationId);
      }

      if (newEmail && newEmail !== customerEmail) {
        setCustomerEmail(newEmail);
        localStorage.setItem("snkhouse_customer_email", newEmail);
        console.log("📧 [Embed Widget] Email updated:", sanitizeEmail(newEmail));
      }

      // Extract product IDs from header
      if (productIdsHeader) {
        const ids = productIdsHeader
          .split(",")
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));

        if (ids.length > 0) {
          console.log("🛍️ [Embed Widget] Product IDs from header:", ids);
          pendingProductIdsRef.current = ids;
        }
      }
    },
    onFinish(message: Message) {
      // Enriquecer mensagem com product IDs se houver
      if (message.role === "assistant" && pendingProductIdsRef.current.length > 0) {
        const productIds = [...pendingProductIdsRef.current];

        // Armazenar metadata no ref
        enrichedMessagesRef.current.set(message.id, {
          productIds,
          hasProducts: true
        });

        // Disparar re-render do useMemo
        setEnrichmentTrigger(prev => prev + 1);

        // Limpar product IDs pendentes
        pendingProductIdsRef.current = [];
      }

      // Scroll suave quando mensagem completa
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }, 200);
    },
    onError(error: Error) {
      console.error("❌ [Embed Widget] Stream error:", error);
    },
  });

  // Mesclar mensagens do useChat() com metadata enriquecida
  const visibleMessages = useMemo(() => {
    return messages.map(msg => {
      const metadata = enrichedMessagesRef.current.get(msg.id);
      if (metadata) {
        return { ...msg, metadata };
      }
      return msg;
    });
  }, [messages, enrichmentTrigger]);

  // Load customer data and history on mount
  useEffect(() => {
    async function loadHistory() {
      console.log("[Embed Widget] Loading history...");

      const savedEmail = localStorage.getItem("snkhouse_customer_email");
      const savedConversationId = localStorage.getItem(
        "snkhouse_conversation_id"
      );

      // Se não tem email, mostrar modal
      if (!savedEmail) {
        console.log("[Embed Widget] No saved email, showing prompt");
        setShowEmailPrompt(true);
        return;
      }

      // Restaurar email e conversationId
      setCustomerEmail(savedEmail);
      if (savedConversationId) {
        setConversationId(savedConversationId);
      }

      try {
        // Carregar histórico via API
        const params = new URLSearchParams();
        if (savedConversationId) {
          params.append("conversationId", savedConversationId);
        } else {
          params.append("customerEmail", savedEmail);
        }

        const response = await fetch(`/api/chat/history?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          // Convert to useChat() format AND populate enrichedMessagesRef with metadata
          const loadedMessages = data.messages.map((msg: any) => {
            // Se mensagem tem metadata com product IDs, armazenar no ref
            if (msg.metadata && msg.metadata.productIds && msg.metadata.productIds.length > 0) {
              enrichedMessagesRef.current.set(msg.id, {
                productIds: msg.metadata.productIds,
                hasProducts: true
              });
            }

            return {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: new Date(msg.created_at),
            };
          });

          setMessages(loadedMessages);

          // Disparar re-render se houver mensagens com metadata
          if (enrichedMessagesRef.current.size > 0) {
            setEnrichmentTrigger(prev => prev + 1);
          }

          console.log(
            `✅ [Embed Widget] Loaded ${loadedMessages.length} messages (${enrichedMessagesRef.current.size} with products)`
          );

          // Auto-scroll
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }

        // Atualizar conversationId se retornou
        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem("snkhouse_conversation_id", data.conversationId);
        }
      } catch (error) {
        console.error("[Embed Widget] Error loading history:", error);
      }
    }

    loadHistory();
  }, []);

  // Detect when user is manually scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrollingRef.current = true;

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset after 1 second of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 1000);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Escuta mensagens do parent window (snkhouse.com)
   * para receber contexto da página atual
   *
   * CONTEXT AWARENESS - Sprint 2B
   */
  useEffect(() => {
    function handleMessage(event: MessageEvent<PageContextMessage>) {
      console.log('[Embed Widget] Message received:', {
        origin: event.origin,
        type: event.data?.type,
        source: event.data?.source,
      });

      // ⚠️ SECURITY: Validar origin
      const allowedOrigins = [
        'https://snkhouse.com',
        'https://www.snkhouse.com',
        'http://localhost:3000', // Development
        'http://localhost:3001', // Development (WooCommerce)
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn('[Embed Widget] Message from unknown origin, ignoring:', event.origin);
        return;
      }

      // Validar estrutura da mensagem
      const message = event.data;

      if (!message || typeof message !== 'object') {
        console.warn('[Embed Widget] Invalid message format:', message);
        return;
      }

      if (message.type !== 'PAGE_CONTEXT' && message.type !== 'PAGE_CHANGED') {
        console.log('[Embed Widget] Unknown message type, ignoring:', message.type);
        return;
      }

      if (message.source !== 'snkhouse') {
        console.warn('[Embed Widget] Unknown message source, ignoring:', message.source);
        return;
      }

      // Validar dados do contexto
      const context = message.data;

      if (!context || !context.page) {
        console.warn('[Embed Widget] Invalid context data:', context);
        return;
      }

      // ✅ Tudo válido - salvar contexto
      console.log('✅ [Embed Widget] Page context updated:', context);
      setPageContext(context);

      // Opcional: Mostrar toast de debug (remover em produção)
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 [Embed Widget] Context:', {
          page: context.page,
          product: context.productName,
          category: context.categoryName,
        });
      }
    }

    // Adicionar listener
    window.addEventListener('message', handleMessage);
    console.log('[Embed Widget] postMessage listener registered');

    // Enviar mensagem para parent pedindo contexto inicial
    // (caso widget carregue depois da página)
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'WIDGET_READY',
          source: 'snkhouse-widget',
        },
        '*' // Parent vai filtrar por source
      );
      console.log('[Embed Widget] Sent WIDGET_READY to parent');
    }

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('[Embed Widget] postMessage listener removed');
    };
  }, []); // Rodar apenas uma vez

  // Handle email submission
  const handleEmailSubmit = () => {
    const trimmedEmail = emailInput.trim();

    if (!isValidEmail(trimmedEmail)) {
      alert("Por favor, ingresá un email válido (ej: tu@email.com)");
      return;
    }

    localStorage.setItem("snkhouse_customer_email", trimmedEmail);
    setCustomerEmail(trimmedEmail);
    setShowEmailPrompt(false);
    console.log(
      "[Embed Widget] Email validated and saved:",
      sanitizeEmail(trimmedEmail)
    );
  };

  // Custom submit handler to check email first
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!customerEmail) {
      setShowEmailPrompt(true);
      return;
    }

    handleSubmit(e);

    // Scroll to bottom when user sends a message (smooth)
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }, 100);
  };

  // Email prompt modal
  if (showEmailPrompt) {
    return (
      <div className="h-screen w-full bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full relative">
          <button
            onClick={() => setShowEmailPrompt(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-xl font-bold mb-4">¡Hola! 👋</h2>
          <p className="text-gray-600 mb-4">
            Para ayudarte con tus pedidos, necesito tu email:
          </p>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-2 border rounded-lg mb-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEmailSubmit();
              if (e.key === "Escape") setShowEmailPrompt(false);
            }}
            autoFocus
          />
          <button
            onClick={handleEmailSubmit}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg"
          >
            Continuar
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Tu email solo se usa para identificarte. No spam.
          </p>
        </div>
      </div>
    );
  }

  // EMBED VERSION - Chat fullscreen sem botão
  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              src="/snkhouse-logo-new.png"
              alt="SNKHOUSE Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">SNKHOUSE</h2>
            <p className="text-xs opacity-80 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En línea ahora
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="messages-container flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4"
      >
        {visibleMessages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-gray-600 font-medium">
              ¡Hola! Soy tu asistente de SNKHOUSE
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Pregúntame sobre productos, pedidos o envíos
            </p>
          </div>
        )}

        {visibleMessages.map((message: Message, index: number) => {
          // Check if message has product metadata
          const messageMetadata = (message as any).metadata || (message as any).data;
          const hasProducts = message.role === "assistant" && hasProductMetadata(messageMetadata);

          return (
            <div key={message.id || `msg-${index}`}>
              {/* Message Bubble */}
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                <div
                  className={`max-w-xs p-4 rounded-2xl shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <div
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        formatMarkdown(message.content),
                        {
                          ALLOWED_TAGS: [
                            "p",
                            "br",
                            "strong",
                            "em",
                            "a",
                            "ul",
                            "ol",
                            "li",
                          ],
                          ALLOWED_ATTR: ["href", "target", "rel"],
                        }
                      ),
                    }}
                  />
                  {message.createdAt && (
                    <div
                      className={`text-xs mt-2 opacity-70 ${
                        message.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString(
                        "es-AR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Cards (if assistant message has products) */}
              {hasProducts && messageMetadata.productIds && (
                <div className="flex justify-start mt-2">
                  <div className="max-w-xs w-full">
                    <ProductList
                      productIds={messageMetadata.productIds}
                      conversationId={conversationId || undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator - shown while AI is generating response */}
        {isLoading && (
          <div className="flex justify-start animate-fadeInSlide">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  Escribiendo...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={onSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
            aria-label="Mensaje"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-black font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            aria-label="Enviar mensaje"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
