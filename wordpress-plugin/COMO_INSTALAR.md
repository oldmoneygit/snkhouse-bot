# 🚀 Como Instalar o Plugin SNKHOUSE Widget

## 📦 Opção 1: Upload via WordPress Admin (MAIS FÁCIL)

### 1️⃣ Criar o arquivo ZIP

**No Windows:**
1. Abra a pasta `wordpress-plugin`
2. Clique com botão direito na pasta `snkhouse-widget`
3. Selecione **"Enviar para → Pasta compactada (zipada)"**
4. Será criado `snkhouse-widget.zip`

**Ou use o comando:**
```bash
cd wordpress-plugin
powershell Compress-Archive -Path snkhouse-widget -DestinationPath snkhouse-widget.zip
```

### 2️⃣ Instalar no WordPress

1. Entre no WordPress Admin: `https://snkhouse.com/wp-admin`
2. Vá em **Plugins → Añadir Nuevo**
3. Clique em **"Subir Plugin"** (topo da página)
4. Clique em **"Seleccionar archivo"**
5. Escolha o arquivo `snkhouse-widget.zip`
6. Clique em **"Instalar Ahora"**
7. Aguarde a instalação (5-10 segundos)
8. Clique em **"Activar Plugin"**

### 3️⃣ Verificar Instalação

1. Após ativar, você verá: **"Plugin activado"**
2. Vá em **Configuración → SNKHOUSE Widget**
3. Você verá a página de configuração com: ✅ Plugin Instalado Correctamente

---

## 📂 Opção 2: Upload via FTP/cPanel

### 1️⃣ Conectar ao Servidor

**Via FileZilla ou similar:**
- Host: `ftp.snkhouse.com` (ou IP do servidor)
- Usuário: [seu usuário FTP]
- Senha: [sua senha FTP]

### 2️⃣ Upload da Pasta

1. Navegue até: `/public_html/wp-content/plugins/`
2. Arraste a pasta `snkhouse-widget` para dentro de `plugins/`
3. Aguarde o upload completar

### 3️⃣ Ativar no WordPress

1. Entre no WordPress Admin
2. Vá em **Plugins → Plugins Instalados**
3. Procure por **"SNKHOUSE Widget"**
4. Clique em **"Activar"**

---

## ⚙️ Configuração (Opcional)

Após ativar, vá em **Configuración → SNKHOUSE Widget**.

### Opções Disponíveis:

| Opção | Padrão | Descrição |
|-------|--------|-----------|
| **Activar Widget** | ✅ Sim | Liga/desliga o widget no site |
| **Posición** | Abajo a la derecha | Canto inferior direito ou esquerdo |
| **Ancho** | 400px | Largura do widget (300-600px) |
| **Alto** | 600px | Altura do widget (400-800px) |

### Exemplo de Configuração:

```
✅ Activar Widget: Marcado
📍 Posición: Abajo a la derecha
📏 Ancho: 400 px
📏 Alto: 600 px
```

Clique em **"Guardar Configuración"**.

---

## 🧪 Teste de Funcionamento

### 1️⃣ Teste Visual

1. Abra `https://snkhouse.com` em uma **aba anônima** (Ctrl+Shift+N)
2. O widget deve aparecer no canto inferior direito
3. Clique para abrir o chat
4. Digite: **"hola"**
5. ✅ Bot deve responder

### 2️⃣ Teste do Console

1. Abra o site
2. Pressione **F12** → Aba **Console**
3. Você deve ver:

```
🚀 SNKHOUSE Widget Context Awareness - Iniciando
✅ Widget iframe carregado
📤 Enviando contexto para widget: {page: "home", ...}
```

### 3️⃣ Teste de Context Awareness

#### Teste 1: Produto
1. Entre em qualquer produto (ex: Nike Air Jordan)
2. Abra o widget
3. Digite: **"que producto estoy viendo?"**
4. ✅ Bot responde com o nome do produto

#### Teste 2: Carrinho
1. Adicione produtos ao carrinho
2. Vá para a página do carrinho
3. Abra o widget
4. Digite: **"cuántos items tengo en el carrito?"**
5. ✅ Bot responde a quantidade correta

