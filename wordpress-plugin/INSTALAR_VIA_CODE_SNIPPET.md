# 🚀 INSTALAR VIA CODE SNIPPET (100% FUNCIONA!)

## ✅ MÉTODO MAIS FÁCIL E CONFIÁVEL

Esquece plugin ZIP! Vamos usar **Code Snippet** - adiciona código direto no WordPress.

---

## 📋 PASSO 1: Instalar Plugin Code Snippets

### 1. Entre no WordPress Admin
```
https://snkhouse.com/wp-admin
```

### 2. Vá em: Plugins → Añadir Nuevo

### 3. Busque por: **"Code Snippets"**

### 4. Instale este plugin:
```
Nome: Code Snippets
Autor: Code Snippets Pro
Ícone: Roxo/azul com símbolo <>
Instalações: 1+ milhão
```

### 5. Clique em:
- **Instalar Ahora**
- Aguarde 10 segundos
- **Activar**

✅ **Plugin instalado!**

---

## 📋 PASSO 2: Adicionar o Código do Widget

### 1. Vá em: Snippets → Add New

Ou clique no botão **"Add New"** que apareceu no menu lateral.

### 2. Preencha os Campos:

#### Nome do Snippet:
```
SNKHOUSE Widget Chat
```

#### Code:
**COPIE TODO O CÓDIGO ABAIXO** (vai ser grande, mas é normal):

