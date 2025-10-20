# 📦 Setup Supabase Storage para WhatsApp Media

Este documento explica como configurar o Supabase Storage para armazenar imagens que serão enviadas via WhatsApp.

## 1. Criar Bucket

1. Acesse o dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto (SNKHOUSE Bot)
3. No menu lateral, clique em **Storage**
4. Clique em **Create a new bucket**
5. Configurações do bucket:
   - **Name**: `whatsapp-media`
   - **Public**: ✅ **Ativado** (o bucket precisa ser público para que o WhatsApp possa baixar as imagens)
   - **File size limit**: `5242880` bytes (5 MB)
   - **Allowed MIME types**: `image/jpeg,image/png`
6. Clique em **Create bucket**

## 2. Configurar Políticas de Acesso (Policies)

Após criar o bucket, você precisa configurar as políticas de acesso:

### 2.1. Permitir Upload (INSERT)

1. Na página do bucket `whatsapp-media`, clique na aba **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Configure:
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
     ```sql
     ((bucket_id = 'whatsapp-media'::text))
     ```
5. Clique em **Save**

### 2.2. Permitir Leitura (SELECT)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure:
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:
     ```sql
     ((bucket_id = 'whatsapp-media'::text))
     ```
4. Clique em **Save**

### 2.3. Permitir Deleção (DELETE) - Opcional

Se quiser permitir que arquivos sejam deletados (recomendado para limpeza):

1. Clique em **New Policy**
2. Selecione **For full customization**
3. Configure:
   - **Policy name**: `Allow public deletes`
   - **Allowed operation**: `DELETE`
   - **Policy definition**:
     ```sql
     ((bucket_id = 'whatsapp-media'::text))
     ```
4. Clique em **Save**

## 3. Testar o Bucket

Após configurar, você pode testar fazendo upload de uma imagem direto na interface do Supabase:

1. Clique no bucket `whatsapp-media`
2. Clique em **Upload file**
3. Faça upload de uma imagem de teste (jpg ou png, max 5MB)
4. Após upload, clique na imagem e copie a **Public URL**
5. Abra a URL em uma nova aba - você deve ver a imagem
6. Se funcionar, o setup está correto! ✅

## 4. Variáveis de Ambiente

As variáveis de ambiente já estão configuradas no projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://czueuxqhmifgofuflscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Não precisa adicionar nada novo, o código usa o cliente Supabase existente.

## 5. Estrutura de URLs

Após upload, as imagens terão URLs no formato:

```
https://czueuxqhmifgofuflscg.supabase.co/storage/v1/object/public/whatsapp-media/{filename}
```

Exemplo:
```
https://czueuxqhmifgofuflscg.supabase.co/storage/v1/object/public/whatsapp-media/1737847200_produto_embalado.jpg
```

## 6. Limpeza Automática (Opcional - Futuro)

Para evitar acumular imagens antigas, você pode configurar uma função serverless que deleta imagens com mais de 7 dias. Por enquanto, isso não é necessário.

## Troubleshooting

### Erro: "new row violates row-level security policy"
- **Causa**: Políticas não foram configuradas corretamente
- **Solução**: Verifique se criou as 3 políticas (INSERT, SELECT, DELETE)

### Erro: "File size exceeds limit"
- **Causa**: Arquivo maior que 5MB
- **Solução**: Comprimir a imagem antes de fazer upload

### URL não acessível publicamente
- **Causa**: Bucket não é público
- **Solução**: Edite o bucket e marque **Public** como ✅

---

**✅ Setup Completo!** Agora o sistema pode fazer upload de imagens e enviar via WhatsApp.
