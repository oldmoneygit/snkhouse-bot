import { NextRequest, NextResponse } from 'next/server';
import { woocommerce, verifyApiKey } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customer_email } = body;

    console.log('[check-vip-status] Checking VIP status for:', customer_email);

    // Search customer
    const customerResponse = await woocommerce.get('customers', {
      email: customer_email,
      per_page: 1
    });

    if (customerResponse.data.length === 0) {
      return NextResponse.json({
        success: true,
        is_vip: false,
        message: 'Cliente no encontrado'
      });
    }

    const customer = customerResponse.data[0];
    const customerId = customer.id;

    // Get all completed orders
    const ordersResponse = await woocommerce.get('orders', {
      customer: customerId,
      status: 'completed',
      per_page: 100
    });

    const completedOrders = ordersResponse.data;
    const totalOrders = completedOrders.length;

    // VIP Program rules: 3 purchases = 1 free product (up to $50,000 ARS)
    const rewardsEarned = Math.floor(totalOrders / 3);
    const ordersUntilNextReward = 3 - (totalOrders % 3);

    // Get VIP rewards used from customer meta_data
    const vipRewardsUsed = customer.meta_data?.find((meta: any) =>
      meta.key === '_vip_rewards_used'
    )?.value || 0;

    const availableRewards = rewardsEarned - vipRewardsUsed;

    // Calculate total spent
    const totalSpent = completedOrders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total);
    }, 0);

    const vipStatus = {
      is_vip: totalOrders >= 3,
      total_orders: totalOrders,
      total_spent: totalSpent.toFixed(2),
      rewards_earned: rewardsEarned,
      rewards_used: vipRewardsUsed,
      rewards_available: availableRewards,
      orders_until_next_reward: ordersUntilNextReward,
      reward_value: '50,000 ARS',
      program_description: '3 compras = 1 producto gratis hasta $50,000 ARS',
      no_expiration: true
    };

    console.log('[check-vip-status] VIP status:', vipStatus);

    return NextResponse.json({
      success: true,
      vip_status: vipStatus
    });

  } catch (error: any) {
    console.error('[check-vip-status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al consultar estado VIP' },
      { status: 500 }
    );
  }
}
