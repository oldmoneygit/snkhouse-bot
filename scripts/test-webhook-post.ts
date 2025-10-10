import axios from 'axios';

async function testWebhookPost() {
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '573228616012',
                phone_number_id: '838782475982078',
              },
              contacts: [
                {
                  profile: { name: 'Test User' },
                  wa_id: '15556339984',
                },
              ],
              messages: [
                {
                  from: '15556339984',
                  id: 'wamid.TEST123',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: { body: 'Hola! Quiero consultar un pedido' },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  try {
    console.log('🚀 Testing webhook POST...');

    const response = await axios.post(
      'http://localhost:3003/api/webhooks/whatsapp',
      mockPayload
    );

    console.log('✅ Webhook accepted:', response.data);
    console.log('\n💡 Check the server terminal for processing logs.');
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWebhookPost();
