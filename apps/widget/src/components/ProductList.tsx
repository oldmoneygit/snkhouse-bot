import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface Product {
  id: number;
  name: string;
  price: string;
  salePrice?: string;
  image: string;
  category: string;
  inStock: boolean;
  link: string;
  shortDescription?: string;
}

interface ProductListProps {
  productIds: number[];
  conversationId?: string; // Para analytics
}

/**
 * ProductList Component
 *
 * Fetches and displays multiple product cards
 *
 * Features:
 * - Parallel fetching of products (Promise.allSettled for robustness)
 * - Skeleton loading states
 * - Error handling with retry option
 * - Graceful degradation (shows successful products even if some fail)
 *
 * Used by: page.tsx (main widget component)
 * Triggered when: AI response contains product metadata
 */
export function ProductList({ productIds, conversationId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        console.log(`🛍️ [ProductList] Loading ${productIds.length} products...`);

        // Fetch all products in parallel for performance
        const promises = productIds.map((id) =>
          fetch(`/api/products/${id}`).then(async (res) => {
            if (!res.ok) {
              console.warn(`⚠️ [ProductList] Product ${id} failed: ${res.status}`);
              throw new Error(`Product ${id} not found`);
            }
            return res.json();
          })
        );

        // Use Promise.allSettled to handle partial failures gracefully
        const results = await Promise.allSettled(promises);

        // Filter successful products
        const successfulProducts = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => (result as PromiseFulfilledResult<Product>).value);

        console.log(`✅ [ProductList] Loaded ${successfulProducts.length}/${productIds.length} products`);

        if (successfulProducts.length === 0) {
          throw new Error("No pudimos cargar los productos");
        }

        setProducts(successfulProducts);
      } catch (err) {
        console.error("❌ [ProductList] Error loading products:", err);
        setError("No pudimos cargar los productos. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    if (productIds.length > 0) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [productIds]);

  // Loading state: Show skeleton cards
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Cargando productos">
        {productIds.map((id) => (
          <ProductCardSkeleton key={id} />
        ))}
      </div>
    );
  }

  // Error state: Show error message
  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm"
        role="alert"
        aria-live="polite"
      >
        <p className="font-semibold mb-1">Error al cargar productos</p>
        <p>{error}</p>
      </div>
    );
  }

  // Empty state (shouldn't happen but defensive programming)
  if (products.length === 0) {
    return null;
  }

  // Success state: Render product cards
  return (
    <div className="space-y-3" role="list" aria-label="Productos encontrados">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          conversationId={conversationId}
        />
      ))}
    </div>
  );
}
