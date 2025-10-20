# 📱 Feature: Envio Manual de Mensagens WhatsApp

## 📝 Resumo

Sistema completo para enviar mensagens e fotos manualmente para clientes via WhatsApp através do Admin Dashboard.

**Status**: ✅ Implementado (aguardando testes)

**Data**: 2025-01-20

---

## 🎯 Funcionalidades Implementadas

### 1. **Interface de Envio** (`/admin/whatsapp`)
- ✅ Formulário para enviar mensagens/fotos
- ✅ Input de telefone com validação
- ✅ Seletor de templates pré-definidos
- ✅ Textarea para mensagem (editável)
- ✅ Upload de imagem (drag & drop + botão)
- ✅ Preview da imagem antes de enviar
- ✅ Estados de loading/success/error

### 2. **Sistema de Templates**
- ✅ Templates por categoria (Pedidos, Envio, Suporte)
- ✅ Variáveis substituíveis: `{nome}`, `{numero}`, `{tracking}`, `{data}`, `{produto}`
- ✅ Templates pré-definidos:
  - Pedido sendo embalado
  - Pedido pronto para envio
  - Pedido enviado
  - Pedido em trânsito
  - Saiu para entrega
  - Troca de tamanho
  - Dúvida sobre produto

### 3. **Upload de Imagens**
- ✅ Suporte a JPG/PNG
- ✅ Máximo 5MB por arquivo
- ✅ Upload para Supabase Storage
- ✅ URL pública gerada automaticamente
- ✅ Validação de tipo e tamanho

### 4. **Integração WhatsApp**
- ✅ Envio de mensagens de texto
- ✅ Envio de imagens com legenda
- ✅ Uso da WhatsApp Cloud API oficial (Meta)
- ✅ Logs detalhados para debug

### 5. **Histórico no Banco**
- ✅ Busca/criação automática de customer pelo telefone
- ✅ Busca/criação automática de conversation
- ✅ Mensagens salvas no histórico
- ✅ Metadata: `sent_by: 'admin'`, `image_url`

### 6. **Lista de Conversas**
- ✅ Últimas 10 conversas WhatsApp
- ✅ Nome, telefone, status, data
- ✅ Link para visualizar conversa completa

---

## 📦 Arquivos Criados

### Backend
- `apps/admin/src/app/api/admin/upload-image/route.ts` - Upload para Supabase
- `apps/admin/src/app/api/admin/send-whatsapp/route.ts` - Envio via WhatsApp
- `apps/admin/src/lib/templates.ts` - Sistema de templates
- `apps/admin/src/lib/supabase-storage.ts` - Helper Supabase Storage
- `apps/admin/src/lib/whatsapp-helpers.ts` - Helpers customer/conversation
- `packages/integrations/src/whatsapp/client.ts` - Adicionado `sendImageMessage()`

### Frontend
- `apps/admin/src/app/whatsapp/page.tsx` - Página principal
- `apps/admin/src/components/whatsapp/SendMessageForm.tsx` - Formulário
- `apps/admin/src/components/whatsapp/ImageUpload.tsx` - Upload de imagem
- `apps/admin/src/components/whatsapp/TemplateSelector.tsx` - Seletor de templates
- `apps/admin/src/components/whatsapp/ConversationList.tsx` - Lista de conversas

### Documentação
- `docs/SUPABASE_STORAGE_SETUP.md` - Instruções para configurar bucket

---

## 🔧 Setup Necessário

### 1. **Supabase Storage**

Você precisa criar o bucket `whatsapp-media` no Supabase. Siga as instruções em:

📄 **[docs/SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)**

Resumo rápido:
1. Acesse Supabase Dashboard → Storage
2. Crie bucket `whatsapp-media` (público)
3. Configure políticas (INSERT, SELECT, DELETE)
4. Teste fazendo upload manual de uma imagem

### 2. **Variáveis de Ambiente**

As variáveis do WhatsApp já devem estar configuradas:

