/**
 * FOLTZ Product Card Component
 * Displays Shopify product with FOLTZ branding
 */

'use client';

import { useState } from 'react';

interface ProductCardProps {
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

export function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  category,
  inStock,
  link,
  shortDescription,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const hasDiscount = salePrice && salePrice > price;
  const discount = hasDiscount
    ? Math.round(((salePrice - price) / salePrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100">
        {imageError ? (
          <div className="w-full h-48 flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            className="product-card-image"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Category badge */}
        {category && (
          <div className="absolute top-2 left-2 bg-foltz-black text-white px-2 py-1 rounded text-xs font-semibold">
            {category}
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-foltz-yellow text-foltz-black px-2 py-1 rounded text-xs font-bold">
            -{discount}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product name */}
        <h3 className="font-semibold text-lg text-foltz-black mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        {shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {shortDescription}
          </p>
        )}

        {/* Prices */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-foltz-black">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(salePrice || 0)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-foltz-yellow hover:bg-foltz-yellow-500 text-foltz-black font-semibold py-2 px-4 rounded-lg text-center transition-all duration-200 hover:-translate-y-1"
          >
            Ver Detalles
          </a>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
