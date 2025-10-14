/**
 * ProductCardSkeleton Component
 *
 * Skeleton loading placeholder for ProductCard
 * Mimics the exact structure of ProductCard for smooth transition
 *
 * Features:
 * - Matches ProductCard dimensions and layout
 * - Shimmer animation effect
 * - Accessible loading state
 */
export function ProductCardSkeleton() {
  return (
    <div
      className="product-card bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200 animate-pulse"
      role="status"
      aria-label="Cargando producto..."
    >
      {/* Image Skeleton */}
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md bg-gray-200">
        <div className="skeleton-shimmer w-full h-full" />
      </div>

      {/* Category Badge Skeleton */}
      <div className="mb-2">
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Title Skeleton */}
      <div className="mb-2 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Price Skeleton */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>

      {/* Description Skeleton */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-md" />
        <div className="w-24 h-10 bg-gray-200 rounded-md" />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Cargando información del producto...</span>
    </div>
  );
}
