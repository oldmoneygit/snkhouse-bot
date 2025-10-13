import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@snkhouse/database";

/**
 * POST /api/chat/save-message
 *
 * Saves a message to Supabase AFTER streaming completes
 *
 * Called by frontend's onFinish() callback from useChat()
 * This is fire-and-forget - doesn't block UI
 *
 * Flow:
 * 1. User message streams → saved immediately
 * 2. AI response streams → saved when complete (this endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      conversationId,
      role,
      content,
    }: {
      conversationId: string;
      role: "user" | "assistant" | "system";
      content: string;
    } = body;

    // Validation
    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 },
      );
    }

    if (!["user", "assistant", "system"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    console.log("💾 [Save Message] Saving:", {
      conversationId,
      role,
      contentLength: content.length,
    });

    // Save to Supabase
    const { error } = await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });

    if (error) {
      console.error("❌ [Save Message] Error:", error);
      return NextResponse.json(
        { error: "Error al guardar mensaje" },
        { status: 500 },
      );
    }

    console.log("✅ [Save Message] Saved successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [Save Message] Unexpected error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
