/**
 * Helper para Supabase Storage - Upload de Imagens WhatsApp
 */

import { supabase } from '@snkhouse/database';

const BUCKET_NAME = 'whatsapp-media';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export interface UploadImageResult {
  url: string; // URL pública da imagem
  path: string; // Path no bucket
  size: number; // Tamanho em bytes
}

/**
 * Valida arquivo antes de fazer upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Permitidos: JPG, PNG. Recebido: ${file.type}`,
    };
  }

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: 5MB. Recebido: ${sizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Faz upload de imagem para Supabase Storage
 *
 * @param file - Arquivo de imagem (File object do browser)
 * @returns URL pública da imagem
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  console.log('[SupabaseStorage] 📤 uploadImage called');
  console.log('[SupabaseStorage] 📋 File info:', {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
  });

  // Validar arquivo
  const validation = validateImageFile(file);
  if (!validation.valid) {
    console.error('[SupabaseStorage] ❌ Validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Gerar nome único para o arquivo (timestamp + nome sanitizado)
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    console.log('[SupabaseStorage] 📝 Generated filename:', fileName);

    // Fazer upload
    console.log('[SupabaseStorage] 🚀 Uploading to bucket:', BUCKET_NAME);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600', // Cache por 1 hora
        upsert: false, // Não sobrescrever se existir
      });

    if (error) {
      console.error('[SupabaseStorage] ❌ Upload error:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    if (!data) {
      console.error('[SupabaseStorage] ❌ No data returned from upload');
      throw new Error('Erro ao fazer upload: nenhum dado retornado');
    }

    console.log('[SupabaseStorage] ✅ Upload successful:', data.path);

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!urlData || !urlData.publicUrl) {
      console.error('[SupabaseStorage] ❌ Failed to get public URL');
      throw new Error('Erro ao gerar URL pública');
    }

    const publicUrl = urlData.publicUrl;
    console.log('[SupabaseStorage] 🔗 Public URL:', publicUrl);

    return {
      url: publicUrl,
      path: data.path,
      size: file.size,
    };
  } catch (error: any) {
    console.error('[SupabaseStorage] ❌ Error:', error);
    throw error;
  }
}

/**
 * Deleta imagem do Supabase Storage
 *
 * @param path - Path do arquivo no bucket (ex: "1234567_image.jpg")
 */
export async function deleteImage(path: string): Promise<void> {
  console.log('[SupabaseStorage] 🗑️ deleteImage called');
  console.log('[SupabaseStorage] 📋 Path:', path);

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error('[SupabaseStorage] ❌ Delete error:', error);
      throw new Error(`Erro ao deletar imagem: ${error.message}`);
    }

    console.log('[SupabaseStorage] ✅ Image deleted successfully');
  } catch (error: any) {
    console.error('[SupabaseStorage] ❌ Error:', error);
    throw error;
  }
}

/**
 * Lista todas as imagens no bucket (útil para debug/admin)
 */
export async function listImages(): Promise<string[]> {
  console.log('[SupabaseStorage] 📋 listImages called');

  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list();

    if (error) {
      console.error('[SupabaseStorage] ❌ List error:', error);
      throw new Error(`Erro ao listar imagens: ${error.message}`);
    }

    const paths = (data ?? []).map((file) => file.name);
    console.log('[SupabaseStorage] ✅ Found', paths.length, 'images');

    return paths;
  } catch (error: any) {
    console.error('[SupabaseStorage] ❌ Error:', error);
    throw error;
  }
}
