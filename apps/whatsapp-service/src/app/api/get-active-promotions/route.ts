import { NextRequest, NextResponse } from 'next/server';
import { woocommerce, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { promotion_type = 'all' } = body;

    console.log('[get-active-promotions] Fetching promotions, type:', promotion_type);

    // Get coupons (WooCommerce promotions/coupons)
    const params: any = {
      per_page: 100,
      orderby: 'date',
      order: 'desc'
    };

    const response = await woocommerce.get('coupons', params);
    const coupons = response.data;

    // Filter active coupons (not expired)
    const now = new Date();
    const activeCoupons = coupons.filter((coupon: any) => {
      if (coupon.date_expires) {
        const expiryDate = new Date(coupon.date_expires);
        return expiryDate > now;
      }
      return true; // If no expiry date, it's always active
    });

    // Format promotions
    const formattedPromotions = activeCoupons.map((coupon: any) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      amount: coupon.amount,
      date_expires: coupon.date_expires,
      minimum_amount: coupon.minimum_amount,
      maximum_amount: coupon.maximum_amount,
      usage_count: coupon.usage_count,
      usage_limit: coupon.usage_limit
    }));

    // Also include hardcoded SNKHOUSE promotions
    const snkhousePromotions = [
      {
        id: 'promo-buy-1-get-2',
        code: 'COMPRA1LLEVA2',
        description: 'Compra 1 y llévate 2 - Promoción especial en productos seleccionados',
        discount_type: 'special',
        amount: '50%',
        date_expires: null,
        type: 'buy_x_get_y',
        conditions: 'Aplica solo en productos con etiqueta "Compra 1 Lleva 2"'
      },
      {
        id: 'promo-free-shipping',
        code: 'ENVIOGRATIS',
        description: 'Envío gratis a toda América Latina',
        discount_type: 'free_shipping',
        amount: '100%',
        date_expires: null,
        type: 'shipping',
        conditions: 'Aplica a todos los pedidos'
      },
      {
        id: 'promo-vip',
        code: 'VIP',
        description: 'Programa VIP: 3 compras = 1 producto gratis (hasta $50,000 ARS)',
        discount_type: 'loyalty',
        amount: 'Free product',
        date_expires: null,
        type: 'loyalty',
        conditions: 'Sin fecha de expiración'
      }
    ];

    const allPromotions = [...snkhousePromotions, ...formattedPromotions];

    console.log('[get-active-promotions] Found:', allPromotions.length, 'promotions');

    return NextResponse.json({
      success: true,
      count: allPromotions.length,
      promotions: allPromotions
    });

  } catch (error: any) {
    console.error('[get-active-promotions] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener promociones' },
      { status: 500 }
    );
  }
}
