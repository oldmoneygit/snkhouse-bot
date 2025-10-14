/**
 * SNKHOUSE Widget Context Snippet
 *
 * Este script detecta a página atual do site e envia contexto para o widget
 * via postMessage. Deve ser incluído em TODAS as páginas do snkhouse.com.
 *
 * Instalação:
 * <script src="https://widget.snkhouse.com/context-snippet.js"></script>
 *
 * @version 1.0.0
 */

(function() {
  'use strict';

  console.log('[SNKHOUSE Context] Script loaded');

  // Configuração
  const CONFIG = {
    widgetOrigin: 'https://widget.snkhouse.com', // Produção
    // widgetOrigin: 'http://localhost:3000',    // Development
    debugMode: false, // true em development
  };

  /**
   * Detecta tipo de página atual
   */
  function detectPageType() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Product page (WooCommerce padrão: /produto/nome-do-produto/)
    if (path.includes('/produto/') || path.includes('/product/')) {
      return 'product';
    }

    // Category page (/categoria/nome/)
    if (path.includes('/categoria/') || path.includes('/product-category/')) {
      return 'category';
    }

    // Cart page
    if (path.includes('/carrito') || path.includes('/cart')) {
      return 'cart';
    }

    // Checkout page
    if (path.includes('/checkout') || path.includes('/finalizar-compra')) {
      return 'checkout';
    }

    // Homepage
    if (path === '/' || path === '/index.php') {
      return 'home';
    }

    // Default
    return 'home';
  }

  /**
   * Extrai dados de produto (se estiver em página de produto)
   */
  function extractProductData() {
    // WooCommerce armazena dados do produto em variáveis globais
    if (typeof wc_single_product_params !== 'undefined') {
      return {
        productId: parseInt(wc_single_product_params.product_id),
        productName: document.querySelector('.product_title')?.textContent?.trim(),
        productPrice: extractPrice(),
        productInStock: checkStock(),
      };
    }

    // Fallback: tentar extrair do DOM
    const productId = document.querySelector('[data-product-id]')?.getAttribute('data-product-id');
    const productName = document.querySelector('.product_title, h1.product-title')?.textContent?.trim();
    const productPrice = extractPrice();
    const productInStock = checkStock();

    if (productId) {
      return {
        productId: parseInt(productId),
        productName,
        productPrice,
        productInStock,
      };
    }

    return null;
  }

  /**
   * Extrai preço do produto
   */
  function extractPrice() {
    // Tentar pegar preço de venda (se houver)
    const salePrice = document.querySelector('.woocommerce-Price-amount.amount')?.textContent;
    if (salePrice) {
      const priceMatch = salePrice.match(/[\d.,]+/);
      if (priceMatch) {
        return parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.'));
      }
    }

    return null;
  }

  /**
   * Verifica se produto está em stock
   */
  function checkStock() {
    const stockStatus = document.querySelector('.stock')?.textContent?.toLowerCase();

    if (stockStatus) {
      return stockStatus.includes('disponible') ||
             stockStatus.includes('in stock') ||
             stockStatus.includes('hay existencias');
    }

    // Se botão "Agregar al carrito" está visível = em stock
    const addToCartButton = document.querySelector('.single_add_to_cart_button');
    return addToCartButton && !addToCartButton.disabled;
  }

  /**
   * Extrai dados de categoria
   */
  function extractCategoryData() {
    const categoryTitle = document.querySelector('.page-title, .woocommerce-products-header__title')?.textContent?.trim();
    const categoryDescription = document.querySelector('.term-description')?.textContent?.trim();

    // Extrair slug da URL
    const path = window.location.pathname;
    const slugMatch = path.match(/\/categoria\/([^\/]+)/);
    const categorySlug = slugMatch ? slugMatch[1] : null;

    if (categoryTitle) {
      return {
        categoryName: categoryTitle,
        categorySlug,
        categoryDescription,
      };
    }

    return null;
  }

  /**
   * Extrai dados do carrinho
   */
  function extractCartData() {
    // WooCommerce expõe dados do carrinho em fragmentos
    if (typeof wc_cart_fragments_params !== 'undefined') {
      const cartCountElement = document.querySelector('.cart-contents-count, .cart-count');
      const cartCount = cartCountElement ? parseInt(cartCountElement.textContent) : 0;

      const cartTotalElement = document.querySelector('.woocommerce-Price-amount.amount');
      let cartTotal = null;
      if (cartTotalElement) {
        const totalMatch = cartTotalElement.textContent.match(/[\d.,]+/);
        if (totalMatch) {
          cartTotal = parseFloat(totalMatch[0].replace(/\./g, '').replace(',', '.'));
        }
      }

      return {
        cartItemsCount: cartCount,
        cartTotal,
      };
    }

    return null;
  }

  /**
   * Constrói objeto de contexto completo
   */
  function buildPageContext() {
    const pageType = detectPageType();
    const context = {
      page: pageType,
      timestamp: new Date().toISOString(),
    };

    // Adicionar dados específicos por tipo de página
    switch (pageType) {
      case 'product':
        Object.assign(context, extractProductData());
        break;
      case 'category':
        Object.assign(context, extractCategoryData());
        break;
      case 'cart':
        Object.assign(context, extractCartData());
        break;
    }

    return context;
  }

  /**
   * Envia contexto para o widget via postMessage
   */
  function sendContextToWidget() {
    const context = buildPageContext();

    if (CONFIG.debugMode) {
      console.log('[SNKHOUSE Context] Sending to widget:', context);
    }

    // Buscar iframe do widget
    const widgetIframe = document.querySelector('iframe[src*="widget"]');

    if (!widgetIframe || !widgetIframe.contentWindow) {
      console.warn('[SNKHOUSE Context] Widget iframe not found');
      return;
    }

    // Enviar mensagem
    widgetIframe.contentWindow.postMessage(
      {
        type: 'PAGE_CONTEXT',
        source: 'snkhouse',
        data: context,
      },
      CONFIG.widgetOrigin
    );

    if (CONFIG.debugMode) {
      console.log('[SNKHOUSE Context] Message sent successfully');
    }
  }

  /**
   * Escuta quando widget está pronto
   */
  function listenForWidgetReady() {
    window.addEventListener('message', function(event) {
      // Validar origem
      if (event.origin !== CONFIG.widgetOrigin) {
        return;
      }

      // Validar mensagem
      if (event.data?.type === 'WIDGET_READY' && event.data?.source === 'snkhouse-widget') {
        console.log('[SNKHOUSE Context] Widget is ready, sending initial context');
        sendContextToWidget();
      }
    });
  }

  /**
   * Inicialização
   */
  function init() {
    console.log('[SNKHOUSE Context] Initializing...');

    // Enviar contexto quando widget carregar
    listenForWidgetReady();

    // Enviar contexto imediatamente (caso widget já esteja carregado)
    setTimeout(sendContextToWidget, 1000);

    // Re-enviar contexto quando página mudar (SPA navigation)
    let lastPath = window.location.pathname;
    setInterval(function() {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        console.log('[SNKHOUSE Context] Page changed, sending new context');

        // Aguardar DOM atualizar
        setTimeout(sendContextToWidget, 500);
      }
    }, 1000);

    console.log('[SNKHOUSE Context] Initialized successfully');
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
