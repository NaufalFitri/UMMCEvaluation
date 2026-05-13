const nextConfig = {
  transpilePackages: ['@clerk/nextjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@clerk/nextjs'],
  },
}

export default nextConfig
