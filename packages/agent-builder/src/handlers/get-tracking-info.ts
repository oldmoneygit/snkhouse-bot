import { getWooCommerceClient } from '@snkhouse/integrations';

export interface GetTrackingInfoInput {
  order_id: string;
  customer_email: string;
}

function generateTrackingUrl(provider: string, code: string): string {
  const urls: Record<string, string> = {
    'Correo Argentino': `https://www.correoargentino.com.ar/formularios/e-commerce?id=${code}`,
    'Andreani': `https://www.andreani.com/#!/informacionEnvio/${code}`,
    'OCA': `https://www1.oca.com.ar/OEPTrackingWeb/OEPTracking.html?numero=${code}`,
    'DHL': `https://www.dhl.com/ar-es/home/tracking/tracking-express.html?submit=1&tracking-id=${code}`,
    'FedEx': `https://www.fedex.com/fedextrack/?tracknumbers=${code}`
  };

  return urls[provider] || urls['Correo Argentino'];
}

function getShippingStatus(orderStatus: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'pending_shipment',
    'processing': 'preparing',
    'on-hold': 'on_hold',
    'completed': 'delivered',
    'cancelled': 'cancelled'
  };

  return statusMap[orderStatus] || 'in_transit';
}

function estimateDelivery(orderDate: string, status: string): string {
  if (status === 'completed') return 'Entregado';
  if (status === 'cancelled') return 'N/A';

  const created = new Date(orderDate);
  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + 10);
  return estimated.toISOString().split('T')[0];
}

export async function getTrackingInfoHandler(input: GetTrackingInfoInput) {
  try {
    console.log(`📦 [GetTracking] Fetching tracking for order: ${input.order_id}`);

    const wc = getWooCommerceClient();

    // Buscar pedido
    const response = await wc.get(`orders/${input.order_id}`);
    const order = response.data;

    // SEGURANÇA: Validar email
    if (order.billing.email.toLowerCase() !== input.customer_email.toLowerCase()) {
      console.warn(`⚠️ [GetTracking] Email mismatch!`);
      return {
        success: false,
        error: 'El email no coincide con el pedido.'
      };
    }

    // Buscar tracking code em meta_data
    const trackingMeta = order.meta_data?.find((meta: any) =>
      meta.key === '_tracking_number' ||
      meta.key === 'tracking_number' ||
      meta.key === '_shipment_tracking_number'
    );

    const providerMeta = order.meta_data?.find((meta: any) =>
      meta.key === '_tracking_provider' ||
      meta.key === 'tracking_provider' ||
      meta.key === '_shipment_tracking_provider'
    );

    const trackingCode = trackingMeta?.value || null;
    const provider = providerMeta?.value || 'Correo Argentino';

    const hasTracking = !!trackingCode;

    const result = {
      success: true,
      order_id: input.order_id,
      tracking_code: trackingCode,
      tracking_provider: provider,
      tracking_url: trackingCode ? generateTrackingUrl(provider, trackingCode) : null,
      shipping_status: getShippingStatus(order.status),
      estimated_delivery: estimateDelivery(order.date_created, order.status),
      has_tracking: hasTracking,
      message: hasTracking
        ? `Tu pedido está en camino con código de seguimiento: ${trackingCode}`
        : 'Tu pedido aún no tiene código de tracking. Estará disponible en 24-48hs.'
    };

    console.log(`✅ [GetTracking] Tracking info retrieved. Has tracking: ${hasTracking}`);

    return result;

  } catch (error: any) {
    console.error('❌ [GetTracking] Error:', error.message);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: `No encontramos el pedido #${input.order_id}.`
      };
    }

    return {
      success: false,
      error: 'Hubo un problema al consultar el tracking. Intentá de nuevo.'
    };
  }
}
