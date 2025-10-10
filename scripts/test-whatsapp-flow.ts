import { config } from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente ANTES de importar qualquer módulo
config({ path: path.resolve(process.cwd(), 'apps/whatsapp-service/.env.local') });

import { processIncomingWhatsAppMessage } from '../apps/whatsapp-service/src/lib/message-processor';

async function testFlow() {
  const mockMessage = {
    from: '5491112345678', // Número fake para teste
    id: `wamid.TEST_${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    type: 'text' as const,
    text: { body: '¡Hola! Quiero ver zapatillas Nike' },
  };

  const mockValue = {
    messaging_product: 'whatsapp' as const,
    metadata: {
      display_phone_number: '573228616012',
      phone_number_id: '838782475982078',
    },
    contacts: [
      {
        profile: { name: 'Test User' },
        wa_id: '5491112345678',
      },
    ],
  };

  try {
    console.log('🚀 Testing WhatsApp full flow...\n');
    console.log('📱 Mock message:', mockMessage.text.body);
    console.log('👤 From:', mockMessage.from.slice(0, 4) + '***\n');

    await processIncomingWhatsAppMessage(mockMessage, mockValue);

    console.log('\n✅ Test completed successfully!');
    console.log('📊 Check Supabase to verify:');
    console.log('  - Customer created in customers table');
    console.log('  - Conversation created in conversations table');
    console.log('  - Messages saved in messages table');
    console.log('\n💡 Note: WhatsApp send will fail with #131030 (number not in allowed list)');
    console.log('   This is expected in development mode.');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testFlow();
