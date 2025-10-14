<?php
/*
Plugin Name: SNKHOUSE Chat
Description: Chat widget con IA para atención al cliente
Version: 1.0.2
Author: SNKHOUSE
*/

if (!defined('ABSPATH')) exit;

function snkhouse_chat_widget() {
    $enabled = get_option('snkhouse_chat_enabled', '1');
    if ($enabled != '1') return;

    $position = get_option('snkhouse_chat_position', 'bottom-right');
    $width = get_option('snkhouse_chat_width', '400');
    $height = get_option('snkhouse_chat_height', '600');

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
}
add_action('wp_footer', 'snkhouse_chat_widget', 100);

function snkhouse_chat_admin_menu() {
    add_options_page('SNKHOUSE Chat', 'SNKHOUSE Chat', 'manage_options', 'snkhouse-chat', 'snkhouse_chat_admin_page');
}
add_action('admin_menu', 'snkhouse_chat_admin_menu');

function snkhouse_chat_register_settings() {
    register_setting('snkhouse_chat_settings', 'snkhouse_chat_enabled');
    register_setting('snkhouse_chat_settings', 'snkhouse_chat_position');
    register_setting('snkhouse_chat_settings', 'snkhouse_chat_width');
    register_setting('snkhouse_chat_settings', 'snkhouse_chat_height');
}
add_action('admin_init', 'snkhouse_chat_register_settings');

function snkhouse_chat_admin_page() {
    ?>
<div class="wrap">
    <h1>SNKHOUSE Chat - Configuración</h1>
    <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #00a32a;">
        <h2 style="margin-top: 0;">✅ Plugin Instalado Correctamente</h2>
        <p>El widget está activo y funcionando en <strong><?php echo get_site_url(); ?></strong></p>
    </div>
    <form method="post" action="options.php">
        <?php settings_fields('snkhouse_chat_settings'); ?>
        <?php do_settings_sections('snkhouse_chat_settings'); ?>
        <table class="form-table">
            <tr valign="top">
                <th scope="row"><label for="snkhouse_chat_enabled">Activar Widget</label></th>
                <td>
                    <input type="checkbox" id="snkhouse_chat_enabled" name="snkhouse_chat_enabled" value="1" <?php checked(1, get_option('snkhouse_chat_enabled', 1)); ?> />
                    <label for="snkhouse_chat_enabled">Mostrar widget en el sitio</label>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><label for="snkhouse_chat_position">Posición</label></th>
                <td>
                    <select id="snkhouse_chat_position" name="snkhouse_chat_position">
                        <option value="bottom-right" <?php selected(get_option('snkhouse_chat_position', 'bottom-right'), 'bottom-right'); ?>>Abajo a la derecha</option>
                        <option value="bottom-left" <?php selected(get_option('snkhouse_chat_position', 'bottom-right'), 'bottom-left'); ?>>Abajo a la izquierda</option>
                    </select>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><label for="snkhouse_chat_width">Ancho (px)</label></th>
                <td>
                    <input type="number" id="snkhouse_chat_width" name="snkhouse_chat_width" value="<?php echo esc_attr(get_option('snkhouse_chat_width', 400)); ?>" min="300" max="600" />
                    <p class="description">Ancho del widget en desktop (300-600px)</p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><label for="snkhouse_chat_height">Alto (px)</label></th>
                <td>
                    <input type="number" id="snkhouse_chat_height" name="snkhouse_chat_height" value="<?php echo esc_attr(get_option('snkhouse_chat_height', 600)); ?>" min="400" max="800" />
                    <p class="description">Alto del widget en desktop (400-800px)</p>
                </td>
            </tr>
        </table>
        <?php submit_button('Guardar Configuración'); ?>
    </form>
</div>
    <?php
}
