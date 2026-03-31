/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@archi-legal/domain",
    "@archi-legal/core",
    "@archi-legal/db",
    "@archi-legal/ai"
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