---

## 🐛 Troubleshooting

### Problema: Plugin não aparece na lista

**Solução:**
1. Verifique se a pasta está em `/wp-content/plugins/snkhouse-widget/`
2. Verifique se o arquivo principal é `snkhouse-widget.php`
3. Verifique permissões da pasta (755)

### Problema: Widget não aparece no site

**Soluções:**
1. Verifique se o plugin está **Activado**
2. Vá em **Configuración → SNKHOUSE Widget**
3. Verifique se **"Activar Widget"** está marcado
4. Limpe o cache do WordPress
5. Limpe o cache do navegador (Ctrl+Shift+R)

### Problema: Widget carrega mas está vazio

**Soluções:**
1. Verifique conexão com internet
2. Abra DevTools (F12) → Console
3. Procure por erros em vermelho
4. Verifique se https://snkhouse-bot-widget.vercel.app está acessível

### Problema: Context Awareness não funciona

**Soluções:**
1. Abra Console (F12)
2. Procure por: `📤 Enviando contexto para widget`
3. Se não aparecer, o script não está rodando
4. Verifique se há conflitos com outros plugins
5. Desative cache de JavaScript (se houver)

---

## 🔧 Desinstalar o Plugin

Se precisar remover o plugin:

### Via WordPress Admin:
1. Vá em **Plugins → Plugins Instalados**
2. Procure **"SNKHOUSE Widget"**
3. Clique em **"Desactivar"**
4. Clique em **"Eliminar"**
5. Confirme a remoção

### Via FTP:
1. Conecte ao servidor
2. Navegue até `/wp-content/plugins/`
3. Exclua a pasta `snkhouse-widget/`

---

## 📊 Estrutura do Plugin

```
snkhouse-widget/
├── snkhouse-widget.php    # Arquivo principal do plugin
└── readme.txt             # Documentação WordPress.org
```

### snkhouse-widget.php contém:

- ✅ Widget HTML + Iframe
- ✅ Context Awareness Script (JavaScript)
- ✅ Página de Configuração (WordPress Admin)
- ✅ Opções de personalização
- ✅ CSS Responsivo
- ✅ Documentação inline

---

## 🎯 Features do Plugin

### ✅ Incluído:

- [x] Widget iframe (https://snkhouse-bot-widget.vercel.app)
- [x] Context Awareness (detecta página, produto, carrinho)
- [x] Página de configuração no WordPress Admin
- [x] Opções: ativar/desativar, posição, tamanho
- [x] CSS responsivo (desktop + mobile)
- [x] Documentação e testes de validação
- [x] Compatible com qualquer tema WordPress

### 🚀 Features do Widget (no iframe):

- [x] Chat com IA em tempo real (GPT-4)
- [x] Streaming de respostas
- [x] Product Cards
- [x] Add to Cart
- [x] Conversation History
- [x] Analytics

---

## 📞 Suporte

**Problemas técnicos?**
- GitHub Issues: https://github.com/oldmoneygit/snkhouse-bot/issues
- Documentação: https://github.com/oldmoneygit/snkhouse-bot/blob/main/docs/

**Dúvidas sobre instalação?**
- Veja a documentação completa em `/docs/`

---

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] Plugin instalado e ativado
- [ ] Widget aparece no site
- [ ] Widget abre quando clicado
- [ ] Console mostra mensagens de context awareness
- [ ] Bot responde perguntas gerais
- [ ] Bot reconhece qual produto está vendo
- [ ] Bot reconhece quando está no carrinho
- [ ] Widget funciona em desktop
- [ ] Widget funciona em mobile
- [ ] Página de configuração acessível

---

**🎉 Plugin instalado com sucesso!**

O widget agora está funcionando em https://snkhouse.com com todos os recursos:

✅ Chat com IA
✅ Context Awareness
✅ Product Cards
✅ Add to Cart
✅ Analytics
✅ Responsive Design

**Desenvolvido 100% com Claude AI 🤖**