```env
# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=https://czueuxqhmifgofuflscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 🚀 Como Testar

### 1. **Iniciar o Admin**

```bash
cd apps/admin
pnpm dev
```

Acesse: http://localhost:3001

### 2. **Navegar para WhatsApp**

No dashboard, clique em **WhatsApp** no menu de navegação.

### 3. **Teste 1: Enviar Mensagem de Texto**

1. Digite um telefone válido: `5491112345678` (código do país + número)
2. Selecione um template ou escreva mensagem do zero
3. Clique em **Enviar Mensagem**
4. ✅ Deve mostrar mensagem de sucesso
5. ✅ Verificar no WhatsApp do cliente se recebeu
6. ✅ Verificar no banco de dados se salvou:
   ```sql
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;
   ```

### 4. **Teste 2: Enviar Foto com Mensagem**

1. Digite um telefone válido
2. Escreva uma mensagem (pode usar template)
3. Arraste uma imagem para o upload (ou clique para selecionar)
4. ✅ Deve mostrar preview da imagem
5. Clique em **Enviar Mensagem**
6. ✅ Deve mostrar mensagem de sucesso
7. ✅ Verificar no WhatsApp se recebeu a foto com legenda
8. ✅ Verificar no Supabase Storage se a imagem foi salva:
   - Acesse Storage → whatsapp-media
   - Deve ter arquivo `{timestamp}_nome_arquivo.jpg`

### 5. **Teste 3: Variáveis nos Templates**

1. Selecione template "Pedido sendo embalado"
2. Mensagem aparece com `{nome}` e `{numero}`
3. Edite manualmente: substitua `{nome}` por "Juan" e `{numero}` por "12345"
4. Envie
5. ✅ Cliente deve receber mensagem personalizada

---

## 📊 Logs para Debug

Todos os endpoints têm logs detalhados. Para debugar:

### Upload de Imagem
```
[SupabaseStorage] 📤 uploadImage called
[SupabaseStorage] 🚀 Uploading to bucket: whatsapp-media
[SupabaseStorage] ✅ Upload successful: 1234567_image.jpg
[SupabaseStorage] 🔗 Public URL: https://...
```

### Envio WhatsApp
```
[SendWhatsAppAPI] 📤 POST /api/admin/send-whatsapp
[SendWhatsAppAPI] 🔍 Finding or creating customer...
[SendWhatsAppAPI] 🔍 Finding or creating conversation...
[SendWhatsAppAPI] 💬 Sending text message...
[WhatsAppClient] ✅✅✅ MESSAGE SENT SUCCESSFULLY! ✅✅✅
[SendWhatsAppAPI] 💾 Saving message to database...
[SendWhatsAppAPI] ✅✅✅ SUCCESS! ✅✅✅
```

---

## 🐛 Possíveis Erros e Soluções

### 1. **"Erro ao fazer upload da imagem"**

**Causa**: Bucket não foi criado ou políticas não foram configuradas

**Solução**: Seguir [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)

### 2. **"Erro ao enviar mensagem via WhatsApp"**

**Causas possíveis**:
- Token do WhatsApp inválido
- phoneNumberId incorreto
- Telefone em formato inválido
- Cliente não tem WhatsApp

**Solução**:
- Verificar variáveis de ambiente
- Testar com seu próprio número primeiro
- Incluir código do país (ex: 54 para Argentina)

### 3. **"Mensagem enviada mas não aparece no histórico"**

**Causa**: Erro ao salvar no banco de dados

**Solução**:
- Verificar logs no console
- Verificar se Supabase está acessível
- Verificar se tabelas `customers`, `conversations`, `messages` existem

### 4. **Imagem não carrega no WhatsApp**

**Causa**: URL da imagem não é pública ou bucket não é público

**Solução**:
- Acessar URL da imagem no navegador (deve abrir a imagem)
- Verificar se bucket é público no Supabase
- Verificar políticas de SELECT

---

## 🔮 Próximos Passos (Opcional)

Estas são melhorias futuras que podem ser implementadas:

### 1. **Auto-substituição de Variáveis**
Atualmente, as variáveis `{nome}`, `{numero}` precisam ser preenchidas manualmente. Poderia:
- Buscar dados do cliente automaticamente (se existir)
- Buscar dados do pedido (se informar número do pedido)
- Substituir automaticamente antes de enviar

### 2. **Integração com Pedidos WooCommerce**
- Buscar pedidos por telefone
- Preencher automaticamente número do pedido, tracking, etc.
- Sugerir template baseado no status do pedido

### 3. **Envio em Massa**
- Selecionar múltiplos clientes
- Enviar mesmo template para todos
- Queue/background job para não travar a interface

### 4. **Histórico de Envios**
- Página com lista de todas as mensagens enviadas pelo admin
- Filtrar por data, cliente, status
- Estatísticas (total enviado, taxa de entrega)

### 5. **Agendamento de Mensagens**
- Agendar mensagem para envio futuro
- Útil para enviar notificações em horários específicos

### 6. **Templates Dinâmicos com Database**
- Salvar templates no banco de dados
- Permitir criar/editar templates pela interface
- Não precisar alterar código para adicionar templates

### 7. **Suporte a Outros Tipos de Mídia**
- Vídeos
- PDFs
- Áudios
- Documentos

### 8. **Limpeza Automática de Imagens**
- Cron job que deleta imagens com mais de 7 dias
- Evita acumular arquivos antigos no Storage

---

## ✅ Checklist de Validação

Antes de considerar 100% completo, validar:

- [ ] Bucket `whatsapp-media` criado e configurado
- [ ] Envio de mensagem de texto funciona
- [ ] Envio de foto funciona
- [ ] Mensagens aparecem no histórico do banco
- [ ] Lista de conversas aparece corretamente
- [ ] Navigation "WhatsApp" aparece no header
- [ ] Erros são exibidos de forma clara na UI
- [ ] Logs detalhados aparecem no console
- [ ] Upload de imagem valida tipo e tamanho
- [ ] Preview da imagem funciona
- [ ] Templates podem ser selecionados
- [ ] Telefone é validado (10-15 dígitos)

---

## 📚 Referências

- [WhatsApp Cloud API - Media Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#media-messages)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**🎉 Feature Completa!**

Qualquer dúvida, consultar este documento ou os logs detalhados no console.
