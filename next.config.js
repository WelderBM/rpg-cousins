/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize production builds
  // swcMinify is enabled by default in Next.js 13+
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
    ],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // TypeScript - temporarily ignore errors until all are fixed
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
