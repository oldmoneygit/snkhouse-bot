/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ["@snkhouse/ai-agent"],
  // Disable static optimization completely (widget is 100% dynamic)
  output: "standalone",
};

module.exports = nextConfig;
