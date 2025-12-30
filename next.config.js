/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co', 'localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/greenlight/**',
      },
    ],
  },
}

module.exports = nextConfig

