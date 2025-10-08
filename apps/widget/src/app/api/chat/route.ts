import { NextRequest, NextResponse } from 'next/server';
import { generateResponseWithFallback } from '@snkhouse/ai-agent';
import * as path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env.local') });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    console.log('🤖 [Widget API] Recibiendo mensaje:', message);

    // Generar respuesta usando el agente IA
    const response = await generateResponseWithFallback([
      { role: 'user', content: message }
    ]);

    console.log('🤖 [Widget API] Respuesta generada:', response.model);

    return NextResponse.json({
      message: response.content,
      model: response.model,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [Widget API] Error:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'Lo siento, hubo un error. Por favor intenta de nuevo.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'SNKHOUSE Widget API funcionando',
    timestamp: new Date().toISOString()
  });
}
