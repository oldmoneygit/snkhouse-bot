# @snkhouse/agent-builder

OpenAI Agent Builder integration for SNKHOUSE Bot.

## Overview

This package integrates OpenAI's Agent Builder SDK with SNKHOUSE's WooCommerce catalog, providing intelligent product search and recommendations via WhatsApp.

## Features

- **Agent Builder SDK** - Powered by OpenAI's agent framework
- **File Search** - FAQ and product catalog knowledge base
- **Guardrails** - Hallucination detection for accurate responses
- **WooCommerce Integration** - Real-time product data via 3 custom tools

## Tools

### 1. searchProducts
Searches WooCommerce catalog by keywords

**Parameters:**
- `query` (string) - Search term
- `category` (string, optional) - Category filter
- `max_price` (number, optional) - Maximum price
- `limit` (number, optional) - Results limit (default: 5)

### 2. checkStock
Checks real-time stock availability and sizes

**Parameters:**
- `product_id` (number) - WooCommerce product ID

**Returns:**
- For variable products: All available sizes/variations
- For simple products: Stock quantity

### 3. getProductDetails
Gets complete product information

**Parameters:**
- `product_id` (number) - WooCommerce product ID

**Returns:**
- Full description, images, attributes
- Categories, tags, SKU
- Reviews and ratings
- Dimensions and weight

## Usage

```typescript
import { runAgentWorkflow } from '@snkhouse/agent-builder';

const result = await runAgentWorkflow({
  message: "Quiero zapatillas Nike Air Max",
  conversationId: "conv_123",
  customerId: "customer_456"
});

console.log(result.response); // AI-generated response
```

## Configuration

Required environment variables:

```env
OPENAI_API_KEY=sk-proj-xxxxx
WOOCOMMERCE_URL=https://snkhouse.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
```

## Agent Configuration

- **Model:** gpt-4o-mini
- **Workflow ID:** `wf_68ea7686147881909a7d51dc707420c901c614c3f9a1ca75`
- **Vector Store ID:** `vs_68ea79eaea4c8191a5f956db7977fedb`
- **Guardrails:** Hallucination Detection (confidence threshold: 0.7)

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev
```

## Dependencies

- `@openai/agents` - Agent Builder SDK
- `@openai/guardrails` - Safety guardrails
- `@snkhouse/integrations` - WooCommerce client
- `@snkhouse/analytics` - Event tracking

## License

Proprietary - SNKHOUSE
