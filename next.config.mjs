import path from 'path'
import { fileURLToPath } from 'url'
import { resolveLaravelApiBase } from './lib/api/public-origin.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev())
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['react-day-picker', 'date-fns'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts', 'framer-motion'],
  },
  outputFileTracingExcludes: {
    '*': [
      '**/*.map',
      '**/*.md',
      'node_modules/sharp/**',
      'node_modules/@img/**',
      'node_modules/@esbuild/**',
      'node_modules/esbuild/**',
      'node_modules/webpack/**',
      'node_modules/typescript/**',
      'node_modules/caniuse-lite/**',
      'node_modules/terser/**',
      'node_modules/@swc/core/**',
    ],
  },
  webpack: (config) => {
    config.resolve.alias['date-fns/locale/en-US'] = path.join(
      __dirname,
      'node_modules/date-fns/locale/en-US.js',
    )
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Browser calls stay on /api. Cloudflare Workers cannot reach 127.0.0.1,
    // so production rewrites go to the public Laravel host.
    const apiBaseUrl = resolveLaravelApiBase()
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
