/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimal for Vercel
  output: 'standalone',

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    unoptimized: false,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  experimental: {
    optimizePackageImports: ['gsap', 'firebase'],
  },

  // Three.js is loaded via CDN in Scene.js — tell webpack not to bundle it
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle three — it's loaded from CDN at runtime
      config.externals = config.externals || {};
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
