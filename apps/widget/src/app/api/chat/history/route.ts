import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@snkhouse/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const customerEmail = searchParams.get("customerEmail");

  // Validação
  if (!conversationId && !customerEmail) {
    return NextResponse.json({
      messages: [],
      conversationId: null,
    });
  }

  try {
    // CENÁRIO 1: Tem conversationId (direto)
    if (conversationId) {
      const { data: messages, error } = await supabaseAdmin
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return NextResponse.json({
        messages: messages || [],
        conversationId,
      });
    }

    // CENÁRIO 2: Tem apenas email (buscar última conversa)
    if (customerEmail) {
      // Step 1: Buscar customer
      const { data: customer, error: customerError } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("email", customerEmail.toLowerCase())
        .maybeSingle();

      if (customerError) throw customerError;
      if (!customer) {
        return NextResponse.json({ messages: [], conversationId: null });
      }

      // Step 2: Buscar última conversa ativa
      const { data: conversation, error: convError } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("channel", "widget")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) throw convError;
      if (!conversation) {
        return NextResponse.json({ messages: [], conversationId: null });
      }

      // Step 3: Buscar mensagens dessa conversa
      const { data: messages, error: msgError } = await supabaseAdmin
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      return NextResponse.json({
        messages: messages || [],
        conversationId: conversation.id,
      });
    }

    return NextResponse.json({ messages: [], conversationId: null });
  } catch (error) {
    console.error("[History API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load history", messages: [] },
      { status: 500 },
    );
  }
}
