import crypto from 'crypto';

/**
 * Verifica se o webhook veio realmente do Meta
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  appSecret: string
): boolean {
  if (!signature) {
    console.error('[Webhook] No signature provided');
    return false;
  }

  // Signature vem como "sha256=HASH"
  const signatureHash = signature.split('=')[1];

  if (!signatureHash) {
    console.error('[Webhook] Invalid signature format');
    return false;
  }

  // Gerar HMAC SHA256
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  // Comparação segura (timing-safe)
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signatureHash, 'utf8'),
    Buffer.from(expectedHash, 'utf8')
  );

  if (!isValid) {
    console.error('[Webhook] Signature validation failed');
  }

  return isValid;
}
