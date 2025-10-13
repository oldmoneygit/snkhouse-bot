import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { z } from 'zod';
import { woocommerceClient } from './woocommerce';
import { supabaseAdmin } from '@snkhouse/database';
import { buildSystemPrompt } from './system-prompt';

/**
 * Process message with Claude + WooCommerce tools
 */
export async function processMessageWithClaude({
  message,
  conversationId,
  customerId,
  customerPhone
}: {
  message: string;
  conversationId: string;
  customerId: string;
  customerPhone: string;
}): Promise<string> {
  const startTime = Date.now();

  console.log(`🤖 [Claude Processor] Processing message for conv ${conversationId}`);

  try {
    // ========================================
    // STEP 0: Load conversation history from database
    // ========================================
    let conversationHistory: any[] = [];

    try {
      const { data: historyData, error: historyError } = await supabaseAdmin
        .from('messages')
        .select('role, content, metadata, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false }) // Get LATEST messages first
        .limit(25); // Last 25 messages for context (expanded for better memory)

      if (historyError) {
        console.error('⚠️ [Claude Processor] Failed to load history:', historyError.message);
      } else if (historyData && historyData.length > 0) {
        conversationHistory = historyData
          .filter((msg: any) => msg.role !== 'system') // Exclude system/error messages
          .reverse() // Reverse to chronological order (oldest first)
          .map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }));

        console.log(`📚 [Claude Processor] Loaded ${conversationHistory.length} messages from history`);

        // 🔍 DEBUG: Log history content to verify what's being passed to Claude
        console.log('🔍 [Claude Processor] History preview (last 5 messages):');
        conversationHistory.slice(-5).forEach((msg: any, idx: number) => {
          console.log(`   [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 80)}...`);
        });

        // 📊 DEBUG: Estimate context size
        const historyTokensEstimate = conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0) / 4;
        console.log(`📊 [Claude Processor] Estimated history tokens: ~${Math.round(historyTokensEstimate)}`);

      } else {
        console.log('📚 [Claude Processor] No conversation history found (new conversation)');
      }
    } catch (historyError: any) {
      console.error('⚠️ [Claude Processor] History loading error:', historyError.message);
      // Continue without history if loading fails
    }

    // ========================================
    // STEP 1: Save user message to database
    // ========================================
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {
          channel: 'whatsapp',
          phone: customerPhone,
          processor: 'claude',
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ [Claude Processor] User message saved');
    } catch (dbError: any) {
      console.error('⚠️ [Claude Processor] Failed to save user message:', dbError.message);
    }

    // ========================================
    // STEP 2: Run Claude with WooCommerce tools (with continuation loop)
    // ========================================

    // Build system prompt with full Knowledge Base (optimized for prompt caching)
    const systemPrompt = buildSystemPrompt();

    // 📊 DEBUG: Log system prompt size for cache monitoring
    const systemPromptTokensEstimate = systemPrompt.length / 4;
    console.log(`📊 [Claude Processor] System prompt size: ~${Math.round(systemPromptTokensEstimate)} tokens (will be cached by Anthropic)`);

    // First call - may return tool calls
    let result = await generateText({
      model: anthropic('claude-3-5-haiku-latest'), // Using Haiku - cheapest option ($0.80 vs $3/1M) with great tool calling
      system: systemPrompt,
      messages: [
        ...conversationHistory, // Include conversation history for context
        {
          role: 'user',
          content: message
        }
      ],
      tools: {
        // =====================================
        // TOOL 1: Search Products
        // =====================================
        searchProducts: {
          description: 'Buscar productos en el catálogo por nombre, marca o modelo (ej: "jordan 1", "nike dunk", "yeezy"). Retorna hasta {limit} productos con ID, nombre, precio, stock y URL.',
          inputSchema: z.object({
            query: z.string().describe('Término de búsqueda (ej: "jordan 1", "nike dunk")'),
            limit: z.number().int().optional().default(5).describe('Cantidad máxima de resultados (default 5)')
          }),
          execute: async ({ query, limit }: { query: string; limit?: number }) => {
            console.log(`[Claude Tool] searchProducts: "${query}", limit: ${limit}`);

            try {
              const response = await woocommerceClient.get('/products', {
                params: {
                  search: query,
                  per_page: limit,
                  status: 'publish',
                  _fields: 'id,name,price,images,stock_status,permalink'
                }
              });

              const products = response.data.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: `$${p.price} ARS`,
                stock: p.stock_status === 'instock' ? 'En stock' : 'Sin stock',
                url: p.permalink,
                image: p.images?.[0]?.src || null
              }));

              console.log(`[Claude Tool] ✅ Found ${products.length} products`);

              return {
                found: true,
                count: products.length,
                products
              };
            } catch (error: any) {
              console.error('[Claude Tool] ❌ searchProducts error:', error.message);
              return {
                found: false,
                error: 'Error al buscar productos'
              };
            }
          }
        },

        // =====================================
        // TOOL 2: Get Order Details
        // =====================================
        getOrderDetails: {
          description: 'Obtener detalles completos de un pedido usando número de pedido y email del cliente. IMPORTANTE: Requiere validación de email para proteger datos personales. Retorna estado, productos, dirección, tracking, fechas.',
          inputSchema: z.object({
            order_id: z.string().describe('Número del pedido (ej: "27072")'),
            email: z.string().email().describe('Email del cliente para validación de ownership')
          }),
          execute: async ({ order_id, email }: { order_id: string; email: string }) => {
            console.log(`[Claude Tool] getOrderDetails: order=${order_id}, email=${email.substring(0, 5)}***`);

            try {
              // Fetch order from WooCommerce
              const response = await woocommerceClient.get(`/orders/${order_id}`);
              const order = response.data;

              // 🔒 CRITICAL: Validate ownership (security)
              if (order.billing.email.toLowerCase() !== email.toLowerCase()) {
                console.warn('[Claude Tool] ⚠️ Ownership validation failed');
                return {
                  found: false,
                  error: 'No encontré ese pedido con ese email. Verificá los datos.'
                };
              }

              // Map status to Spanish
              const statusMap: Record<string, string> = {
                'pending': 'Pendiente de pago',
                'processing': 'En preparación',
                'on-hold': 'En espera',
                'completed': 'Entregado',
                'cancelled': 'Cancelado',
                'refunded': 'Reembolsado',
                'failed': 'Pago fallido'
              };

              const orderDetails = {
                found: true,
                id: order.id,
                number: order.number,
                status: statusMap[order.status] || order.status,
                total: `$${order.total} ARS`,
                date: new Date(order.date_created).toLocaleDateString('es-AR'),
                products: order.line_items.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: `$${item.price} ARS`
                })),
                shipping_address: order.shipping ? {
                  address: order.shipping.address_1,
                  city: order.shipping.city,
                  state: order.shipping.state,
                  postcode: order.shipping.postcode
                } : null,
                tracking: order.meta_data?.find((m: any) => m.key === '_tracking_number')?.value || null
              };

              console.log(`[Claude Tool] ✅ Order found: #${order.number}, status: ${order.status}`);

              return orderDetails;
            } catch (error: any) {
              if (error.response?.status === 404) {
                console.warn('[Claude Tool] ⚠️ Order not found');
                return {
                  found: false,
                  error: 'Pedido no encontrado'
                };
              }

              console.error('[Claude Tool] ❌ getOrderDetails error:', error.message);
              return {
                found: false,
                error: 'Error al consultar el pedido. Intentá de nuevo.'
              };
            }
          }
        },

        // =====================================
        // TOOL 3: Check Product Stock
        // =====================================
        checkProductStock: {
          description: 'Verificar disponibilidad de stock de un producto específico y opcionalmente un talle. Retorna si está disponible, cantidad de unidades y precio.',
          inputSchema: z.object({
            product_id: z.string().describe('ID del producto (viene de searchProducts)'),
            size: z.string().optional().describe('Talle específico a verificar (ej: "42", "M", "L")')
          }),
          execute: async ({ product_id, size }: { product_id: string; size?: string }) => {
            console.log(`[Claude Tool] checkProductStock: product_id=${product_id}, size=${size || 'N/A'}`);

            try {
              const response = await woocommerceClient.get(`/products/${product_id}`);
              const product = response.data;

              const stockInfo = {
                in_stock: product.stock_status === 'instock',
                quantity: product.stock_quantity || null,
                name: product.name,
                price: `$${product.price} ARS`,
                size_requested: size || null
              };

              // TODO: Future enhancement - check specific size from variations
              // For now, return general stock info
              if (size) {
                console.log(`[Claude Tool] ⚠️ Size-specific stock not implemented yet, returning general stock`);
              }

              console.log(`[Claude Tool] ✅ Stock check: ${stockInfo.in_stock ? 'Available' : 'Out of stock'}`);

              return stockInfo;
            } catch (error: any) {
              if (error.response?.status === 404) {
                console.warn('[Claude Tool] ⚠️ Product not found');
                return {
                  error: 'Producto no encontrado'
                };
              }

              console.error('[Claude Tool] ❌ checkProductStock error:', error.message);
              return {
                error: 'Error al verificar stock'
              };
            }
          }
        }
      }
    });

    // DEBUG: Log the full result object to understand what's happening
    console.log('🔍 [Claude Processor] DEBUG result (first call):', {
      hasText: !!result.text,
      textLength: result.text?.length || 0,
      textPreview: result.text?.substring(0, 100) || 'EMPTY',
      finishReason: result.finishReason,
      toolCalls: result.toolCalls?.length || 0,
      toolResults: result.toolResults?.length || 0,
      steps: result.steps?.length || 0
    });

    // ========================================
    // STEP 2.5: Continue if tools were called to get final response with results
    // ========================================
    let responseText = result.text;

    // If we have tool calls, ALWAYS continue to get response with tool results
    if (result.finishReason === 'tool-calls' && result.toolResults && result.toolResults.length > 0) {
      console.log('🔄 [Claude Processor] Tool calls detected, continuing to generate response with results...');

      try {
        // Build messages from steps - use step.response.messages which has proper format
        const continueMessages: any[] = [
          // Conversation history for context
          ...conversationHistory,
          // Original user message
          {
            role: 'user',
            content: message
          },
          // Messages from the step response (assistant + tool) - already properly formatted by SDK
          ...result.steps.flatMap((step: any) => step.response?.messages || [])
        ];

        console.log('🔍 [Claude Processor] Continue messages:', {
          count: continueMessages.length,
          types: continueMessages.map((m: any) => m?.role || 'unknown')
        });

        // Continue generation with tool results
        const continueResult = await generateText({
          model: anthropic('claude-3-5-haiku-latest'),
          system: systemPrompt,
          messages: continueMessages
        });

        console.log('🔍 [Claude Processor] DEBUG result (after continuation):', {
          hasText: !!continueResult.text,
          textLength: continueResult.text?.length || 0,
          textPreview: continueResult.text?.substring(0, 100),
          finishReason: continueResult.finishReason
        });

        // Use text from continuation
        responseText = continueResult.text;
      } catch (continueError: any) {
        console.error('⚠️ [Claude Processor] Continuation failed:', continueError.message);
        // responseText will remain as result.text (which should be empty)
      }
    }

    // Fallback if still empty
    if (!responseText) {
      responseText = 'Disculpá, no pude procesar tu mensaje.';
    }

    console.log(`✅ [Claude Processor] Response generated:`, {
      duration: Date.now() - startTime,
      responseLength: responseText.length,
      usage: result.usage
    });

    // ========================================
    // STEP 3: Save assistant response to database
    // ========================================
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: responseText,
        metadata: {
          channel: 'whatsapp',
          processor: 'claude',
          model: 'claude-3-5-haiku-latest',
          execution_time_ms: Date.now() - startTime,
          usage: result.usage,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ [Claude Processor] Assistant response saved');
    } catch (dbError: any) {
      console.error('⚠️ [Claude Processor] Failed to save assistant response:', dbError.message);
    }

    return responseText;

  } catch (error: any) {
    console.error('❌ [Claude Processor] Error:', {
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });

    // Save error message to database
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'system',
        content: `Error: ${error.message}`,
        metadata: {
          channel: 'whatsapp',
          processor: 'claude',
          error: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      console.error('⚠️ [Claude Processor] Failed to save error message');
    }

    // Return fallback message
    return 'Disculpá, tuve un problema técnico. ¿Podés intentar de nuevo en unos segundos?';
  }
}
