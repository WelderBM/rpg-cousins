/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize production builds
  // swcMinify is enabled by default in Next.js 13+
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'firebase'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
