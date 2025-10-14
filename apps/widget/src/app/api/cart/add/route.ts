import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/cart/add
 *
 * Adds a product to WooCommerce cart
 *
 * MVP APPROACH (current):
 * - Returns redirect URL to WooCommerce native add-to-cart endpoint
 * - Opens in new tab for user to complete checkout
 *
 * FUTURE MIGRATION (TODO):
 * - Install CoCart plugin (https://cocart.xyz/)
 * - Use CoCart REST API for seamless cart management
 * - Endpoint: POST https://snkhouse.com/wp-json/cocart/v2/cart/add-item
 * - Benefits:
 *   - No redirect needed
 *   - Returns cart_key for session tracking
 *   - Supports product variations (sizes)
 *   - Enables in-widget checkout flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Validation
    if (!productId || typeof productId !== "number") {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    console.log(`🛒 [Cart API] Adding product ${productId} (qty: ${quantity}) to cart`);

    // MVP: Redirect URL to WooCommerce native add-to-cart
    // This URL automatically adds the product to cart when accessed
    const addToCartUrl = `${process.env.WOOCOMMERCE_URL}/?add-to-cart=${productId}&quantity=${quantity}`;

    console.log(`✅ [Cart API] Cart URL generated: ${addToCartUrl}`);

    return NextResponse.json({
      success: true,
      redirectUrl: addToCartUrl,
      message: "Producto listo para agregar al carrito",
    });

    // TODO: Migrate to CoCart REST API
    // Example future implementation:
    /*
    const coCartResponse = await fetch(`${process.env.WOOCOMMERCE_URL}/wp-json/cocart/v2/cart/add-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: productId,
        quantity: quantity,
      }),
    });

    const cartData = await coCartResponse.json();

    return NextResponse.json({
      success: true,
      cart: cartData,
      cartKey: cartData.cart_key,
      message: "Producto agregado al carrito exitosamente",
    });
    */
  } catch (error: any) {
    console.error("❌ [Cart API] Error:", {
      error: error?.message || error,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "No pudimos agregar el producto. Por favor intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "SNKHOUSE Cart API funcionando",
    mode: "MVP (redirect-based)",
    futureUpgrade: "CoCart REST API",
  });
}
