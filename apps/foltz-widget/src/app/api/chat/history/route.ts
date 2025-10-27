/**
 * FOLTZ Widget - Chat History API
 * Load conversation history
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@snkhouse/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const customerEmail = searchParams.get('customerEmail');

    console.log('📜 Loading history:', { conversationId, customerEmail });

    // Case 1: Load by conversation ID
    if (conversationId) {
      const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('id, role, content, metadata, created_at')
        .eq('conversation_id', conversationId)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading messages:', error);
        return NextResponse.json(
          { error: 'Failed to load messages' },
          { status: 500 },
        );
      }

      return NextResponse.json({ messages: messages || [] });
    }

    // Case 2: Load latest active conversation by email
    if (customerEmail) {
      // Find customer
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', customerEmail)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .single();

      if (!customer) {
        return NextResponse.json({ messages: [] });
      }

      // Find latest active conversation
      const { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .eq('channel', 'widget')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!conversation) {
        return NextResponse.json({ messages: [] });
      }

      // Load messages from that conversation
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('id, role, content, metadata, created_at')
        .eq('conversation_id', conversation.id)
        .eq('store_id', 'foltz') // ← FOLTZ filter
        .order('created_at', { ascending: true });

      return NextResponse.json({
        messages: messages || [],
        conversationId: conversation.id,
      });
    }

    return NextResponse.json(
      { error: 'conversationId or customerEmail required' },
      { status: 400 },
    );
  } catch (error) {
    console.error('❌ History API error:', error);
    return NextResponse.json(
      { error: 'Failed to load history' },
      { status: 500 },
    );
  }
}
