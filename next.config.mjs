/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/e-portal',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/e-portal',
        basePath: false,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