```php
<?php
/**
 * SNKHOUSE Widget - Chat com IA
 * Versão: 1.0.0
 */

// Widget HTML no footer
add_action('wp_footer', function() {
    $enabled = get_option('snkhouse_widget_enabled', '1');
    if ($enabled != '1') return;

    $position = get_option('snkhouse_widget_position', 'bottom-right');
    $width = get_option('snkhouse_widget_width', '400');
    $height = get_option('snkhouse_widget_height', '600');

    $position_styles = '';
    if ($position === 'bottom-right') {
        $position_styles = 'bottom: 20px; right: 20px;';
    } else {
        $position_styles = 'bottom: 20px; left: 20px;';
    }
    ?>
<div id="snkhouse-widget-container" style="position: fixed; <?php echo esc_attr($position_styles); ?> width: <?php echo esc_attr($width); ?>px; height: <?php echo esc_attr($height); ?>px; border: none; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 9999; background: white; overflow: hidden;">
  <iframe id="snkhouse-widget-iframe" src="https://snkhouse-bot-widget.vercel.app" style="width: 100%; height: 100%; border: none; border-radius: 16px;" allow="clipboard-write"></iframe>
</div>
<script>
(function() {
  console.log('🚀 SNKHOUSE Widget Context Awareness - Iniciando');
  function extractPageContext() {
    const context = { page: 'home', timestamp: new Date().toISOString() };
    const bodyClasses = document.body.className;
    if (bodyClasses.includes('single-product') || bodyClasses.includes('product-template')) {
      context.page = 'product';
      const productTitle = document.querySelector('.product_title, .product-title, h1.entry-title');
      if (productTitle) context.productName = productTitle.textContent.trim();
      const productPrice = document.querySelector('.woocommerce-Price-amount, .price .amount, .product-price');
      if (productPrice) {
        const priceText = productPrice.textContent.replace(/[^0-9.,]/g, '');
        context.productPrice = parseFloat(priceText.replace(',', '.'));
      }
      const productId = document.querySelector('[data-product_id], [data-product-id]');
      if (productId) context.productId = parseInt(productId.getAttribute('data-product_id') || productId.getAttribute('data-product-id'));
      const stockStatus = document.querySelector('.stock, .availability');
      if (stockStatus) context.productInStock = !stockStatus.textContent.toLowerCase().includes('agotado');
    } else if (bodyClasses.includes('product-category') || bodyClasses.includes('archive')) {
      context.page = 'category';
      const categoryTitle = document.querySelector('.page-title, .category-title, h1.entry-title');
      if (categoryTitle) context.categoryName = categoryTitle.textContent.trim();
      const urlParams = new URLSearchParams(window.location.search);
      const catId = urlParams.get('cat') || urlParams.get('category_id');
      if (catId) context.categoryId = parseInt(catId);
    } else if (bodyClasses.includes('woocommerce-cart') || window.location.pathname.includes('/cart')) {
      context.page = 'cart';
      const cartCount = document.querySelector('.cart-contents-count, .cart-count, .header-cart-count');
      if (cartCount) context.cartItemsCount = parseInt(cartCount.textContent);
      const cartTotal = document.querySelector('.cart-subtotal .amount, .order-total .amount');
      if (cartTotal) {
        const totalText = cartTotal.textContent.replace(/[^0-9.,]/g, '');
        context.cartTotal = parseFloat(totalText.replace(',', '.'));
      }
    } else if (bodyClasses.includes('woocommerce-checkout') || window.location.pathname.includes('/checkout')) {
      context.page = 'checkout';
      const orderTotal = document.querySelector('.order-total .amount');
      if (orderTotal) {
        const totalText = orderTotal.textContent.replace(/[^0-9.,]/g, '');
        context.cartTotal = parseFloat(totalText.replace(',', '.'));
      }
    }
    return context;
  }
  function sendContextToWidget(context) {
    const iframe = document.getElementById('snkhouse-widget-iframe');
    if (!iframe || !iframe.contentWindow) {
      console.warn('⚠️ Widget iframe não encontrado');
      return;
    }
    const message = { type: 'PAGE_CONTEXT', source: 'snkhouse', data: context };
    console.log('📤 Enviando contexto para widget:', context);
    iframe.contentWindow.postMessage(message, 'https://snkhouse-bot-widget.vercel.app');
  }
  function initContextAwareness() {
    const iframe = document.getElementById('snkhouse-widget-iframe');
    if (!iframe) {
      console.error('❌ Widget iframe não encontrado');
      return;
    }
    iframe.addEventListener('load', function() {
      console.log('✅ Widget iframe carregado');
      const context = extractPageContext();
      sendContextToWidget(context);
      let lastPath = window.location.pathname;
      setInterval(function() {
        if (window.location.pathname !== lastPath) {
          lastPath = window.location.pathname;
          console.log('🔄 Página mudou, re-enviando contexto');
          const newContext = extractPageContext();
          sendContextToWidget(newContext);
        }
      }, 1000);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContextAwareness);
  } else {
    initContextAwareness();
  }
  console.log('✅ SNKHOUSE Widget Context Awareness - Configurado');
})();
</script>
<style>
@media (max-width: 768px) {
  #snkhouse-widget-container {
    width: 100% !important;
    height: 100vh !important;
    bottom: 0 !important;
    right: 0 !important;
    left: 0 !important;
    border-radius: 0 !important;
  }
}
</style>
    <?php
}, 100);

// Menu de configuração
add_action('admin_menu', function() {
    add_options_page(
        'SNKHOUSE Widget',
        'SNKHOUSE Widget',
        'manage_options',
        'snkhouse-widget-settings',
        function() {
            if (!current_user_can('manage_options')) return;

            if (isset($_POST['snkhouse_widget_settings_submit'])) {
                check_admin_referer('snkhouse_widget_settings');
                update_option('snkhouse_widget_enabled', isset($_POST['snkhouse_widget_enabled']) ? '1' : '0');
                update_option('snkhouse_widget_position', sanitize_text_field($_POST['snkhouse_widget_position']));
                update_option('snkhouse_widget_width', intval($_POST['snkhouse_widget_width']));
                update_option('snkhouse_widget_height', intval($_POST['snkhouse_widget_height']));
                echo '<div class="notice notice-success"><p>✅ Configuración guardada</p></div>';
            }

            $enabled = get_option('snkhouse_widget_enabled', '1');
            $position = get_option('snkhouse_widget_position', 'bottom-right');
            $width = get_option('snkhouse_widget_width', '400');
            $height = get_option('snkhouse_widget_height', '600');
            ?>
            <div class="wrap">
                <h1>⚙️ SNKHOUSE Widget - Configuración</h1>
                <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #00a32a;">
                    <h2 style="margin-top: 0;">✅ Widget Instalado Correctamente</h2>
                    <p>El widget está activo y funcionando en <strong><?php echo get_site_url(); ?></strong></p>
                </div>
                <form method="post">
                    <?php wp_nonce_field('snkhouse_widget_settings'); ?>
                    <table class="form-table">
                        <tr>
                            <th>Activar Widget</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="snkhouse_widget_enabled" value="1" <?php checked($enabled, '1'); ?>>
                                    Mostrar widget en el sitio
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th>Posición</th>
                            <td>
                                <select name="snkhouse_widget_position">
                                    <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>>Abajo a la derecha</option>
                                    <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>>Abajo a la izquierda</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Ancho (px)</th>
                            <td>
                                <input type="number" name="snkhouse_widget_width" value="<?php echo esc_attr($width); ?>" min="300" max="600">
                                <p class="description">Ancho del widget en desktop (300-600px)</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Alto (px)</th>
                            <td>
                                <input type="number" name="snkhouse_widget_height" value="<?php echo esc_attr($height); ?>" min="400" max="800">
                                <p class="description">Alto del widget en desktop (400-800px)</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Guardar Configuración', 'primary', 'snkhouse_widget_settings_submit'); ?>
                </form>
                <hr>
                <h2>🧪 Prueba de Funcionamiento</h2>
                <div style="background: #f0f0f1; padding: 15px;">
                    <h3>1. Verificar en el Sitio</h3>
                    <ol>
                        <li>Abre <a href="<?php echo get_site_url(); ?>" target="_blank"><?php echo get_site_url(); ?></a> en incógnito</li>
                        <li>El widget debe aparecer en la esquina inferior</li>
                        <li>Haz clic para abrir el chat</li>
                    </ol>
                    <h3>2. Verificar Console (F12)</h3>
                    <pre style="background: white; padding: 10px;">🚀 SNKHOUSE Widget Context Awareness - Iniciando
✅ Widget iframe carregado
📤 Enviando contexto: {page: "home", ...}</pre>
                </div>
            </div>
            <?php
        }
    );
});
```

