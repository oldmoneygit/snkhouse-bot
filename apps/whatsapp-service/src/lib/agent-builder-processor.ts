import { runWorkflow } from '@snkhouse/agent-builder';
import { supabaseAdmin, type Conversation } from '@snkhouse/database';
// TODO: Re-enable analytics tracking
// import { analyticsTracker } from '@snkhouse/analytics';

export async function processMessageWithAgentBuilder({
  message,
  conversationId,
  customerId,
  customerPhone
}: {
  message: string;
  conversationId: string;
  customerId: string;
  customerPhone: string;
}) {
  const startTime = Date.now();

  try {
    console.log(`🤖 [Agent Builder Processor] Processing message for conv ${conversationId}`);

    // ========================================
    // STEP 1: Get conversation and thread_id
    // ========================================
    let threadId: string | null = null;

    try {
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('thread_id')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('⚠️ [Agent Builder Processor] Failed to fetch conversation:', convError.message);
      } else if (conversation) {
        threadId = conversation.thread_id || null;
        if (threadId) {
          console.log(`✅ [Agent Builder Processor] Using existing thread: ${threadId}`);
        } else {
          console.log('🆕 [Agent Builder Processor] No thread_id found, will create new thread');
        }
      }
    } catch (error: any) {
      console.error('⚠️ [Agent Builder Processor] Error fetching thread_id:', error.message);
    }

    // ========================================
    // STEP 2: Save user message to database
    // ========================================
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {
          channel: 'whatsapp',
          phone: customerPhone,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ [Agent Builder Processor] User message saved');
    } catch (dbError: any) {
      console.error('⚠️ [Agent Builder Processor] Failed to save user message:', dbError.message);
      // Continue anyway - message processing is more important than DB
    }

    // ========================================
    // STEP 3: Run Agent Builder workflow with thread_id
    // ========================================
    const result = await runWorkflow({
      input_as_text: message,
      ...(threadId && { thread_id: threadId }) // Pass existing thread_id if available
    });

    // Check if guardrails were triggered (result will have pii/moderation/etc if guardrails failed)
    if ('pii' in result || 'moderation' in result) {
      console.warn('⚠️ [Agent Builder Processor] Guardrails triggered');

      // Save guardrails trigger to database
      try {
        await supabaseAdmin.from('messages').insert({
          conversation_id: conversationId,
          role: 'system',
          content: 'Guardrails triggered',
          metadata: {
            channel: 'whatsapp',
            guardrails_triggered: true,
            guardrails_result: result,
            timestamp: new Date().toISOString()
          }
        });
      } catch (dbError: any) {
        console.error('⚠️ [Agent Builder Processor] Failed to save guardrails message:', dbError.message);
      }

      return 'Disculpá, no puedo procesar ese mensaje. ¿Podrías reformularlo de otra manera?';
    }

    // Get the response text (result has output_text if guardrails passed)
    const responseText = 'output_text' in result ? result.output_text : 'No response';
    const newThreadId = 'thread_id' in result ? result.thread_id : null;

    // ========================================
    // STEP 4: Save thread_id if it's new or updated
    // ========================================
    if (newThreadId && newThreadId !== threadId) {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('conversations')
          .update({ thread_id: newThreadId })
          .eq('id', conversationId);

        if (updateError) {
          console.error('⚠️ [Agent Builder Processor] Failed to save thread_id:', updateError.message);
        } else {
          console.log(`✅ [Agent Builder Processor] Thread ID saved: ${newThreadId}`);
        }
      } catch (error: any) {
        console.error('⚠️ [Agent Builder Processor] Error saving thread_id:', error.message);
      }
    }

    // ========================================
    // STEP 5: Save assistant response to database
    // ========================================
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: responseText,
        metadata: {
          channel: 'whatsapp',
          execution_time_ms: Date.now() - startTime,
          thread_id: newThreadId, // Store thread_id in metadata for reference
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ [Agent Builder Processor] Assistant response saved');
    } catch (dbError: any) {
      console.error('⚠️ [Agent Builder Processor] Failed to save assistant response:', dbError.message);
      // Continue anyway - we still want to send the response
    }

    // TODO: Track analytics
    // await analyticsTracker.track({ ... });

    console.log(`✅ [Agent Builder Processor] Processed in ${Date.now() - startTime}ms`);

    return responseText;

  } catch (error: any) {
    console.error('❌ [Agent Builder Processor] Error:', error);

    // TODO: Track error analytics
    // await analyticsTracker.trackError({ ... });

    // Save error message to database
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'system',
        content: `Error: ${error.message}`,
        metadata: {
          channel: 'whatsapp',
          error: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      console.error('⚠️ [Agent Builder Processor] Failed to save error message');
    }

    // Return fallback message
    return 'Disculpá, tuve un problema técnico. ¿Podés intentar de nuevo en unos segundos?';
  }
}
