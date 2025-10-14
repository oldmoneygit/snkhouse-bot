#!/bin/bash
# Vercel Build Script for Widget in Monorepo
# This script ensures all workspace dependencies are available

set -e

echo "🔧 Starting Widget Build in Monorepo..."

# 1. Show current directory and files
echo "📁 Current directory: $(pwd)"
echo "📦 Files in workspace:"
ls -la

# 2. Check if we have workspace files
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ ERROR: pnpm-workspace.yaml not found!"
    echo "This script must run from the monorepo root."
    exit 1
fi

# 3. Install all workspace dependencies
echo ""
echo "📦 Installing workspace dependencies..."
pnpm install --frozen-lockfile

# 4. Build dependencies first (packages)
echo ""
echo "🏗️  Building workspace packages..."
pnpm build --filter=@snkhouse/database
pnpm build --filter=@snkhouse/analytics
pnpm build --filter=@snkhouse/integrations
pnpm build --filter=@snkhouse/ai-agent

# 5. Build widget
echo ""
echo "🚀 Building widget..."
cd apps/widget
pnpm build

echo ""
echo "✅ Build completed successfully!"