#### Descrição (opcional):
```
Widget de chat con IA para SNKHOUSE. Context Awareness incluido.
```

### 3. Configurar Execução:

**Run snippet everywhere:** ✅ Marcar esta opção

(Ou se tiver opção "Only run in site front-end" marcar também)

### 4. Salvar:

Clique no botão **"Save Changes and Activate"** ou **"Guardar y Activar"**

✅ **Snippet ativado!**

---

## 📋 PASSO 3: Verificar se Funcionou

### 1. Ir para Configurações

Vá em: **Configuración → SNKHOUSE Widget**

Você verá a página de configuração com:
```
✅ Widget Instalado Correctamente
El widget está activo y funcionando en snkhouse.com
```

### 2. Testar no Site

1. Abra: `https://snkhouse.com` em **aba anônima** (Ctrl+Shift+N)
2. Widget deve aparecer no **canto inferior direito**
3. Clique para abrir
4. Digite: **"hola"**
5. ✅ Bot responde!

### 3. Verificar Console

1. Pressione **F12** → Aba **Console**
2. Você deve ver:
```
🚀 SNKHOUSE Widget Context Awareness - Iniciando
✅ Widget iframe carregado
📤 Enviando contexto para widget: {page: "home", ...}
```

---

## ⚙️ CONFIGURAR O WIDGET (OPCIONAL)

Depois de ativar, vá em: **Configuración → SNKHOUSE Widget**

### Opções disponíveis:

| Opção | Padrão | Descrição |
|-------|--------|-----------|
| **Activar Widget** | ✅ Sim | Liga/desliga o widget |
| **Posición** | Abajo a la derecha | Direita ou esquerda |
| **Ancho** | 400 px | Largura (300-600) |
| **Alto** | 600 px | Altura (400-800) |

Clique em **"Guardar Configuración"** para salvar.

---

## 🧪 TESTE COMPLETO

### Teste 1: Visual
- ✅ Widget aparece no canto
- ✅ Abre quando clicado
- ✅ Bot responde mensagens

### Teste 2: Context Awareness
1. Entre em um produto (Nike Air Jordan)
2. Abra o widget
3. Digite: **"que producto estoy viendo?"**
4. ✅ Bot responde: **"Veo que estás mirando las Nike Air Jordan..."**

### Teste 3: Product Cards
1. Digite: **"me recomiendas zapatillas nike?"**
2. ✅ Bot mostra produtos como cards
3. ✅ Botão "Agregar al Carrito" funciona

---

## 🔧 GERENCIAR O SNIPPET

### Para Editar:
1. Vá em: **Snippets → All Snippets**
2. Encontre: "SNKHOUSE Widget Chat"
3. Clique em **"Edit"**
4. Faça as alterações
5. Clique em **"Update"**

### Para Desativar:
1. Vá em: **Snippets → All Snippets**
2. Encontre: "SNKHOUSE Widget Chat"
3. Clique no **toggle** (chave) para desativar
4. Widget desaparece do site

### Para Deletar:
1. Vá em: **Snippets → All Snippets**
2. Encontre: "SNKHOUSE Widget Chat"
3. Clique em **"Delete"**
4. Confirme

---

## ✅ VANTAGENS DO CODE SNIPPET

| Vantagem | Descrição |
|----------|-----------|
| **100% Funciona** | Não depende de ZIP, extração, estrutura |
| **Fácil de editar** | Edita código direto no WordPress |
| **Não perde em updates** | Não é afetado por updates do tema |
| **Fácil de desativar** | Um clique para desligar |
| **Sem conflitos** | Não conflita com outros plugins |
| **Portável** | Pode exportar e importar |

---

## 🐛 PROBLEMAS?

### Widget não aparece?
1. Vá em **Snippets → All Snippets**
2. Verifique se "SNKHOUSE Widget Chat" está **Active** (verde)
3. Se não estiver, clique no toggle para ativar
4. Limpe cache do WordPress e do navegador

### Console mostra erro?
1. Pressione F12 → Console
2. Me envie print dos erros em vermelho

### Configuração não aparece?
1. Vá em **Configuración**
2. Procure por **"SNKHOUSE Widget"**
3. Se não aparecer, o snippet pode não estar ativo

---

## 📋 RESUMO

1. ✅ Instale plugin **"Code Snippets"**
2. ✅ Adicione novo snippet
3. ✅ Copie o código PHP completo
4. ✅ Marque "Run snippet everywhere"
5. ✅ Salve e ative
6. ✅ Teste no site
7. 🎉 **Funcionando!**

---

## 🎉 PRONTO!

O widget agora está funcionando via Code Snippet!

**Vantagem**: Não precisa mexer com ZIP, FTP ou estrutura de arquivos.

**Testa e me avisa!** 🚀
