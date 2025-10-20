'use client';

/**
 * Componente de Seleção de Templates
 *
 * Features:
 * - Dropdown de templates por categoria
 * - Preview da mensagem
 * - Indicação de variáveis disponíveis
 */

import { MESSAGE_TEMPLATES, MessageTemplate } from '@/lib/templates';
import { FileText } from 'lucide-react';

interface TemplateSelectorProps {
  onTemplateSelect: (template: MessageTemplate) => void;
  disabled?: boolean;
}

export function TemplateSelector({
  onTemplateSelect,
  disabled,
}: TemplateSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;

    if (!templateId) {
      return;
    }

    const template = MESSAGE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  // Agrupar templates por categoria
  const templatesByCategory = MESSAGE_TEMPLATES.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category]?.push(template);
      return acc;
    },
    {} as Record<string, MessageTemplate[]>
  );

  const categoryLabels: Record<string, string> = {
    order: '📦 Pedidos',
    shipping: '🚚 Envio',
    support: '💬 Suporte',
    custom: '✏️ Personalizado',
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Template (opcional)
      </label>

      <div className="relative">
        <select
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Selecione um template...</option>

          {Object.entries(templatesByCategory).map(([category, templates]) => {
            const label = categoryLabels[category] ?? category;
            const categoryTemplates = templates.filter((t) => t.id !== 'custom');

            if (categoryTemplates.length === 0) return null;

            return (
              <optgroup key={category} label={label}>
                {categoryTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Selecione um template para preencher automaticamente a mensagem
      </p>
    </div>
  );
}
