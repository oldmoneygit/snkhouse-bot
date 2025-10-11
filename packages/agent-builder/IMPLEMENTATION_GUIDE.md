# Agent Builder Implementation Guide

## 🎯 Status: 90% Complete

### ✅ What's Done

1. **Package Structure Created**
   - `packages/agent-builder/` with all files
   - package.json, tsconfig.json configured
   - Dependencies installed (@openai/agents, @openai/guardrails, zod)

2. **Handlers Implemented**
   - `search-products.ts` - Product search logic
   - `check-stock.ts` - Stock verification with variations
   - `get-product-details.ts` - Complete product info

3. **Workflow Created**
   - `workflow.ts` - Main Agent Builder SDK integration
   - 3 custom tools configured
   - File Search tool configured
   - Guardrails configured
   - Agent instructions in Spanish (Argentine style)

4. **WhatsApp Integration**
   - `agent-builder-processor.ts` created
   - Webhook route updated to use Agent Builder
   - Customer/Conversation management integrated
   - Database save operations

5. **Dependencies**
   - All packages installed
   - whatsapp-service updated with agent-builder dependency

### ⚠️ What Needs to be Fixed

#### 1. WooCommerce Client Method Access

**Problem:** The handlers use `wc.get()` but WooCommerceClient doesn't expose a generic `get` method.

**Solution Options:**

**Option A (Quick Fix)** - Add public get method to WooCommerceClient:

```typescript
// In packages/integrations/src/woocommerce/client.ts

public async get<T = any>(endpoint: string, params?: any): Promise<{ data: T }> {
  return this.client.get<T>(endpoint, { params });
}
```

**Option B (Better)** - Use existing methods:

```typescript
// In search-products.ts - use getProducts instead of wc.get
const products = await wc.getProducts({
  search: input.query,
  per_page: Math.min(input.limit || 5, 10),
  status: 'publish'
});
```

**Option C (Best)** - Create specific methods in WooCommerceClient:

```typescript
// Add to WooCommerceClient
async getProductVariations(productId: number): Promise<any[]> {
  const response = await this.client.get(`/products/${productId}/variations`);
  return response.data;
}

async getProductReviews(productId: number, params?: any): Promise<any[]> {
  const response = await this.client.get('/products/reviews', { params });
  return response.data;
}
```

#### 2. Analytics Tracking (Optional)

Currently commented out to avoid errors. To re-enable:

```typescript
// Uncomment in:
// - packages/agent-builder/src/workflow.ts
// - apps/whatsapp-service/src/lib/agent-builder-processor.ts

// Use correct import:
import { analyticsTracker } from '@snkhouse/analytics';

// Example usage:
await analyticsTracker.trackToolCall({
  tool_name: 'searchProducts',
  parameters: input,
  execution_time_ms: duration
});
```

### 🔧 Quick Fix Instructions

**1. Add get method to WooCommerceClient (5 minutes):**

```bash
cd packages/integrations/src/woocommerce
# Edit client.ts and add after line 82:
```

```typescript
  /**
   * Generic GET method for raw API access
   * Use specific methods (getProduct, getProducts) when available
   */
  public async get<T = any>(endpoint: string, params?: any): Promise<{ data: T }> {
    console.log(`🔍 [WooCommerce] Generic GET: ${endpoint}`);
    try {
      const response = await this.client.get<T>(endpoint, { params });
      console.log(`✅ [WooCommerce] GET ${endpoint} successful`);
      return response;
    } catch (error: any) {
      console.error(`❌ [WooCommerce] GET ${endpoint} failed:`, error.message);
      throw error;
    }
  }
```

**2. Test compilation:**

```bash
cd apps/whatsapp-service
npx tsc --noEmit
```

**3. Build workspace:**

```bash
pnpm build
```

**4. Test locally:**

```bash
pnpm dev
# Send WhatsApp message to test
```

### 📝 Environment Variables Required

Make sure `.env.local` has:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=838782475982078
WHATSAPP_ACCESS_TOKEN=EAASwKkE6M7sB...
WHATSAPP_VERIFY_TOKEN=snkh_webhook_secret_2025

# WooCommerce
WOOCOMMERCE_URL=https://snkhouse.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 🚀 Deployment

After fixes:

```bash
git add -A
git commit -m "feat: integrate OpenAI Agent Builder with WooCommerce tools"
git push origin main
```

### 🔄 Rollback Plan

If something breaks, revert webhook:

```typescript
// In apps/whatsapp-service/src/app/api/webhooks/whatsapp/route.ts
// Line 3: Uncomment old processor
import { processIncomingWhatsAppMessage } from '@/lib/message-processor';
// Line 4: Comment new processor
// import { processMessageWithAgentBuilder } from '@/lib/agent-builder-processor';

// Line 128: Use old processor
await processIncomingWhatsAppMessage(message, value);
```

### 📊 Testing Checklist

- [ ] TypeScript compiles without errors
- [ ] Build succeeds (`pnpm build`)
- [ ] WhatsApp webhook verifies (GET request)
- [ ] WhatsApp message triggers Agent Builder
- [ ] searchProducts returns real products
- [ ] checkStock shows variations/sizes
- [ ] getProductDetails returns full info
- [ ] File Search answers FAQs
- [ ] Guardrails detect hallucinations
- [ ] Messages save to Supabase
- [ ] Customer/Conversation created
- [ ] Response sent via WhatsApp

### 🎉 Success Criteria

When everything works, you should see logs like:

```
🤖 [Agent Builder] Processing message for conversation uuid-123
🛡️ [Agent Builder] Running guardrails...
✅ [Agent Builder] Guardrails passed
🚀 [Agent Builder] Running agent...
🔍 [Agent Builder] Executing searchProducts: { query: "nike" }
✅ [SearchProducts] Found 5 products
✅ [Agent Builder] Response generated in 2500ms
✅ [Agent Builder Processor] Processed in 3000ms
📤 Sending WhatsApp response...
✅ Message processed and response sent successfully
```

### 📚 Next Steps After Completion

1. Monitor performance metrics
2. Add more product categories to category map
3. Re-enable analytics tracking
4. Add tests for handlers
5. Optimize guardrails thresholds
6. Add more FAQ documents to Vector Store
7. Implement order tracking tools

### 💡 Tips

- Test with real WhatsApp first (simpler)
- Check Vercel logs for errors
- Guardrails may need threshold adjustment
- Agent Builder UI allows no-code changes to instructions
- Vector Store can be updated without code changes

---

**Created by:** Claude Code
**Last Updated:** 2025-10-11
