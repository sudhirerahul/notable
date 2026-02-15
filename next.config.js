/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    // Ensure NEXTAUTH_URL is set correctly for Vercel deployments
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001'),
  },
}

module.exports = nextConfig
