/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/docs',
        destination: 'http://127.0.0.1:8000/docs',
      },
      {
        source: '/openapi.json',
        destination: 'http://127.0.0.1:8000/openapi.json',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*/',
      },
    ]
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  /* compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Elimina console.log solo en producción
  }, */
}

export default nextConfig
