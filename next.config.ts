import type { NextConfig } from "next"

const ADMIN_INTERNAL_PREFIX = "musaAdv"
const ADMIN_PATH_PREFIX =
  process.env.NEXT_PUBLIC_ADMIN_PATH_PREFIX?.replace(/^\/+|\/+$/g, "") || ADMIN_INTERNAL_PREFIX

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    localPatterns: [{ pathname: "/uploads/**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
  },
  serverExternalPackages: ["unzipper", "archiver"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
    ],
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return []
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ]
  },
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
