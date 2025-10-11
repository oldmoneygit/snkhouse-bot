import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

if (!process.env.WOOCOMMERCE_URL) {
  throw new Error('WOOCOMMERCE_URL is not defined');
}

if (!process.env.WOOCOMMERCE_CONSUMER_KEY) {
  throw new Error('WOOCOMMERCE_CONSUMER_KEY is not defined');
}

if (!process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  throw new Error('WOOCOMMERCE_CONSUMER_SECRET is not defined');
}

export const woocommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
});

// Helper function to verify API key
export function verifyApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.AGENT_API_KEY;

  if (!expectedKey) {
    console.warn('[WooCommerce API] AGENT_API_KEY not configured');
    return true; // Allow if not configured (development mode)
  }

  return apiKey === expectedKey;
}
