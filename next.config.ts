import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    localPatterns: [{ pathname: "/uploads/**" }],
    minimumCacheTTL: 0,
  },
  serverExternalPackages: ["unzipper", "archiver"],
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
