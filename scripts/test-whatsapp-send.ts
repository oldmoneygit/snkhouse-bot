import { config } from 'dotenv';
import path from 'path';
import { WhatsAppClient } from '../packages/integrations/src/whatsapp/client';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testWhatsAppSend() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const testNumber = process.env.WHATSAPP_TEST_NUMBER;

  if (!phoneNumberId || !accessToken || !testNumber) {
    console.error('❌ Missing environment variables:');
    console.error('  WHATSAPP_PHONE_NUMBER_ID:', phoneNumberId ? '✓' : '✗');
    console.error('  WHATSAPP_ACCESS_TOKEN:', accessToken ? '✓' : '✗');
    console.error('  WHATSAPP_TEST_NUMBER:', testNumber ? '✓' : '✗');
    process.exit(1);
  }

  const client = new WhatsAppClient({
    phoneNumberId,
    accessToken,
  });

  try {
    console.log('🚀 Testing WhatsApp message send...');
    console.log(`📱 Target: ${testNumber.slice(0, 4)}***\n`);

    const result = await client.sendMessage({
      to: testNumber,
      message: '🤖 Test message from SNKHOUSE Bot!\n\nSistema de integração WhatsApp funcionando correctamente.\n\nHora: ' + new Date().toLocaleTimeString('es-AR'),
    });

    console.log('✅ Message sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n💡 Check your WhatsApp to verify the message was received.');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('📋 Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testWhatsAppSend();
