import type { NextConfig } from "next"

const ADMIN_INTERNAL_PREFIX = "musaAdv"
const ADMIN_PATH_PREFIX =
  process.env.NEXT_PUBLIC_ADMIN_PATH_PREFIX?.replace(/^\/+|\/+$/g, "") || ADMIN_INTERNAL_PREFIX

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    localPatterns: [{ pathname: "/uploads/**" }],
    minimumCacheTTL: 0,
  },
  serverExternalPackages: ["unzipper", "archiver"],
  async rewrites() {
    if (ADMIN_PATH_PREFIX === ADMIN_INTERNAL_PREFIX) return []
    return [
      { source: `/${ADMIN_PATH_PREFIX}`, destination: `/${ADMIN_INTERNAL_PREFIX}` },
      { source: `/${ADMIN_PATH_PREFIX}/:path*`, destination: `/${ADMIN_INTERNAL_PREFIX}/:path*` },
    ]
  },
  async redirects() {
    if (ADMIN_PATH_PREFIX === ADMIN_INTERNAL_PREFIX) return []
    return [
      { source: `/${ADMIN_INTERNAL_PREFIX}`, destination: `/${ADMIN_PATH_PREFIX}`, permanent: true },
      {
        source: `/${ADMIN_INTERNAL_PREFIX}/:path*`,
        destination: `/${ADMIN_PATH_PREFIX}/:path*`,
        permanent: true,
      },
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/System Volume Information/**",
          "**/$RECYCLE.BIN/**",
        ],
      }
    }
    return config
  },
}

export default nextConfig
