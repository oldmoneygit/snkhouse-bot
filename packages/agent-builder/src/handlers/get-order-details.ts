import { getWooCommerceClient } from "@snkhouse/integrations";

export interface GetOrderDetailsInput {
  order_id: string;
  customer_email: string;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente de pago",
    processing: "Procesando",
    "on-hold": "En espera",
    completed: "Completado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    failed: "Fallido",
  };
  return labels[status] || status;
}

function estimateDelivery(orderDate: string, status: string): string {
  if (status === "completed") return "Entregado";
  if (status === "cancelled" || status === "refunded") return "N/A";

  const created = new Date(orderDate);
  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + 10); // 10 días hábiles estimado
  return estimated.toISOString().split("T")[0] ?? "N/A";
}

export async function getOrderDetailsHandler(input: GetOrderDetailsInput) {
  try {
    console.log(`📦 [GetOrderDetails] Fetching order: ${input.order_id}`);

    const wc = getWooCommerceClient();

    // Buscar pedido
    const response = await wc.get(`orders/${input.order_id}`);
    const order = response.data;

    console.log(
      `📋 [GetOrderDetails] Order found, customer: ${order.billing.email}`,
    );

    // SEGURANÇA: Validar email do cliente
    if (
      order.billing.email.toLowerCase() !== input.customer_email.toLowerCase()
    ) {
      console.warn(
        `⚠️ [GetOrderDetails] Email mismatch! Order: ${order.billing.email}, Provided: ${input.customer_email}`,
      );
      return {
        success: false,
        error:
          "El email no coincide con el pedido. Por favor verifica tus datos.",
      };
    }

    // Extraer código de tracking de meta_data
    const tracking = order.meta_data?.find(
      (meta: any) =>
        meta.key === "_tracking_number" || meta.key === "tracking_number",
    );

    // Construir respuesta detallada
    const result = {
      success: true,
      order_id: order.id.toString(),
      order_number: order.number || order.id.toString(),
      status: order.status,
      status_label: getStatusLabel(order.status),
      created_date: order.date_created.split("T")[0],
      total: `${order.total} ${order.currency}`,
      currency: order.currency,
      customer: {
        name: `${order.billing.first_name} ${order.billing.last_name}`,
        email: order.billing.email,
        phone: order.billing.phone,
      },
      products: order.line_items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: `${item.total} ${order.currency}`,
        sku: item.sku,
        // Extrair talle/size de variações
        size:
          item.meta_data?.find(
            (m: any) =>
              m.key.toLowerCase() === "size" || m.key.toLowerCase() === "talla",
          )?.value || null,
      })),
      shipping_address: {
        address_1: order.shipping.address_1,
        address_2: order.shipping.address_2 || "",
        city: order.shipping.city,
        state: order.shipping.state,
        postcode: order.shipping.postcode,
        country: order.shipping.country,
      },
      shipping_method: order.shipping_lines[0]?.method_title || "Standard",
      payment_method: order.payment_method_title || "N/A",
      tracking_code: tracking?.value || null,
      estimated_delivery: estimateDelivery(order.date_created, order.status),
    };

    console.log(`✅ [GetOrderDetails] Order details retrieved successfully`);

    return result;
  } catch (error: any) {
    console.error("❌ [GetOrderDetails] Error:", error.message);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: `No encontramos el pedido #${input.order_id}. Verificá el número de pedido.`,
      };
    }

    return {
      success: false,
      error:
        "Hubo un problema al consultar el pedido. Intentá de nuevo en unos segundos.",
    };
  }
}
