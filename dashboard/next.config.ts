/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  redirects: async () => {
    return []
  },
}

export default nextConfig
