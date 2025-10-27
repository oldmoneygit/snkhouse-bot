/**
 * FOLTZ Product List Component
 * Displays multiple products from Shopify
 */

'use client';

import { useEffect, useState } from 'react';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  category: string;
  inStock: boolean;
  link: string;
  shortDescription?: string;
}

interface ProductListProps {
  productIds: number[];
}

export function ProductList({ productIds }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<number>(0);

  useEffect(() => {
    async function loadProducts() {
      if (!productIds || productIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(`📦 Loading ${productIds.length} products...`);

      // Load all products in parallel
      const promises = productIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Product ${id} not found`);
            return res.json();
          })
          .catch((error) => {
            console.error(`❌ Failed to load product ${id}:`, error);
            return null;
          }),
      );

      const results = await Promise.all(promises);

      // Filter out failed loads
      const successfulProducts = results.filter(
        (p): p is Product => p !== null,
      );
      const failedCount = results.length - successfulProducts.length;

      setProducts(successfulProducts);
      setErrors(failedCount);
      setLoading(false);

      console.log(
        `✅ Loaded ${successfulProducts.length}/${results.length} products`,
      );
    }

    loadProducts();
  }, [productIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        {productIds.map((id) => (
          <ProductCardSkeleton key={id} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't render anything if no products
  }

  return (
    <div className="my-4">
      {errors > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {errors === 1
            ? '1 producto no pudo ser cargado'
            : `${errors} productos no pudieron ser cargados`}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
