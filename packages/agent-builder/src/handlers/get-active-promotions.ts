import { getWooCommerceClient } from '@snkhouse/integrations';

export interface GetActivePromotionsInput {
  promotion_type?: string | null;
}

function categorizePromotionType(coupon: any): string {
  if (coupon.code.toLowerCase().includes('bogo') || coupon.code.toLowerCase().includes('2x1')) {
    return 'bogo';
  }
  if (coupon.code.toLowerCase().includes('vip') || coupon.code.toLowerCase().includes('member')) {
    return 'vip';
  }
  if (coupon.discount_type === 'percent') {
    return 'discount';
  }
  if (coupon.discount_type === 'fixed_cart' || coupon.discount_type === 'fixed_product') {
    return 'discount';
  }
  return 'other';
}

export async function getActivePromotionsHandler(input: GetActivePromotionsInput) {
  try {
    console.log(`🎁 [GetPromotions] Fetching active promotions`);

    const wc = getWooCommerceClient();

    // Buscar todos os cupons
    const response = await wc.get('coupons', {
      per_page: 50,
      orderby: 'date',
      order: 'desc'
    });

    const allCoupons = response.data;
    const now = new Date();

    // Filtrar cupons ativos
    const activeCoupons = allCoupons.filter((coupon: any) => {
      // Verificar se não expirou
      if (coupon.date_expires) {
        const expiryDate = new Date(coupon.date_expires);
        if (expiryDate < now) {
          return false;
        }
      }

      // Verificar se ainda tem usos disponíveis
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return false;
      }

      return true;
    });

    console.log(`✅ [GetPromotions] Found ${activeCoupons.length} active promotions`);

    // Mapear para formato amigável
    let results = activeCoupons.map((coupon: any) => {
      const type = categorizePromotionType(coupon);

      // Calcular desconto legível
      let discountText = '';
      if (coupon.discount_type === 'percent') {
        discountText = `${coupon.amount}% de descuento`;
      } else if (coupon.discount_type === 'fixed_cart') {
        discountText = `$${coupon.amount} de descuento en el carrito`;
      } else if (coupon.discount_type === 'fixed_product') {
        discountText = `$${coupon.amount} de descuento en productos`;
      }

      return {
        code: coupon.code,
        name: coupon.description || coupon.code,
        description: discountText,
        type: type,
        discount_type: coupon.discount_type,
        amount: coupon.amount,
        minimum_amount: coupon.minimum_amount || null,
        valid_until: coupon.date_expires || 'Sin límite',
        usage_remaining: coupon.usage_limit ? (coupon.usage_limit - coupon.usage_count) : 'Ilimitado',
        applies_to: coupon.product_ids.length > 0 ? 'selected_products' : 'all_products'
      };
    });

    // Filtrar por tipo se fornecido
    if (input.promotion_type && input.promotion_type !== 'all') {
      results = results.filter((promo: any) => promo.type === input.promotion_type);
    }

    return {
      success: true,
      total_promotions: results.length,
      active_promotions: results
    };

  } catch (error: any) {
    console.error('❌ [GetPromotions] Error:', error.message);

    return {
      success: false,
      error: 'Hubo un problema al consultar las promociones. Intentá de nuevo.',
      active_promotions: []
    };
  }
}
