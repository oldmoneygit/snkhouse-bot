'use client';

/**
 * Componente de Upload de Imagem
 *
 * Features:
 * - Drag & Drop
 * - Click to upload
 * - Preview da imagem
 * - Validação (5MB, jpg/png)
 * - Remove imagem
 */

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo inválido. Permitidos: JPG, PNG';
    }

    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `Arquivo muito grande (${sizeMB}MB). Máximo: 5MB`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);

    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notificar parent
    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        handleFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        handleFile(file);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {!preview ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#FFED00]'}
            ${isDragging ? 'border-[#FFED00] bg-yellow-50' : 'border-gray-300'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                Clique ou arraste uma imagem
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG ou PNG, máximo 5MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Preview
        <div className="relative border-2 border-gray-200 rounded-lg p-4">
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <ImageIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="font-medium">Imagem selecionada</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Clique no X para remover
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
