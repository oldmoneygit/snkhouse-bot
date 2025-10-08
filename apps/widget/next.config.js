/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@snkhouse/ai-agent'],
}

module.exports = nextConfig
