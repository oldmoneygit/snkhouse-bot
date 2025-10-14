#!/bin/bash
# Deploy Widget to Vercel - Monorepo Configuration
# Execute from project root

echo "🚀 Deploying SNKHOUSE Widget to Vercel..."
echo ""

# 1. Ensure we're in project root
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Are you in project root?"
    exit 1
fi

# 2. Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# 3. Login to Vercel
echo "🔐 Logging into Vercel..."
vercel whoami || vercel login

# 4. Deploy with correct settings
echo ""
echo "📤 Deploying to production..."
echo ""
echo "⚙️  When prompted, use these settings:"
echo "   - Set up and deploy? Y"
echo "   - Link to existing project? N (first time) or Y (if exists)"
echo "   - Project name: snkhouse-widget"
echo "   - Directory: ./ (root)"
echo "   - Want to modify settings? N"
echo ""
echo "Press Enter to continue..."
read

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔐 Don't forget to add environment variables:"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "   vercel env add OPENAI_API_KEY production"
echo "   vercel env add WOOCOMMERCE_URL production"
echo "   vercel env add WOOCOMMERCE_CONSUMER_KEY production"
echo "   vercel env add WOOCOMMERCE_CONSUMER_SECRET production"
echo ""
echo "📚 See docs/VERCEL_ENV_VARS_CHECKLIST.md for details"
