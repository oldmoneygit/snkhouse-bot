import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'whatsapp-service',
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasWhatsAppPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasWhatsAppToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      hasWhatsAppVerifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
      hasWooCommerceUrl: !!process.env.WOOCOMMERCE_URL,
      hasWooCommerceKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
      hasWooCommerceSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET
    }
  };

  // Aggregate checks
  const checks = {
    supabase: health.environment.hasSupabaseUrl && health.environment.hasSupabaseKey,
    whatsapp: health.environment.hasWhatsAppPhoneId &&
              health.environment.hasWhatsAppToken &&
              health.environment.hasWhatsAppVerifyToken,
    woocommerce: health.environment.hasWooCommerceUrl &&
                 health.environment.hasWooCommerceKey &&
                 health.environment.hasWooCommerceSecret,
    openai: health.environment.hasOpenAI
  };

  health.services = checks;

  // Check for missing critical env vars
  const missing: string[] = [];
  if (!checks.openai) missing.push('OpenAI');
  if (!checks.supabase) missing.push('Supabase');
  if (!checks.whatsapp) missing.push('WhatsApp');
  if (!checks.woocommerce) missing.push('WooCommerce');

  if (missing.length > 0) {
    health.status = 'degraded';
    health.missing = missing;
    health.warning = `Missing configuration for: ${missing.join(', ')}`;
  }

  // Detailed breakdown for debugging
  const missingVars: string[] = [];
  if (!health.environment.hasOpenAI) missingVars.push('OPENAI_API_KEY');
  if (!health.environment.hasSupabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!health.environment.hasSupabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!health.environment.hasWhatsAppPhoneId) missingVars.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!health.environment.hasWhatsAppToken) missingVars.push('WHATSAPP_ACCESS_TOKEN');
  if (!health.environment.hasWhatsAppVerifyToken) missingVars.push('WHATSAPP_VERIFY_TOKEN');
  if (!health.environment.hasWooCommerceUrl) missingVars.push('WOOCOMMERCE_URL');
  if (!health.environment.hasWooCommerceKey) missingVars.push('WOOCOMMERCE_CONSUMER_KEY');
  if (!health.environment.hasWooCommerceSecret) missingVars.push('WOOCOMMERCE_CONSUMER_SECRET');

  if (missingVars.length > 0) {
    health.missingVariables = missingVars;
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  });
}
