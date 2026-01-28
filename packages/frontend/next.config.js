/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
  // Enable transpiling of monorepo packages
  transpilePackages: ['@feai/shared', '@feai/kernel'],
  // Disable static generation for pages that use SessionProvider
  // This prevents the "useContext" errors during build
  experimental: {
    // This allows pages to be rendered dynamically by default
  },
  // Headers for SharedArrayBuffer support (WASM threading)
  // Note: credentialless allows loading cross-origin resources without CORP headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
  // Disable static page generation to prevent SSR context issues
  output: 'standalone',
};

module.exports = nextConfig;
