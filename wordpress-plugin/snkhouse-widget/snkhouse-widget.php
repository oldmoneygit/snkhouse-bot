<?php
/**
 * Plugin Name: SNKHOUSE Widget
 * Plugin URI: https://github.com/oldmoneygit/snkhouse-bot
 * Description: Widget de atendimento con IA para SNKHOUSE. Incluye chat en tiempo real, context awareness y product cards.
 * Version: 1.0.0
 * Author: SNKHOUSE
 * Author URI: https://snkhouse.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: snkhouse-widget
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SNKHOUSE Widget Class
 */
class SNKHOUSE_Widget {

    /**
     * Constructor
     */
    public function __construct() {
        // Add widget to footer
        add_action('wp_footer', array($this, 'render_widget'), 100);

        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'SNKHOUSE Widget Settings',
            'SNKHOUSE Widget',
            'manage_options',
            'snkhouse-widget',
            array($this, 'admin_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('snkhouse_widget_settings', 'snkhouse_widget_enabled');
        register_setting('snkhouse_widget_settings', 'snkhouse_widget_position');
        register_setting('snkhouse_widget_settings', 'snkhouse_widget_width');
        register_setting('snkhouse_widget_settings', 'snkhouse_widget_height');
    }

    /**
     * Admin settings page
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>⚙️ SNKHOUSE Widget - Configuración</h1>

            <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #00a32a;">
                <h2 style="margin-top: 0;">✅ Plugin Instalado Correctamente</h2>
                <p>El widget está activo y funcionando en <strong><?php echo get_site_url(); ?></strong></p>
                <p>🔗 Widget URL: <a href="https://snkhouse-bot-widget.vercel.app" target="_blank">https://snkhouse-bot-widget.vercel.app</a></p>
            </div>

            <form method="post" action="options.php">
                <?php settings_fields('snkhouse_widget_settings'); ?>
                <?php do_settings_sections('snkhouse_widget_settings'); ?>

                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">
                            <label for="snkhouse_widget_enabled">Activar Widget</label>
                        </th>
                        <td>
                            <input type="checkbox"
                                   id="snkhouse_widget_enabled"
                                   name="snkhouse_widget_enabled"
                                   value="1"
                                   <?php checked(1, get_option('snkhouse_widget_enabled', 1)); ?> />
                            <label for="snkhouse_widget_enabled">
                                Mostrar widget en el sitio
                            </label>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">
                            <label for="snkhouse_widget_position">Posición</label>
                        </th>
                        <td>
                            <select id="snkhouse_widget_position" name="snkhouse_widget_position">
                                <option value="bottom-right" <?php selected(get_option('snkhouse_widget_position', 'bottom-right'), 'bottom-right'); ?>>
                                    Abajo a la derecha
                                </option>
                                <option value="bottom-left" <?php selected(get_option('snkhouse_widget_position', 'bottom-right'), 'bottom-left'); ?>>
                                    Abajo a la izquierda
                                </option>
                            </select>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">
                            <label for="snkhouse_widget_width">Ancho (px)</label>
                        </th>
                        <td>
                            <input type="number"
                                   id="snkhouse_widget_width"
                                   name="snkhouse_widget_width"
                                   value="<?php echo esc_attr(get_option('snkhouse_widget_width', 400)); ?>"
                                   min="300"
                                   max="600" />
                            <p class="description">Ancho del widget en desktop (300-600px)</p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">
                            <label for="snkhouse_widget_height">Alto (px)</label>
                        </th>
                        <td>
                            <input type="number"
                                   id="snkhouse_widget_height"
                                   name="snkhouse_widget_height"
                                   value="<?php echo esc_attr(get_option('snkhouse_widget_height', 600)); ?>"
                                   min="400"
                                   max="800" />
                            <p class="description">Alto del widget en desktop (400-800px)</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button('Guardar Configuración'); ?>
            </form>

            <hr>

            <h2>🧪 Prueba de Funcionamiento</h2>
            <div style="background: #f0f0f1; padding: 15px; border-left: 4px solid #2271b1;">
                <h3>1. Verificar Widget en el Sitio</h3>
                <ol>
                    <li>Abre <a href="<?php echo get_site_url(); ?>" target="_blank"><?php echo get_site_url(); ?></a> en una pestaña de incógnito</li>
                    <li>El widget debe aparecer en la esquina inferior</li>
                    <li>Haz clic para abrir el chat</li>
                </ol>

                <h3>2. Verificar Context Awareness</h3>
                <ol>
                    <li>Presiona <strong>F12</strong> para abrir DevTools</li>
                    <li>Ve a la pestaña <strong>Console</strong></li>
                    <li>Debes ver: <code>🚀 SNKHOUSE Widget Context Awareness - Iniciando</code></li>
                    <li>Navega a un producto</li>
                    <li>Pregunta al bot: <strong>"que producto estoy viendo?"</strong></li>
                    <li>✅ El bot debe responder con el nombre del producto</li>
                </ol>

                <h3>3. Verificar Console</h3>
                <p>En el Console (F12) debe aparecer:</p>
                <pre style="background: white; padding: 10px; overflow-x: auto;">🚀 SNKHOUSE Widget Context Awareness - Iniciando
✅ Widget iframe carregado
📤 Enviando contexto para widget: {page: "product", ...}</pre>
            </div>

            <hr>

            <h2>📚 Documentación</h2>
            <ul>
                <li>📖 <a href="https://github.com/oldmoneygit/snkhouse-bot/blob/main/docs/GUIA_INSTALACAO_WORDPRESS.md" target="_blank">Guía Completa</a></li>
                <li>🐛 <a href="https://github.com/oldmoneygit/snkhouse-bot/issues" target="_blank">Reportar Problema</a></li>
                <li>🚀 <a href="https://snkhouse-bot-widget.vercel.app" target="_blank">Ver Widget</a></li>
            </ul>

            <hr>

            <div style="background: #f0f0f1; padding: 15px; margin-top: 20px;">
                <p style="margin: 0;">
                    <strong>SNKHOUSE Widget v1.0.0</strong> |
                    Desarrollado con ❤️ por Claude AI |
                    <a href="https://github.com/oldmoneygit/snkhouse-bot" target="_blank">GitHub</a>
                </p>
            </div>
        </div>
        <?php
    }

    /**
     * Render widget in footer
     */
    public function render_widget() {
        // Check if widget is enabled
        if (!get_option('snkhouse_widget_enabled', 1)) {
            return;
        }

        // Get settings
        $position = get_option('snkhouse_widget_position', 'bottom-right');
        $width = get_option('snkhouse_widget_width', 400);
        $height = get_option('snkhouse_widget_height', 600);

        // Position styles
        $position_styles = '';
        if ($position === 'bottom-right') {
            $position_styles = 'bottom: 20px; right: 20px;';
        } else {
            $position_styles = 'bottom: 20px; left: 20px;';
        }

        ?>
<!-- SNKHOUSE Widget - Start -->
<div id="snkhouse-widget-container" style="
  position: fixed;
  <?php echo esc_attr($position_styles); ?>
  width: <?php echo esc_attr($width); ?>px;
  height: <?php echo esc_attr($height); ?>px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 9999;
  background: white;
  overflow: hidden;
">
  <iframe
    id="snkhouse-widget-iframe"
    src="https://snkhouse-bot-widget.vercel.app"
    style="width: 100%; height: 100%; border: none; border-radius: 16px;"
    allow="clipboard-write"
  ></iframe>
</div>

<!-- SNKHOUSE Widget - Context Awareness Script -->
<script>
(function() {
  console.log('🚀 SNKHOUSE Widget Context Awareness - Iniciando');

  // Função para extrair dados da página atual
  function extractPageContext() {
    const context = {
      page: 'home',
      timestamp: new Date().toISOString()
    };

    // Detectar tipo de página
    const bodyClasses = document.body.className;

    // Página de Produto
    if (bodyClasses.includes('single-product') || bodyClasses.includes('product-template')) {
      context.page = 'product';

      // Extrair dados do produto
      const productTitle = document.querySelector('.product_title, .product-title, h1.entry-title');
      if (productTitle) {
        context.productName = productTitle.textContent.trim();
      }

      const productPrice = document.querySelector('.woocommerce-Price-amount, .price .amount, .product-price');
      if (productPrice) {
        const priceText = productPrice.textContent.replace(/[^0-9.,]/g, '');
        context.productPrice = parseFloat(priceText.replace(',', '.'));
      }

      const productId = document.querySelector('[data-product_id], [data-product-id]');
      if (productId) {
        context.productId = parseInt(productId.getAttribute('data-product_id') || productId.getAttribute('data-product-id'));
      }

      const stockStatus = document.querySelector('.stock, .availability');
      if (stockStatus) {
        context.productInStock = !stockStatus.textContent.toLowerCase().includes('agotado');
      }
    }

    // Página de Categoria
    else if (bodyClasses.includes('product-category') || bodyClasses.includes('archive')) {
      context.page = 'category';

      const categoryTitle = document.querySelector('.page-title, .category-title, h1.entry-title');
      if (categoryTitle) {
        context.categoryName = categoryTitle.textContent.trim();
      }

      const urlParams = new URLSearchParams(window.location.search);
      const catId = urlParams.get('cat') || urlParams.get('category_id');
      if (catId) {
        context.categoryId = parseInt(catId);
      }
    }

    // Página de Carrinho
    else if (bodyClasses.includes('woocommerce-cart') || window.location.pathname.includes('/cart')) {
      context.page = 'cart';

      const cartCount = document.querySelector('.cart-contents-count, .cart-count, .header-cart-count');
      if (cartCount) {
        context.cartItemsCount = parseInt(cartCount.textContent);
      }

      const cartTotal = document.querySelector('.cart-subtotal .amount, .order-total .amount');
      if (cartTotal) {
        const totalText = cartTotal.textContent.replace(/[^0-9.,]/g, '');
        context.cartTotal = parseFloat(totalText.replace(',', '.'));
      }
    }

    // Página de Checkout
    else if (bodyClasses.includes('woocommerce-checkout') || window.location.pathname.includes('/checkout')) {
      context.page = 'checkout';

      const orderTotal = document.querySelector('.order-total .amount');
      if (orderTotal) {
        const totalText = orderTotal.textContent.replace(/[^0-9.,]/g, '');
        context.cartTotal = parseFloat(totalText.replace(',', '.'));
      }
    }

    return context;
  }

  // Enviar contexto para o widget
  function sendContextToWidget(context) {
    const iframe = document.getElementById('snkhouse-widget-iframe');
    if (!iframe || !iframe.contentWindow) {
      console.warn('⚠️ Widget iframe não encontrado');
      return;
    }

    const message = {
      type: 'PAGE_CONTEXT',
      source: 'snkhouse',
      data: context
    };

    console.log('📤 Enviando contexto para widget:', context);
    iframe.contentWindow.postMessage(message, 'https://snkhouse-bot-widget.vercel.app');
  }

  // Inicializar quando página carregar
  function initContextAwareness() {
    const iframe = document.getElementById('snkhouse-widget-iframe');
    if (!iframe) {
      console.error('❌ Widget iframe não encontrado');
      return;
    }

    iframe.addEventListener('load', function() {
      console.log('✅ Widget iframe carregado');

      // Enviar contexto inicial
      const context = extractPageContext();
      sendContextToWidget(context);

      // Re-enviar contexto quando página mudar (para SPAs)
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

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContextAwareness);
  } else {
    initContextAwareness();
  }

  console.log('✅ SNKHOUSE Widget Context Awareness - Configurado');
})();
</script>

<!-- Mobile Responsive Styles -->
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
<!-- SNKHOUSE Widget - End -->
        <?php
    }
}

// Initialize plugin
new SNKHOUSE_Widget();
