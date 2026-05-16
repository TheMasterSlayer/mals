/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow backend API domain for image optimization if needed
  images: {
    domains: ['localhost'],
  },
  // Expose API URL to the browser bundle
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
};

module.exports = nextConfig;
