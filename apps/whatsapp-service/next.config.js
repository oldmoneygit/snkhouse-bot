/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@snkhouse/ai-agent', '@snkhouse/database', '@snkhouse/integrations', '@snkhouse/analytics'],
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

module.exports = nextConfig
