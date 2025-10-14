import { NextRequest, NextResponse } from "next/server";
import { getWooCommerceClient } from "@snkhouse/integrations";

/**
 * GET /api/products/[id]
 *
 * Fetches complete product details from WooCommerce for rendering ProductCard
 *
 * Returns:
 * - Product data optimized for frontend card display
 * - Cached for 5 minutes (via WooCommerce integration)
 *
 * Used by: ProductList component to load product details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);

    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    console.log(`🛍️ [Products API] Fetching product ${productId}`);

    const client = getWooCommerceClient();
    const product = await client.getProduct(productId);

    if (!product) {
      console.warn(`⚠️ [Products API] Product ${productId} not found`);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Extract first image or use placeholder
    const primaryImage = product.images && product.images.length > 0
      ? product.images[0]
      : null;

    const imageUrl = primaryImage?.src || "/placeholder-product.jpg";

    // Extract first category or default
    const primaryCategory = product.categories && product.categories.length > 0
      ? product.categories[0]
      : null;

    const categoryName = primaryCategory?.name || "Sneakers";

    // Format price (WooCommerce returns as string)
    const price = product.price ? `ARS $${parseFloat(product.price).toLocaleString('es-AR')}` : "Consultar";
    const salePrice = product.sale_price ? `ARS $${parseFloat(product.sale_price).toLocaleString('es-AR')}` : undefined;

    // Check stock status
    const inStock = product.stock_status === "instock";

    // Return formatted data for ProductCard component
    const cardData = {
      id: product.id,
      name: product.name,
      price,
      salePrice,
      image: imageUrl,
      category: categoryName,
      inStock,
      link: product.permalink,
      shortDescription: product.short_description || "",
    };

    console.log(`✅ [Products API] Product ${productId} fetched successfully`);

    return NextResponse.json(cardData, {
      headers: {
        // Cache for 5 minutes (WooCommerce data changes infrequently)
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("❌ [Products API] Error fetching product:", {
      productId: params.id,
      error: error?.message || error,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "No pudimos cargar el producto. Por favor intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
