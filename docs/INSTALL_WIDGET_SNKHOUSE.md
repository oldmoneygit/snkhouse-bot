# 🚀 Instalação do Widget no snkhouse.com

> **Guia completo** para instalar o Widget de IA no site WordPress

---

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Opção 1: Embed via Iframe (Recomendado)](#-opção-1-embed-via-iframe-recomendado)
3. [Opção 2: Plugin WordPress](#-opção-2-plugin-wordpress)
4. [Instalação do Context Snippet](#-instalação-do-context-snippet)
5. [Configuração de Email Collection](#-configuração-de-email-collection)
6. [Testes de Validação](#-testes-de-validação)
7. [Troubleshooting](#-troubleshooting)

---

## ✅ Pré-requisitos

Antes de começar, você precisa:

- [ ] Widget deployado no Vercel (ex: `https://widget.snkhouse.com` ou `https://widget-snkhouse.vercel.app`)
- [ ] Acesso ao WordPress Admin do snkhouse.com
- [ ] Acesso ao Editor de Temas (Aparência → Editor de Temas)

---

## 🎯 Opção 1: Embed via Iframe (Recomendado)

**Vantagens:**
- ✅ Instalação rápida (5 minutos)
- ✅ Não requer plugin
- ✅ Funciona em qualquer tema WordPress
- ✅ Fácil de manter

**Desvantagens:**
- ⚠️ Código fica no tema (se trocar tema, precisa reinstalar)

---

### **Passo 1.1: Criar arquivo do Widget**

1. Acessar WordPress Admin → **Aparência** → **Editor de Temas**
2. Criar novo arquivo: `widget-embed.php`
3. Colar o código abaixo:

```php
<?php
/**
 * SNKHOUSE Widget Embed
 * Adiciona o chat widget de IA em todas as páginas
 *
 * @version 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- SNKHOUSE Chat Widget -->
<div id="snkhouse-widget-container">
    <style>
        /* Widget Container - Fixed na tela */
        #snkhouse-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999999; /* Acima de tudo */
        }

        /* Iframe do Widget */
        #snkhouse-widget-iframe {
            border: none;
            width: 400px;
            height: 600px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            background: white;
        }

        /* Responsivo - Mobile */
        @media (max-width: 768px) {
            #snkhouse-widget-container {
                bottom: 0;
                right: 0;
                left: 0;
                width: 100%;
            }

            #snkhouse-widget-iframe {
                width: 100%;
                height: 100vh;
                border-radius: 0;
            }
        }

        /* Loading Animation */
        #snkhouse-widget-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: #000;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: transform 0.2s;
        }

        #snkhouse-widget-loading:hover {
            transform: scale(1.1);
        }

        #snkhouse-widget-loading svg {
            width: 30px;
            height: 30px;
            fill: white;
        }

        /* Hide loading when iframe loads */
        #snkhouse-widget-container.loaded #snkhouse-widget-loading {
            display: none;
        }
    </style>

    <!-- Loading Button -->
    <div id="snkhouse-widget-loading" onclick="loadSnkhouseWidget()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
    </div>

    <!-- Widget Iframe (carrega on-demand) -->
    <iframe
        id="snkhouse-widget-iframe"
        src=""
        style="display: none;"
        allow="clipboard-write"
        title="SNKHOUSE Chat Widget"
    ></iframe>
</div>

<script>
    /**
     * Carrega o widget sob demanda (lazy loading)
     */
    function loadSnkhouseWidget() {
        const iframe = document.getElementById('snkhouse-widget-iframe');
        const container = document.getElementById('snkhouse-widget-container');

        // Se já carregado, apenas toggle visibility
        if (iframe.src) {
            iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
            return;
        }

        // Primeira vez - carregar iframe
        iframe.src = '<?php echo esc_url(get_option('snkhouse_widget_url', 'https://widget-snkhouse.vercel.app')); ?>';
        iframe.style.display = 'block';
        container.classList.add('loaded');

        console.log('[SNKHOUSE Widget] Loaded successfully');
    }

    // Opcional: Carregar automaticamente após 3 segundos
    // setTimeout(loadSnkhouseWidget, 3000);
</script>
```

4. **Salvar arquivo**

---

### **Passo 1.2: Incluir no footer.php**

1. Editar arquivo `footer.php` do tema
2. Adicionar **ANTES do `<?php wp_footer(); ?>`**:

```php
<!-- SNKHOUSE Widget -->
<?php get_template_part('widget-embed'); ?>
```

3. **Salvar**

---

### **Passo 1.3: Configurar URL do Widget**

**Opção A: Via código (mais fácil)**

Editar `widget-embed.php` e trocar a URL:

```php
iframe.src = 'https://SEU-WIDGET-URL.vercel.app'; // ← TROCAR AQUI
```

**Opção B: Via WordPress Admin (recomendado)**

1. Acessar **Ferramentas** → **Site Health** → **Info**
2. Adicionar opção customizada no `functions.php`:

```php
// Adicionar opção de configuração do widget
add_action('admin_init', function() {
    register_setting('general', 'snkhouse_widget_url', [
        'type' => 'string',
        'default' => 'https://widget-snkhouse.vercel.app',
        'sanitize_callback' => 'esc_url_raw',
    ]);

    add_settings_field(
        'snkhouse_widget_url',
        'SNKHOUSE Widget URL',
        function() {
            $value = get_option('snkhouse_widget_url', 'https://widget-snkhouse.vercel.app');
            echo '<input type="url" name="snkhouse_widget_url" value="' . esc_attr($value) . '" class="regular-text" />';
        },
        'general'
    );
});
```

Agora você pode configurar a URL em: **Configurações** → **Geral** → **SNKHOUSE Widget URL**

---

## 🔌 Opção 2: Plugin WordPress

**Vantagens:**
- ✅ Não depende do tema (se trocar tema, widget continua)
- ✅ Interface de configuração no admin
- ✅ Mais profissional

**Desvantagens:**
- ⚠️ Requer criar plugin (mais complexo)

---

### **Passo 2.1: Criar Plugin**

1. Acessar via FTP/SSH: `/wp-content/plugins/`
2. Criar pasta: `snkhouse-widget`
3. Criar arquivo: `snkhouse-widget.php`

```php
<?php
/**
 * Plugin Name: SNKHOUSE Chat Widget
 * Plugin URI: https://snkhouse.com
 * Description: Widget de chat com IA para atendimento ao cliente
 * Version: 1.0.0
 * Author: SNKHOUSE
 * Author URI: https://snkhouse.com
 * License: GPL v2 or later
 * Text Domain: snkhouse-widget
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SNKHOUSE_Widget {

    private $widget_url;

    public function __construct() {
        // Default widget URL
        $this->widget_url = get_option('snkhouse_widget_url', 'https://widget-snkhouse.vercel.app');

        // Hooks
        add_action('wp_footer', [$this, 'render_widget']);
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    /**
     * Renderiza o widget no footer
     */
    public function render_widget() {
        ?>
        <!-- SNKHOUSE Chat Widget -->
        <div id="snkhouse-widget-container">
            <style>
                /* Widget Container */
                #snkhouse-widget-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999999;
                }

                /* Iframe */
                #snkhouse-widget-iframe {
                    border: none;
                    width: 400px;
                    height: 600px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                    background: white;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    #snkhouse-widget-container {
                        bottom: 0;
                        right: 0;
                        left: 0;
                        width: 100%;
                    }

                    #snkhouse-widget-iframe {
                        width: 100%;
                        height: 100vh;
                        border-radius: 0;
                    }
                }

                /* Loading Button */
                #snkhouse-widget-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 60px;
                    background: #000;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                #snkhouse-widget-loading:hover {
                    transform: scale(1.1);
                }

                #snkhouse-widget-loading svg {
                    width: 30px;
                    height: 30px;
                    fill: white;
                }

                #snkhouse-widget-container.loaded #snkhouse-widget-loading {
                    display: none;
                }
            </style>

            <!-- Loading Button -->
            <div id="snkhouse-widget-loading" onclick="loadSnkhouseWidget()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
            </div>

            <!-- Widget Iframe -->
            <iframe
                id="snkhouse-widget-iframe"
                src=""
                style="display: none;"
                allow="clipboard-write"
                title="SNKHOUSE Chat Widget"
            ></iframe>
        </div>

        <script>
            function loadSnkhouseWidget() {
                const iframe = document.getElementById('snkhouse-widget-iframe');
                const container = document.getElementById('snkhouse-widget-container');

                if (iframe.src) {
                    iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
                    return;
                }

                iframe.src = '<?php echo esc_url($this->widget_url); ?>';
                iframe.style.display = 'block';
                container.classList.add('loaded');

                console.log('[SNKHOUSE Widget] Loaded');
            }

            // Auto-load após 3s (opcional)
            // setTimeout(loadSnkhouseWidget, 3000);
        </script>
        <?php
    }

    /**
     * Adiciona página de configurações
     */
    public function add_settings_page() {
        add_options_page(
            'SNKHOUSE Widget',
            'SNKHOUSE Widget',
            'manage_options',
            'snkhouse-widget',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Registra configurações
     */
    public function register_settings() {
        register_setting('snkhouse_widget_settings', 'snkhouse_widget_url', [
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => 'https://widget-snkhouse.vercel.app',
        ]);

        register_setting('snkhouse_widget_settings', 'snkhouse_widget_autoload', [
            'type' => 'boolean',
            'default' => false,
        ]);
    }

    /**
     * Renderiza página de configurações
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Save settings
        if (isset($_POST['snkhouse_widget_save'])) {
            check_admin_referer('snkhouse_widget_settings');
            update_option('snkhouse_widget_url', esc_url_raw($_POST['widget_url']));
            update_option('snkhouse_widget_autoload', isset($_POST['widget_autoload']));
            echo '<div class="notice notice-success"><p>Configurações salvas!</p></div>';
        }

        $widget_url = get_option('snkhouse_widget_url', 'https://widget-snkhouse.vercel.app');
        $autoload = get_option('snkhouse_widget_autoload', false);
        ?>
        <div class="wrap">
            <h1>SNKHOUSE Widget - Configurações</h1>

            <form method="post" action="">
                <?php wp_nonce_field('snkhouse_widget_settings'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="widget_url">URL do Widget</label>
                        </th>
                        <td>
                            <input
                                type="url"
                                name="widget_url"
                                id="widget_url"
                                value="<?php echo esc_attr($widget_url); ?>"
                                class="regular-text"
                                placeholder="https://widget-snkhouse.vercel.app"
                            />
                            <p class="description">
                                URL onde o widget está deployado (Vercel, etc.)
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="widget_autoload">Carregar Automaticamente</label>
                        </th>
                        <td>
                            <input
                                type="checkbox"
                                name="widget_autoload"
                                id="widget_autoload"
                                <?php checked($autoload, true); ?>
                            />
                            <label for="widget_autoload">
                                Carregar widget automaticamente após 3 segundos
                            </label>
                            <p class="description">
                                Se desmarcado, widget só carrega quando usuário clicar no botão
                            </p>
                        </td>
                    </tr>
                </table>

                <p class="submit">
                    <button type="submit" name="snkhouse_widget_save" class="button button-primary">
                        Salvar Configurações
                    </button>
                </p>
            </form>

            <hr>

            <h2>Status do Widget</h2>
            <p>
                <strong>URL Atual:</strong>
                <code><?php echo esc_html($widget_url); ?></code>
            </p>
            <p>
                <a href="<?php echo esc_url($widget_url); ?>" target="_blank" class="button">
                    Testar Widget
                </a>
            </p>
        </div>
        <?php
    }
}

// Inicializar plugin
new SNKHOUSE_Widget();
```

4. **Salvar arquivo**

---

### **Passo 2.2: Ativar Plugin**

1. Acessar WordPress Admin → **Plugins**
2. Localizar **SNKHOUSE Chat Widget**
3. Clicar em **Ativar**

---

### **Passo 2.3: Configurar Plugin**

1. Acessar **Configurações** → **SNKHOUSE Widget**
2. Inserir URL do widget (ex: `https://widget-snkhouse.vercel.app`)
3. Escolher se quer auto-load ou manual
4. **Salvar**

---

## 🎯 Instalação do Context Snippet

**CRÍTICO**: Para que o widget funcione com Context Awareness, você **DEVE** instalar o context snippet!

Seguir instruções completas em: [INSTALL_CONTEXT_SNIPPET.md](./INSTALL_CONTEXT_SNIPPET.md)

**Resumo rápido:**

1. Copiar `apps/widget/public/context-snippet.js` para tema WordPress
2. Adicionar no `header.php` **ANTES do `</head>`**:

```html
<script src="<?php echo get_template_directory_uri(); ?>/context-snippet.js"></script>
```

3. Configurar `widgetOrigin` para a URL correta do widget

---

## 📧 Configuração de Email Collection

O widget **requer email** para funcionar. Existem 2 formas de coletar:

### **Opção A: Widget coleta email (padrão)**

- Widget mostra modal pedindo email na primeira mensagem
- Email é salvo no localStorage
- **Vantagem**: Funciona out-of-the-box
- **Desvantagem**: Pode causar fricção

### **Opção B: Passar email do WordPress**

Se usuário já está logado no WordPress, passar email automaticamente:

```php
<script>
    // Se usuário logado, passar email para widget
    <?php if (is_user_logged_in()): ?>
        const currentUser = <?php echo json_encode(wp_get_current_user()); ?>;

        // Passar via postMessage quando widget carregar
        window.addEventListener('message', function(event) {
            if (event.data?.type === 'WIDGET_READY') {
                const iframe = document.getElementById('snkhouse-widget-iframe');
                iframe.contentWindow.postMessage({
                    type: 'SET_EMAIL',
                    source: 'snkhouse',
                    email: currentUser.user_email
                }, '*');
            }
        });
    <?php endif; ?>
</script>
```

**Adicionar listener no widget** (apps/widget/src/app/page.tsx):

```typescript
// Escutar SET_EMAIL do parent
if (message.type === 'SET_EMAIL' && message.email) {
  setCustomerEmail(message.email);
  localStorage.setItem('snkhouse_customer_email', message.email);
}
```

---

## ✅ Testes de Validação

### **Teste 1: Widget Aparece**

1. Abrir snkhouse.com
2. Verificar botão do widget no canto inferior direito
3. Clicar no botão
4. Widget deve abrir

**Esperado:**
- ✅ Botão visível
- ✅ Widget carrega ao clicar
- ✅ Sem erros no console

---

### **Teste 2: Email Collection**

1. Enviar primeira mensagem
2. Modal de email deve aparecer
3. Inserir email e enviar
4. Conversa deve iniciar

**Esperado:**
- ✅ Modal aparece
- ✅ Email é salvo
- ✅ Bot responde após email

---

### **Teste 3: Context Awareness**

1. Abrir página de produto (ex: Jordan 1 Chicago)
2. Abrir widget
3. Perguntar: "¿Tienen stock?"

**Esperado:**
- ✅ Bot menciona "Jordan 1 Chicago" especificamente
- ✅ Bot sabe preço e stock
- ✅ Resposta contextual

---

### **Teste 4: Product Cards**

1. Perguntar: "¿Qué zapatillas Nike tienen?"
2. Bot deve mostrar Product Cards

**Esperado:**
- ✅ Cards aparecem com imagem
- ✅ Botão "Agregar al Carrito" funciona
- ✅ Link "Ver Detalles" funciona

---

### **Teste 5: Mobile**

1. Abrir site no celular
2. Clicar no widget
3. Widget deve ocupar tela inteira

**Esperado:**
- ✅ Widget fullscreen
- ✅ Rolagem funciona
- ✅ Botões clicáveis

---

## 🚨 Troubleshooting

### **Problema: Widget não aparece**

**Checklist:**

1. ✅ Verificar se código foi adicionado no `footer.php`
2. ✅ Verificar URL do widget está correta
3. ✅ Abrir Console (F12) → procurar erros
4. ✅ Verificar se tema não está bloqueando `wp_footer()`

**Solução comum:**
- Adicionar `<?php wp_footer(); ?>` no `footer.php` se não existir

---

### **Problema: Widget carrega mas não funciona**

**Checklist:**

1. ✅ Verificar Console do navegador (F12)
2. ✅ Verificar se CORS está configurado no Vercel
3. ✅ Verificar environment variables no Vercel

**Solução comum:**
- Configurar CORS no `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://snkhouse.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

---

### **Problema: Context Awareness não funciona**

**Checklist:**

1. ✅ Verificar se `context-snippet.js` está carregado
2. ✅ Verificar logs no Console:
   ```
   [SNKHOUSE Context] Script loaded
   [SNKHOUSE Context] Sending to widget: {...}
   ```
3. ✅ Verificar `widgetOrigin` está correto

**Solução:** Seguir [INSTALL_CONTEXT_SNIPPET.md](./INSTALL_CONTEXT_SNIPPET.md)

---

### **Problema: Widget lento**

**Causas comuns:**
- Widget carrega muitos assets
- Vercel cold start (primeira request demora)

**Soluções:**
1. ✅ Usar lazy loading (carregar sob demanda) - já implementado!
2. ✅ Configurar Vercel para warm (plano Pro)
3. ✅ Usar CDN para assets estáticos

---

## 📊 Checklist Final

Antes de considerar instalação **COMPLETA**:

- [ ] Widget aparece em todas as páginas
- [ ] Botão de chat visível no canto inferior direito
- [ ] Widget carrega ao clicar
- [ ] Email collection funciona
- [ ] Context Awareness ativado (context-snippet.js instalado)
- [ ] Context Awareness funciona (teste em product page)
- [ ] Product Cards aparecem
- [ ] Botão "Agregar al Carrito" funciona
- [ ] Widget responsivo (funciona no mobile)
- [ ] Sem erros no Console
- [ ] Performance aceitável (carrega em < 2s)

---

## 🎉 Próximos Passos

Após instalação completa:

1. **Monitorar Analytics**
   - Acessar: https://admin.snkhouse.app/analytics
   - Verificar métricas de uso

2. **Coletar Feedback**
   - Perguntar para clientes o que acharam
   - Ajustar system prompt conforme necessário

3. **Otimizar**
   - Analisar conversas no admin
   - Melhorar respostas baseado em dados reais

---

## 📚 Documentação Adicional

- [INSTALL_CONTEXT_SNIPPET.md](./INSTALL_CONTEXT_SNIPPET.md) - Context Awareness
- [PRODUCT_CARDS_TECHNICAL_DOCUMENTATION.md](./PRODUCT_CARDS_TECHNICAL_DOCUMENTATION.md) - Documentação técnica
- [CLAUDE.md](../CLAUDE.md) - Regras gerais do projeto

---

**Instalação criada por**: Claude Code
**Data**: 2025-01-14
**Versão**: 1.0.0
