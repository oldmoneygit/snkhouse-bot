/**
 * SNKHOUSE Widget - Chat com IA (COM BOTÃO)
 * Versão: 1.0.1
 */

// Widget HTML no footer
add_action('wp_footer', function() {
    $enabled = get_option('snkhouse_widget_enabled', '1');
    if ($enabled != '1') return;

    $position = get_option('snkhouse_widget_position', 'bottom-right');
    $width = get_option('snkhouse_widget_width', '400');
    $height = get_option('snkhouse_widget_height', '600');

    $button_position = '';
    $chat_position = '';
    if ($position === 'bottom-right') {
        $button_position = 'bottom: 20px; right: 20px;';
        $chat_position = 'bottom: 90px; right: 20px;';
    } else {
        $button_position = 'bottom: 20px; left: 20px;';
        $chat_position = 'bottom: 90px; left: 20px;';
    }
    ?>
<!-- SNKHOUSE Widget Chat -->
<div id="snkhouse-widget-container">
  <!-- Botão flutuante -->
  <button id="snkhouse-widget-button" onclick="toggleSnkhouseChat()" style="position: fixed; <?php echo esc_attr($button_position); ?> width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; z-index: 999999;">
    <svg id="snkhouse-widget-icon-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <svg id="snkhouse-widget-icon-close" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>

  <!-- Chat iframe (escondido inicialmente) -->
  <div id="snkhouse-widget-chat" style="position: fixed; <?php echo esc_attr($chat_position); ?> width: <?php echo esc_attr($width); ?>px; height: <?php echo esc_attr($height); ?>px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); background: white; overflow: hidden; display: none; transform: scale(0.9); opacity: 0; transition: all 0.3s ease; z-index: 999998;">
    <iframe id="snkhouse-widget-iframe" src="https://snkhouse-bot-widget.vercel.app/embed" style="width: 100%; height: 100%; border: none; border-radius: 16px;" allow="clipboard-write"></iframe>
  </div>
</div>

<script>
// Toggle chat abrir/fechar
function toggleSnkhouseChat() {
  const chat = document.getElementById('snkhouse-widget-chat');
  const iconChat = document.getElementById('snkhouse-widget-icon-chat');
  const iconClose = document.getElementById('snkhouse-widget-icon-close');

  if (chat.style.display === 'none' || chat.style.display === '') {
    // Abrir chat
    chat.style.display = 'block';
    setTimeout(() => {
      chat.style.transform = 'scale(1)';
      chat.style.opacity = '1';
    }, 10);
    iconChat.style.display = 'none';
    iconClose.style.display = 'block';
  } else {
    // Fechar chat
    chat.style.transform = 'scale(0.9)';
    chat.style.opacity = '0';
    setTimeout(() => {
      chat.style.display = 'none';
    }, 300);
    iconChat.style.display = 'block';
    iconClose.style.display = 'none';
  }
}

// Context Awareness
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
/* Mobile responsive */
@media (max-width: 768px) {
  #snkhouse-widget-chat {
    width: 100% !important;
    height: 100vh !important;
    bottom: 0 !important;
    right: 0 !important;
    left: 0 !important;
    border-radius: 0 !important;
  }
  #snkhouse-widget-button {
    bottom: 20px !important;
    right: 20px !important;
  }
}

/* Hover effect no botão */
#snkhouse-widget-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
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
                    <p><strong>Versão 1.0.1:</strong> Agora com botão flutuante! Clique para abrir/fechar o chat.</p>
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
                        <li>Debe aparecer un <strong>botón redondo roxo</strong> en la esquina</li>
                        <li><strong>Haz clic en el botón</strong> para abrir el chat</li>
                        <li>El chat se abre con animación</li>
                        <li>Haz clic de nuevo en el botón para cerrar</li>
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
