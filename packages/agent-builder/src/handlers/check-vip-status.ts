import { getWooCommerceClient } from '@snkhouse/integrations';

export interface CheckVipStatusInput {
  customer_email: string;
}

export async function checkVipStatusHandler(input: CheckVipStatusInput) {
  try {
    console.log(`⭐ [CheckVIP] Checking VIP status for: ${input.customer_email}`);

    const wc = getWooCommerceClient();

    // Step 1: Buscar customer por email
    const customersResponse = await wc.get('customers', {
      email: input.customer_email,
      per_page: 1
    });

    if (!customersResponse.data || customersResponse.data.length === 0) {
      return {
        success: false,
        error: 'No encontramos una cuenta con ese email.'
      };
    }

    const customer = customersResponse.data[0];
    const customerId = customer.id;

    console.log(`✅ [CheckVIP] Customer found: ${customer.first_name} ${customer.last_name} (ID: ${customerId})`);

    // Step 2: Buscar todos os pedidos completados
    const ordersResponse = await wc.get('orders', {
      customer: customerId,
      status: 'completed',
      per_page: 100 // Máximo para ter count preciso
    });

    const completedOrders = ordersResponse.data;
    const totalPurchases = completedOrders.length;

    console.log(`📊 [CheckVIP] Total completed purchases: ${totalPurchases}`);

    // Step 3: Calcular recompensas (1 reward a cada 3 compras)
    const rewardsEarned = Math.floor(totalPurchases / 3);
    const purchasesForNext = totalPurchases % 3 === 0 ? 3 : 3 - (totalPurchases % 3);
    const nextRewardAt = totalPurchases + purchasesForNext;

    // Step 4: Verificar se é VIP (mais de 3 compras)
    const isVipMember = totalPurchases >= 3;

    // Step 5: Calcular total gastado
    const totalSpent = completedOrders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total);
    }, 0);

    const result = {
      success: true,
      customer_email: input.customer_email,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      vip_member: isVipMember,
      vip_level: isVipMember ? (rewardsEarned >= 3 ? 'Gold' : 'Silver') : 'None',
      total_purchases: totalPurchases,
      total_spent: `$${totalSpent.toFixed(2)}`,
      purchases_for_next_reward: purchasesForNext,
      rewards_earned: rewardsEarned,
      next_reward_at: nextRewardAt,
      benefits: isVipMember ? [
        '10% descuento en todas las compras',
        'Envío gratis en pedidos >$50.000',
        'Acceso anticipado a nuevos lanzamientos',
        'Soporte prioritario'
      ] : [
        'Realiza 3 compras para desbloquear beneficios VIP'
      ]
    };

    console.log(`✅ [CheckVIP] VIP status calculated. Is VIP: ${isVipMember}, Level: ${result.vip_level}`);

    return result;

  } catch (error: any) {
    console.error('❌ [CheckVIP] Error:', error.message);

    return {
      success: false,
      error: 'Hubo un problema al consultar tu estado VIP. Intentá de nuevo.'
    };
  }
}
