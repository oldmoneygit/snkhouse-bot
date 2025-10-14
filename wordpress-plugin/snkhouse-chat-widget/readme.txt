=== SNKHOUSE Widget ===
Contributors: SNKHOUSE
Tags: chat, widget, ai, customer-service, woocommerce
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Widget de atendimento con IA para SNKHOUSE. Incluye chat en tiempo real, context awareness y product cards.

== Description ==

SNKHOUSE Widget es un sistema de chat con inteligencia artificial que se integra perfectamente con tu sitio WooCommerce.

= Features =

* 💬 Chat en tiempo real con IA (OpenAI GPT-4)
* 🎯 Context Awareness - El bot sabe qué página está viendo el usuario
* 📦 Product Cards - Productos renderizados como cards interactivos
* 🛒 Add to Cart - Agregar productos directamente desde el chat
* 📊 Analytics - Tracking de conversaciones y métricas
* 📱 Responsive - Funciona en desktop y mobile
* ⚡ Streaming - Respuestas en tiempo real (como ChatGPT)

= Context Awareness =

El widget detecta automáticamente:

* Página de producto (nombre, precio, stock)
* Página de categoría
* Carrito de compras (items, total)
* Checkout

Y envía esta información a la IA para dar respuestas más precisas y personalizadas.

= Configuración =

Después de activar el plugin, ve a **Configuración → SNKHOUSE Widget** para:

* Activar/desactivar el widget
* Cambiar la posición (derecha/izquierda)
* Ajustar el tamaño
* Ver pruebas de funcionamiento

== Installation ==

= Instalación Automática =

1. Descarga el archivo `snkhouse-widget.zip`
2. Ve a **Plugins → Añadir Nuevo**
3. Haz clic en **Subir Plugin**
4. Selecciona el archivo `snkhouse-widget.zip`
5. Haz clic en **Instalar Ahora**
6. Activa el plugin

= Instalación Manual =

1. Descarga el archivo `snkhouse-widget.zip`
2. Descomprime el archivo
3. Sube la carpeta `snkhouse-widget` a `/wp-content/plugins/`
4. Activa el plugin desde el menú **Plugins** en WordPress

= Después de la Instalación =

1. Ve a **Configuración → SNKHOUSE Widget**
2. Verifica que el widget esté activado
3. Visita tu sitio web
4. El widget debe aparecer en la esquina inferior

== Frequently Asked Questions ==

= ¿El widget funciona en mobile? =

Sí, el widget es completamente responsive. En mobile ocupa la pantalla completa para mejor experiencia.

= ¿Necesito configurar algo más? =

No, el plugin funciona out-of-the-box. Solo instala, activa y listo.

= ¿Cómo pruebo que Context Awareness funciona? =

1. Abre un producto en tu sitio
2. Abre el widget
3. Pregunta: "que producto estoy viendo?"
4. El bot debe responder con el nombre del producto actual

= ¿El widget afecta la velocidad del sitio? =

No, el widget se carga en un iframe separado y no afecta el rendimiento de tu sitio.

= ¿Puedo personalizar el diseño? =

Sí, puedes cambiar la posición y tamaño desde la página de configuración.

= ¿Funciona con cualquier tema de WordPress? =

Sí, el plugin es compatible con cualquier tema.

== Screenshots ==

1. Widget en el sitio
2. Chat abierto
3. Product Cards
4. Página de configuración
5. Context Awareness en acción

== Changelog ==

= 1.0.0 - 2025-01-14 =
* Lanzamiento inicial
* Chat con IA en tiempo real
* Context Awareness
* Product Cards
* Add to Cart
* Analytics tracking
* Configuración avanzada

== Upgrade Notice ==

= 1.0.0 =
Primera versión del plugin.

== Support ==

Para soporte técnico:

* GitHub: https://github.com/oldmoneygit/snkhouse-bot/issues
* Documentación: https://github.com/oldmoneygit/snkhouse-bot/blob/main/docs/

== Privacy Policy ==

El plugin se conecta a https://snkhouse-bot-widget.vercel.app para cargar el widget.

Los datos de conversación se almacenan en Supabase (PostgreSQL) y son utilizados únicamente para mejorar el servicio.

No se comparten datos con terceros.
