/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['@feai/shared'],
  experimental: {},
  async redirects() {
    return [
      {
        // The technical-approach page is now a section on the home page.
        source: '/technical-approach',
        destination: '/#technical-approach',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/((?!api/auth|login).*)',
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
};

module.exports = nextConfig;
