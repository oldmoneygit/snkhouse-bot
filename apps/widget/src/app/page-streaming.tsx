"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, type Message } from "ai/react";
import DOMPurify from "dompurify";

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

export default function WidgetStreaming() {
  const [isOpen, setIsOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      data: {
        customerEmail,
        conversationId,
        pageContext: {
          url: typeof window !== "undefined" ? window.location.href : "",
          title: typeof window !== "undefined" ? document.title : "",
        },
      },
    },
    onResponse(response: Response) {
      console.log("🔄 [Widget] Stream response received:", response.status);

      // Extract metadata from headers
      const newConversationId = response.headers.get("X-Conversation-Id");
      const newEmail = response.headers.get("X-Email");

      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
        localStorage.setItem("snkhouse_conversation_id", newConversationId);
        console.log("💬 [Widget] Conversation ID updated:", newConversationId);
      }

      if (newEmail && newEmail !== customerEmail) {
        setCustomerEmail(newEmail);
        localStorage.setItem("snkhouse_customer_email", newEmail);
        console.log("📧 [Widget] Email updated:", sanitizeEmail(newEmail));
      }
    },
    onFinish(message: Message) {
      console.log("✅ [Widget] Stream finished:", {
        messageLength: message.content.length,
        role: message.role,
      });
    },
    onError(error: Error) {
      console.error("❌ [Widget] Stream error:", error);
    },
  });

  // Load customer data and history on mount
  useEffect(() => {
    async function loadHistory() {
      console.log("[Widget Streaming] Loading history...");

      const savedEmail = localStorage.getItem("snkhouse_customer_email");
      const savedConversationId = localStorage.getItem(
        "snkhouse_conversation_id"
      );

      // Se não tem email, mostrar modal
      if (!savedEmail) {
        console.log("[Widget Streaming] No saved email, showing prompt");
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
          // Convert to useChat() format
          const loadedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: new Date(msg.created_at),
          }));

          setMessages(loadedMessages);
          console.log(
            `✅ [Widget Streaming] Loaded ${loadedMessages.length} messages`
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
        console.error("[Widget Streaming] Error loading history:", error);
      }
    }

    loadHistory();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      "[Widget Streaming] Email validated and saved:",
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
  };

  // Email prompt modal
  if (showEmailPrompt) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowEmailPrompt(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setShowEmailPrompt(false);
          }
        }}
        tabIndex={-1}
      >
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Demo Page Content */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SNKHOUSE <span className="text-sm text-yellow-500">STREAMING</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tienda de zapatillas importadas de Argentina - Chat con IA en tiempo real
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">👟</div>
              <h3 className="text-lg font-semibold mb-2">Nike Air Max</h3>
              <p className="text-gray-600">Desde $998,99</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="text-lg font-semibold mb-2">Adidas Yeezy</h3>
              <p className="text-gray-600">Desde $955,47</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2">Air Jordan</h3>
              <p className="text-gray-600">Desde $1.299,99</p>
            </div>
          </div>
        </div>

        {/* Floating Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative group transition-all duration-300 transform ${
              isOpen ? "scale-90" : "scale-100 hover:scale-110"
            }`}
            aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
          >
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse opacity-30"></div>

            <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:shadow-3xl">
              <div className="transition-transform duration-300">
                {isOpen ? (
                  <svg
                    className="w-8 h-8"
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
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {messages.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                {messages.length}
              </div>
            )}
          </button>
        </div>

        {/* Chat Modal */}
        <div
          className={`fixed bottom-24 right-6 z-40 transition-all duration-500 ease-in-out transform ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 flex justify-between items-center">
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
                    En línea - Streaming
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-black hover:bg-opacity-10"
                aria-label="Cerrar chat"
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
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👋</div>
                  <p className="text-gray-600 font-medium">
                    ¡Hola! Soy tu asistente de SNKHOUSE
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Las respuestas aparecerán en tiempo real ⚡
                  </p>
                </div>
              )}

              {messages.map((message: Message, index: number) => (
                <div
                  key={message.id || `msg-${index}`}
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
              ))}

              {/* Loading indicator with streaming animation */}
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
                        Escribiendo en tiempo real...
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
            <div className="p-4 bg-white border-t border-gray-200">
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
        </div>
      </div>
    </div>
  );
}
