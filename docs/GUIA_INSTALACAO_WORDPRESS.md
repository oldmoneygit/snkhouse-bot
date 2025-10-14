# 🚀 Guia de Instalação - SNKHOUSE Widget no WordPress

> **Tempo estimado**: 5 minutos
> **Dificuldade**: Fácil
> **Requisitos**: Acesso ao WordPress Admin

---

## 📋 Sumário

1. [Método 1: Via Plugin (RECOMENDADO - Mais Fácil)](#método-1-via-plugin-recomendado)
2. [Método 2: Via Editor de Temas](#método-2-via-editor-de-temas)
3. [Método 3: Via FTP/cPanel](#método-3-via-ftpcpanel)
4. [Teste de Funcionamento](#teste-de-funcionamento)
5. [Troubleshooting](#troubleshooting)

---

## Método 1: Via Plugin (RECOMENDADO)

### ✅ Vantagens
- Mais fácil e seguro
- Não edita arquivos do tema
- Funciona com qualquer tema
- Fácil de remover se necessário

### 📝 Passo a Passo

#### 1. Instalar o Plugin

1. Acesse o WordPress Admin: `https://snkhouse.com/wp-admin`
2. Vá em: **Plugins → Adicionar Novo**
3. Busque por: **"Insert Headers and Footers"**
4. Instale e ative o plugin (by WPBeginner)

   ![Plugin Install](https://i.imgur.com/example.png)

#### 2. Adicionar o Código

1. Vá em: **Configurações → Insert Headers and Footers**
2. Role até a seção **"Scripts in Footer"**
3. Copie o código do arquivo [INSTALL_WIDGET_FINAL.html](./INSTALL_WIDGET_FINAL.html)
4. Cole TODO o código na caixa de texto
5. Clique em **"Save"**

   ![Plugin Config](https://i.imgur.com/example2.png)

#### 3. Verificar Instalação

1. Abra `https://snkhouse.com` em uma aba anônima
2. Você deve ver o widget no canto inferior direito
3. Clique no widget para abrir o chat

---

## Método 2: Via Editor de Temas

### ⚠️ Atenção
- Requer edição de arquivos do tema
- Se atualizar o tema, o código será perdido
- Use um **Child Theme** para evitar perder o código

### 📝 Passo a Passo

#### 1. Acessar o Editor

1. Acesse: **Aparência → Editor de Arquivos de Tema**
2. Se aparecer um aviso, leia e aceite

#### 2. Editar footer.php

1. Na lista de arquivos à direita, procure por:
   - `footer.php` ou
   - `theme-footer.php` ou
   - `inc/footer.php`

2. Clique no arquivo para abrir o editor

#### 3. Adicionar o Código

1. Role até o final do arquivo
2. Encontre a tag `</body>`
3. Cole o código ANTES do `</body>`:

```html
<!-- Seu código atual -->
    <!-- ... resto do footer ... -->

    <!-- ↓↓↓ COLE O CÓDIGO AQUI ↓↓↓ -->
    <div id="snkhouse-widget-container" style="...">
      <!-- Widget code -->
    </div>
    <!-- ↑↑↑ ATÉ AQUI ↑↑↑ -->

  </body>
</html>
```

4. Clique em **"Atualizar Arquivo"**

#### 4. Verificar

1. Abra o site em uma aba anônima
2. Verifique se o widget aparece

---

## Método 3: Via FTP/cPanel

### 🔧 Para usuários avançados

#### 1. Conectar via FTP

- Use FileZilla ou similar
- Conecte-se ao servidor da SNKHOUSE

#### 2. Localizar o Arquivo

Navegue até:
```
/public_html/wp-content/themes/[SEU-TEMA]/footer.php
```

#### 3. Editar o Arquivo

1. Faça download do `footer.php`
2. Abra no editor de texto
3. Adicione o código antes do `</body>`
4. Faça upload novamente

---

## 🧪 Teste de Funcionamento

### 1. Teste Visual

1. Abra `https://snkhouse.com` em aba anônima
2. ✅ Widget deve aparecer no canto inferior direito
3. ✅ Deve ser possível clicar e abrir o chat

### 2. Teste do Console (Context Awareness)

1. Abra o site
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Console**
4. Verifique se aparecem estas mensagens:

```
🚀 SNKHOUSE Widget Context Awareness - Iniciando
✅ Widget iframe carregado
📤 Enviando contexto para widget: {page: "home", timestamp: "..."}
```

### 3. Teste de Context Awareness

#### Teste 1: Página Inicial
1. Abra o widget na home
2. Digite: **"que página estoy viendo?"**
3. ✅ Bot deve responder que você está na home

#### Teste 2: Página de Produto
1. Navegue para qualquer produto (ex: Nike Air Jordan)
2. Abra o widget
3. Digite: **"que producto estoy viendo?"**
4. ✅ Bot deve responder com o nome do produto correto

#### Teste 3: Carrinho
1. Adicione produtos ao carrinho
2. Vá para a página do carrinho
3. Abra o widget
4. Digite: **"cuántos items tengo en el carrito?"**
5. ✅ Bot deve saber quantos itens você tem

---

## 🐛 Troubleshooting

### Problema: Widget não aparece

**Soluções:**

1. **Limpar cache**
   ```
   - Cache do WordPress (WP Super Cache, W3 Total Cache, etc.)
   - Cache do navegador (Ctrl+Shift+R para hard refresh)
   - Cache do CDN (Cloudflare, etc.)
   ```

2. **Verificar se o código foi instalado**
   - Abra o site
   - Clique com botão direito → "Ver código fonte"
   - Busque por "snkhouse-widget-container"
   - Se não encontrar, o código não foi instalado corretamente

3. **Verificar conflitos com CSS**
   - Abra DevTools (F12) → Aba "Elements"
   - Procure por `div#snkhouse-widget-container`
   - Verifique se tem `display: none` ou `visibility: hidden`
   - Se tiver, algum CSS está escondendo o widget

### Problema: Widget aparece mas não carrega

**Soluções:**

1. **Verificar CORS**
   - Abra DevTools (F12) → Aba "Console"
   - Procure por erros de CORS
   - Se tiver erro, contate o suporte

2. **Verificar URL do iframe**
   - No código, confirme que a URL é:
     ```
     https://snkhouse-bot-widget.vercel.app
     ```
   - Sem barra no final
   - Com HTTPS (não HTTP)

### Problema: Context Awareness não funciona

**Soluções:**

1. **Verificar console**
   - Abra DevTools (F12) → Console
   - Deve aparecer: "📤 Enviando contexto para widget"
   - Se não aparecer, o script não está funcionando

2. **Verificar estrutura HTML do site**
   - O script extrai dados de classes CSS do WooCommerce
   - Se o tema usa classes customizadas, pode não funcionar
   - Contate o suporte para adaptar o script

3. **Verificar postMessage**
   - Abra DevTools (F12) → Console
   - Digite:
     ```javascript
     window.addEventListener('message', (e) => console.log('Message:', e))
     ```
   - Navegue pelo site
   - Deve aparecer mensagens sendo enviadas

### Problema: Widget está em posição errada

**Solução:**

Edite o CSS no código do widget:

```html
<div id="snkhouse-widget-container" style="
  position: fixed;
  bottom: 20px;    /* ← Distância do fundo */
  right: 20px;     /* ← Distância da direita */
  width: 400px;    /* ← Largura */
  height: 600px;   /* ← Altura */
  ...
">
```

**Exemplos:**

- Para canto inferior esquerdo:
  ```css
  left: 20px;      /* Em vez de right */
  right: auto;
  ```

- Para versão mobile responsiva:
  ```css
  width: 100%;
  max-width: 400px;
  height: 100vh;
  max-height: 600px;
  ```

---

## 📱 Versão Mobile (Opcional)

Para melhorar a experiência mobile, adicione este CSS adicional:

```html
<style>
@media (max-width: 768px) {
  #snkhouse-widget-container {
    width: 100% !important;
    height: 100vh !important;
    bottom: 0 !important;
    right: 0 !important;
    border-radius: 0 !important;
  }
}
</style>
```

Cole este CSS logo antes do `<div id="snkhouse-widget-container">`.

---

## 🎨 Personalização Avançada

### Mudar cores do container

```css
#snkhouse-widget-container {
  border: 2px solid #000;      /* Borda preta */
  box-shadow: 0 0 20px red;    /* Sombra vermelha */
}
```

### Adicionar botão de fechar

```html
<div id="snkhouse-widget-container" style="...">
  <button onclick="document.getElementById('snkhouse-widget-container').style.display='none'"
          style="position: absolute; top: 10px; right: 10px; z-index: 10000;">
    ✕
  </button>
  <iframe ...></iframe>
</div>
```

---

## 📞 Suporte

**Problemas técnicos?**
- GitHub Issues: [snkhouse-bot/issues](https://github.com/oldmoneygit/snkhouse-bot/issues)
- Email: [seu-email@snkhouse.com]

**Dúvidas sobre instalação?**
- WhatsApp: [+54 xxx xxx xxxx]

---

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] Widget aparece no site
- [ ] Widget abre quando clicado
- [ ] Console mostra mensagens de context awareness
- [ ] Bot responde perguntas gerais
- [ ] Bot reconhece qual produto você está vendo
- [ ] Bot reconhece quando você está no carrinho
- [ ] Widget funciona em desktop
- [ ] Widget funciona em mobile
- [ ] Cache foi limpo após instalação

---

**🎉 Instalação concluída com sucesso!**

O widget agora está funcionando em https://snkhouse.com com Context Awareness completo.
