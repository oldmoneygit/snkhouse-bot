"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
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
 * TASK 6: Robust email validation (RFC 5322 compliant)
 * Valida formato de email com regex simplificado mas robusto
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  // RFC 5322 Official Standard (simplified)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim());
}

// Función para convertir markdown simple a HTML
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold** -> <strong>bold</strong>
    .replace(/\*(.*?)\*/g, "<em>$1</em>"); // *italic* -> <em>italic</em>
}

/**
 * TASK 5: Retry logic with exponential backoff
 * Implements retry with delays: 1s → 2s → 4s
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Widget] Attempt ${attempt + 1}/${maxRetries}...`);
      const response = await fetch(url, options);

      // Se resposta OK, retornar imediatamente
      if (response.ok) {
        return response;
      }

      // Se erro do servidor (5xx), tentar novamente
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Se erro do cliente (4xx), não tentar novamente
      if (response.status >= 400) {
        console.error(`[Widget] Client error ${response.status}, not retrying`);
        return response;
      }

      // Qualquer outro status, retornar
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `[Widget] Attempt ${attempt + 1} failed:`,
        lastError.message,
      );

      // Se não é a última tentativa, esperar antes de retry
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`[Widget] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Todas as tentativas falharam
  throw lastError || new Error("All retries failed");
}

export default function Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // TASK 2: Persist conversationId in localStorage
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("snkhouse_conversation_id");
    }
    return null;
  });

  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TASK 3: Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      console.log("[Widget] Loading history...");

      // Buscar dados salvos
      const savedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("snkhouse_customer_email")
          : null;
      const savedConversationId =
        typeof window !== "undefined"
          ? localStorage.getItem("snkhouse_conversation_id")
          : null;

      // Se não tem nada salvo, mostrar modal
      if (!savedEmail && !savedConversationId) {
        console.log("[Widget] No saved data, showing email prompt");
        setShowEmailPrompt(true);
        return;
      }

      try {
        // Construir query params
        const params = new URLSearchParams();
        if (savedConversationId) {
          params.append("conversationId", savedConversationId);
          console.log(
            "[Widget] Loading by conversationId:",
            savedConversationId,
          );
        } else if (savedEmail) {
          params.append("customerEmail", savedEmail);
          console.log("[Widget] Loading by email:", savedEmail);
        }

        // Chamar API
        const response = await fetch(`/api/chat/history?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Se retornou mensagens, carregar
        if (data.messages && data.messages.length > 0) {
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));

          setMessages(loadedMessages);
          console.log(`✅ [Widget] Loaded ${loadedMessages.length} messages`);

          // Auto-scroll para última mensagem
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          console.log("[Widget] No messages found");
        }

        // Atualizar conversationId se retornou
        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem("snkhouse_conversation_id", data.conversationId);
          console.log("[Widget] Conversation ID updated:", data.conversationId);
        }

        // Atualizar email se tinha salvo
        if (savedEmail) {
          setCustomerEmail(savedEmail);
          console.log("[Widget] Email restored:", savedEmail);
        } else {
          // Se não tem email salvo, mostrar modal
          setShowEmailPrompt(true);
        }
      } catch (error) {
        console.error("[Widget] Error loading history:", error);
        // Em caso de erro, mostrar modal de email
        setShowEmailPrompt(true);
      }
    }

    loadHistory();
  }, []);

  // TASK 2: Save conversationId to localStorage when it changes
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("snkhouse_conversation_id", conversationId);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TASK 6: Handle email submission with robust validation
  const handleEmailSubmit = () => {
    const trimmedEmail = emailInput.trim();

    if (!isValidEmail(trimmedEmail)) {
      alert("Por favor, ingresá un email válido (ej: tu@email.com)");
      return;
    }

    // Email válido - salvar e continuar
    localStorage.setItem("snkhouse_customer_email", trimmedEmail);
    setCustomerEmail(trimmedEmail);
    setShowEmailPrompt(false);
    console.log(
      "[Widget] Email validated and saved:",
      sanitizeEmail(trimmedEmail),
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!customerEmail) {
      setShowEmailPrompt(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    const historyForRequest = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // TASK 5: Use fetchWithRetry for resilience
      const response = await fetchWithRetry("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: historyForRequest,
          conversationId,
          customerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la API");
      }

      const data = await response.json();

      // Atualizar email se foi detectado um novo na conversa
      if (data.emailUpdated && data.newEmail) {
        console.log("🔄 [Widget] Email actualizado dinámicamente:", {
          anterior: customerEmail ? sanitizeEmail(customerEmail) : "null",
          nuevo: sanitizeEmail(data.newEmail),
        });
        localStorage.setItem("snkhouse_customer_email", data.newEmail);
        setCustomerEmail(data.newEmail);
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, hubo un error. Por favor intenta de nuevo.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // TASK 4: Modal não-invasivo (dismissível, ESC, autoFocus, privacy note)
  if (showEmailPrompt) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          // Cerrar al hacer clic en el overlay (fondo)
          if (e.target === e.currentTarget) {
            setShowEmailPrompt(false);
          }
        }}
        onKeyDown={(e) => {
          // Cerrar con ESC
          if (e.key === "Escape") {
            setShowEmailPrompt(false);
          }
        }}
        tabIndex={-1}
      >
        <div className="bg-white rounded-xl p-6 max-w-sm w-full relative">
          {/* Botón de cerrar (X) */}
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SNKHOUSE</h1>
          <p className="text-xl text-gray-600 mb-8">
            Tienda de zapatillas importadas de Argentina
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
          {/* Chat Button with Animation */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative group transition-all duration-300 transform ${
              isOpen ? "scale-90" : "scale-100 hover:scale-110"
            }`}
            aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
          >
            {/* Pulse Animation */}
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse opacity-30"></div>

            {/* Main Button */}
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

            {/* Notification Badge */}
            {messages.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                {messages.length}
              </div>
            )}
          </button>
        </div>

        {/* Chat Modal with Beautiful Animation */}
        <div
          className={`fixed bottom-24 right-6 z-40 transition-all duration-500 ease-in-out transform ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header with Gradient */}
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
                  <p className="text-xs opacity-80">En línea ahora</p>
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
                    ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-xs p-4 rounded-2xl shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    {/* TASK 1: XSS Protection - DOMPurify sanitization */}
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
                              "code",
                              "pre",
                              "blockquote",
                              "h1",
                              "h2",
                              "h3",
                              "h4",
                              "h5",
                              "h6",
                            ],
                            ALLOWED_ATTR: ["href", "target", "rel", "class"],
                            ALLOW_DATA_ATTR: false,
                            ALLOWED_URI_REGEXP:
                              /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                          },
                        ),
                      }}
                    />
                    <div
                      className={`text-xs mt-2 opacity-70 ${
                        message.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-4 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Escribiendo...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                  aria-label="Mensaje"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
