import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import {
  trackProductCardViewed,
  trackProductCardClicked,
  trackProductAddToCart
} from "@snkhouse/analytics";

// Toast notification types
type ToastType = "success" | "error" | null;

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  salePrice?: string;
  image: string;
  category: string;
  inStock: boolean;
  link: string;
  shortDescription?: string;
  conversationId?: string; // Para analytics
}

/**
 * ProductCard Component
 *
 * Displays a rich visual card for a product with:
 * - Product image
 * - Name, price, category
 * - "Add to Cart" button (opens WooCommerce cart page)
 * - Link to product page
 *
 * Used by: ProductList component
 * Triggered when: AI mentions products in response
 */
export function ProductCard(props: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({
    type: null,
    message: "",
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Track product card view when component mounts
  useEffect(() => {
    trackProductCardViewed({
      product_id: props.id,
      product_name: props.name,
      product_price: props.salePrice || props.price,
      in_stock: props.inStock,
      conversation_id: props.conversationId,
      source: 'widget'
    });
  }, []); // Run only once on mount

  const handleAddToCart = async () => {
    // Track add to cart click
    trackProductAddToCart({
      product_id: props.id,
      product_name: props.name,
      product_price: props.salePrice || props.price,
      in_stock: props.inStock,
      conversation_id: props.conversationId,
      source: 'widget'
    });

    setIsAdding(true);
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: props.id, quantity: 1 }),
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
        // Show success toast
        setToast({
          type: "success",
          message: "¡Producto agregado al carrito!",
        });

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
          setToast({ type: null, message: "" });
        }, 3000);

        // Open WooCommerce cart page in new tab after short delay
        setTimeout(() => {
          window.open(data.redirectUrl, "_blank", "noopener,noreferrer");
        }, 500);
      } else {
        throw new Error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);

      // Show error toast
      setToast({
        type: "error",
        message: "Error al agregar. Por favor intenta de nuevo.",
      });

      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setToast({ type: null, message: "" });
      }, 4000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleProductClick = () => {
    // Track product card click (link to product page)
    trackProductCardClicked({
      product_id: props.id,
      product_name: props.name,
      product_price: props.salePrice || props.price,
      in_stock: props.inStock,
      conversation_id: props.conversationId,
      source: 'widget'
    });
  };

  const displayPrice = props.salePrice || props.price;
  const hasDiscount = Boolean(props.salePrice);

  // Sanitize HTML content to prevent XSS
  const sanitizedDescription = props.shortDescription
    ? DOMPurify.sanitize(props.shortDescription)
    : "";

  return (
    <div className="product-card bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200 hover:shadow-lg transition-shadow duration-200 relative">
      {/* Image Container */}
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md bg-gray-100">
        {/* Loading Placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Error Fallback */}
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-gray-500">Imagen no disponible</span>
          </div>
        )}

        {/* Actual Image */}
        <img
          src={props.image}
          alt={props.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.warn(`⚠️ [ProductCard] Failed to load image for product ${props.id}`);
            setImageError(true);
          }}
        />

        {/* Out of Stock Overlay */}
        {!props.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Category Badge */}
      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
        {props.category}
      </span>

      {/* Product Name */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
        {props.name}
      </h3>

      {/* Short Description (if available) */}
      {sanitizedDescription && (
        <div
          className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      )}

      {/* Price Display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-lg font-bold text-gray-900">
          {displayPrice}
        </span>
        {hasDiscount && (
          <span className="text-sm text-gray-500 line-through">
            {props.price}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {props.inStock ? (
          <>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              aria-label={`Agregar ${props.name} al carrito`}
            >
              {isAdding ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Agregando...</span>
                </>
              ) : (
                "Agregar al Carrito"
              )}
            </button>
            <a
              href={props.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleProductClick}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label={`Ver detalles de ${props.name}`}
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </>
        ) : (
          <a
            href={props.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleProductClick}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md text-center text-sm hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label={`Ver detalles de ${props.name}`}
          >
            Ver Detalles
          </a>
        )}
      </div>

      {/* Toast Notification */}
      {toast.type && (
        <div
          className={`absolute top-2 left-2 right-2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-down z-10 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
          role="alert"
          aria-live="polite"
        >
          {toast.type === "success" ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => setToast({ type: null, message: "" })}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Cerrar notificación"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
