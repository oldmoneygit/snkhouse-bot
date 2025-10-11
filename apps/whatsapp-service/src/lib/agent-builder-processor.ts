import { runAgentWorkflow } from '@snkhouse/agent-builder';
import { supabaseAdmin } from '@snkhouse/database';
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

    // Save user message to database
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

    // Run Agent Builder workflow
    const result = await runAgentWorkflow({
      message,
      conversationId,
      customerId
    });

    if (!result.success) {
      throw new Error(result.error || 'Agent failed');
    }

    // Save assistant response to database
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: result.response,
        metadata: {
          channel: 'whatsapp',
          execution_time_ms: result.execution_time_ms,
          guardrails_triggered: result.guardrails_triggered || false,
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

    return result.response;

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
