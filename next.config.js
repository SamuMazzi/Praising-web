/** @type {import('next').NextConfig} */
/*const nextConfig = {
  
} */
const runtimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  //scope: '/app',
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/]
})

module.exports = withPWA({
  reactStrictMode: true,
  // next.js config
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
})

//module.exports = nextConfig
