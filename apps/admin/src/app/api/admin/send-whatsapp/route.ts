/**
 * API Route: Envio de Mensagem WhatsApp (Manual)
 *
 * POST /api/admin/send-whatsapp
 *
 * Body: { phone: string, message: string, imageUrl?: string }
 * Response: { success: true, messageId: string, conversationId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppClient } from '@snkhouse/integrations';
import {
  findOrCreateCustomer,
  findOrCreateConversation,
  saveMessage,
} from '@/lib/whatsapp-helpers';

// Inicializar WhatsApp Client
const whatsappClient = new WhatsAppClient({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
});

interface SendWhatsAppRequest {
  phone: string;
  message: string;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  console.log('[SendWhatsAppAPI] 📤 POST /api/admin/send-whatsapp');

  try {
    // Extrair body
    const body: SendWhatsAppRequest = await request.json();
    const { phone, message, imageUrl } = body;

    console.log('[SendWhatsAppAPI] 📋 Request data:', {
      phone: phone?.slice(0, 4) + '***',
      messageLength: message?.length,
      hasImage: !!imageUrl,
    });

    // Validar dados obrigatórios
    if (!phone || !message) {
      console.error('[SendWhatsAppAPI] ❌ Missing required fields');
      return NextResponse.json(
        { error: 'Telefone e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato de telefone (apenas dígitos, 10-15 caracteres)
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      console.error('[SendWhatsAppAPI] ❌ Invalid phone format');
      return NextResponse.json(
        { error: 'Telefone inválido. Deve ter entre 10 e 15 dígitos.' },
        { status: 400 }
      );
    }

    // Validar comprimento da mensagem
    if (message.length === 0) {
      console.error('[SendWhatsAppAPI] ❌ Empty message');
      return NextResponse.json(
        { error: 'Mensagem não pode estar vazia' },
        { status: 400 }
      );
    }

    console.log('[SendWhatsAppAPI] ✅ Validation passed');

    // Step 1: Buscar/criar customer
    console.log('[SendWhatsAppAPI] 🔍 Finding or creating customer...');
    const customer = await findOrCreateCustomer(sanitizedPhone);

    // Step 2: Buscar/criar conversation
    console.log('[SendWhatsAppAPI] 🔍 Finding or creating conversation...');
    const conversation = await findOrCreateConversation(customer.id);

    // Step 3: Enviar via WhatsApp
    let whatsappMessageId: string;

    if (imageUrl) {
      // Enviar imagem com legenda
      console.log('[SendWhatsAppAPI] 📸 Sending image message...');
      const result = await whatsappClient.sendImageMessage({
        to: sanitizedPhone,
        imageUrl,
        caption: message,
      });
      whatsappMessageId = result.messageId;
      console.log('[SendWhatsAppAPI] ✅ Image sent:', whatsappMessageId);
    } else {
      // Enviar apenas texto
      console.log('[SendWhatsAppAPI] 💬 Sending text message...');
      const result = await whatsappClient.sendMessage({
        to: sanitizedPhone,
        message,
      });
      whatsappMessageId = result.messageId;
      console.log('[SendWhatsAppAPI] ✅ Text sent:', whatsappMessageId);
    }

    // Step 4: Salvar mensagem no banco
    console.log('[SendWhatsAppAPI] 💾 Saving message to database...');
    const savedMessage = await saveMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: message,
      imageUrl,
      whatsappMessageId,
    });

    console.log('[SendWhatsAppAPI] ✅ Message saved:', savedMessage.id);

    // Sucesso!
    console.log('[SendWhatsAppAPI] ✅✅✅ SUCCESS! ✅✅✅');
    return NextResponse.json({
      success: true,
      messageId: whatsappMessageId,
      conversationId: conversation.id,
      savedMessageId: savedMessage.id,
    });
  } catch (error: any) {
    console.error('[SendWhatsAppAPI] ❌ Error:', error);

    // Erros específicos do WhatsApp
    if (error.message?.includes('Meta API')) {
      return NextResponse.json(
        {
          error: 'Erro ao enviar mensagem via WhatsApp',
          details: error.message,
        },
        { status: 502 }
      );
    }

    // Erros do banco de dados
    if (error.message?.includes('Supabase') || error.message?.includes('banco')) {
      return NextResponse.json(
        {
          error: 'Erro ao salvar no banco de dados',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      {
        error: 'Erro ao processar requisição',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
