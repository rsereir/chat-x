import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MERCURE_URL: process.env.MERCURE_PUBLIC_URL || undefined,
  },
}

export default nextConfig
