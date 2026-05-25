// lib/services/yalidineService.ts
import type { YalidineParcelPayload, YalidineParcelResponse } from "@/types";

const YALIDINE_BASE_URL = "https://api.yalidine.app/v1";

function getHeaders(): HeadersInit {
  const apiId = process.env.YALIDINE_API_ID;
  const apiToken = process.env.YALIDINE_API_TOKEN;

  if (!apiId || !apiToken) {
    throw new Error("Yalidine API credentials not configured. Set YALIDINE_API_ID and YALIDINE_API_TOKEN.");
  }

  return {
    "Content-Type": "application/json",
    "X-API-ID": apiId,
    "X-API-TOKEN": apiToken,
  };
}

/**
 * Create a parcel in Yalidine and return tracking code
 */
export async function createYalidineParcel(
  payload: YalidineParcelPayload
): Promise<YalidineParcelResponse> {
  const response = await fetch(`${YALIDINE_BASE_URL}/parcels/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify([payload]), // Yalidine accepts array
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Yalidine API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  
  // Yalidine returns array of results
  const result = Array.isArray(data) ? data[0] : data;
  
  return {
    success: true,
    tracking: result.tracking || result.order_id,
    order_id: result.order_id || result.id,
    label_url: result.label_url,
  };
}

/**
 * Get parcel tracking status from Yalidine
 */
export async function getYalidineTracking(trackingCode: string) {
  const response = await fetch(
    `${YALIDINE_BASE_URL}/parcels/?tracking=${trackingCode}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Yalidine tracking error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get available delivery fees per wilaya from Yalidine
 */
export async function getYalidineDeliveryFees() {
  const response = await fetch(`${YALIDINE_BASE_URL}/deliveryFees/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Yalidine fees error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get available communes for a wilaya from Yalidine
 */
export async function getYalidineCommunes(wilayaId: number) {
  const response = await fetch(
    `${YALIDINE_BASE_URL}/communes/?wilaya_id=${wilayaId}&page_size=100`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Yalidine communes error: ${response.status}`);
  }

  return response.json();
}

/**
 * Build Yalidine payload from order data
 */
export function buildYalidinePayload(order: {
  customerName: string;
  customerPhone: string;
  addressDetails?: string | null;
  total: number;
  shippingAddress: {
    wilayaCode: number;
    commune: string;
    shippingType: string;
  };
  items: { titleAr: string; quantity: number }[];
}): YalidineParcelPayload {
  const senderWilayaId = parseInt(process.env.YALIDINE_SENDER_WILAYA_ID || "16");
  const senderName = process.env.YALIDINE_SENDER_NAME || "متجر الجزائر";

  const nameParts = order.customerName.trim().split(" ");
  const firstname = nameParts[0] || order.customerName;
  const familyname = nameParts.slice(1).join(" ") || "—";

  const productList = order.items
    .map((i) => `${i.titleAr} x${i.quantity}`)
    .join(", ");

  const isStopDesk = order.shippingAddress.shippingType === "desk" ? 1 : 0;

  return {
    firstname,
    familyname,
    contact_phone: order.customerPhone,
    address: order.addressDetails || order.shippingAddress.commune,
    from_wilaya_name: senderName,
    to_wilaya_id: order.shippingAddress.wilayaCode,
    to_commune_name: order.shippingAddress.commune,
    product_list: productList,
    price: Math.round(order.total),
    do_insurance: 0,
    declared_value: Math.round(order.total),
    length: 20,
    width: 15,
    height: 10,
    weight: 1,
    freeshipping: 0,
    is_stopdesk: isStopDesk,
    has_exchange: 0,
  };
}
