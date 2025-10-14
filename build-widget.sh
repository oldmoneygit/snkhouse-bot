#!/bin/bash
set -e
export NODE_ENV=production
pnpm install --frozen-lockfile
pnpm --filter @snkhouse/database build
pnpm --filter @snkhouse/analytics build
pnpm --filter @snkhouse/integrations build
pnpm --filter @snkhouse/ai-agent build
pnpm --filter @snkhouse/widget build
