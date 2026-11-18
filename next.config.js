/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build run beside `next dev` without clobbering .next (perf checks).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
