/**
 * API Route: Upload de Imagem para Supabase Storage
 *
 * POST /api/admin/upload-image
 *
 * Body: multipart/form-data com campo "image"
 * Response: { url: string, path: string, size: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, validateImageFile } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  console.log('[UploadImageAPI] 📤 POST /api/admin/upload-image');

  try {
    // Extrair FormData
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      console.error('[UploadImageAPI] ❌ No file provided');
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    console.log('[UploadImageAPI] 📋 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    });

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error('[UploadImageAPI] ❌ Validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Fazer upload
    console.log('[UploadImageAPI] 🚀 Starting upload...');
    const result = await uploadImage(file);

    console.log('[UploadImageAPI] ✅ Upload successful:', result);

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      size: result.size,
    });
  } catch (error: any) {
    console.error('[UploadImageAPI] ❌ Error:', error);

    return NextResponse.json(
      {
        error: 'Erro ao fazer upload da imagem',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
