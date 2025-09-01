import withBundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

type I18nConfig = boolean | Parameters<typeof createNextIntlPlugin>[0]

export interface CreateConfigOptions {
  /** Internal packages to be transpiled */
  transpilePackages?: string[]
  /** Enable MDX support */
  withMDX?: (config: NextConfig) => NextConfig
  /** Additional config overrides */
  override?: Partial<NextConfig>
  /** Enable bundle analyzer */
  bundleAnalyzer?: boolean
  /** Enable i18n support */
  i18n?: I18nConfig
  /** Output mode for deployment (standalone for Docker, undefined for Vercel) */
  output?: "standalone" | "export" | undefined
}

const INTERNAL_PACKAGES = [
  "@raypx/ui",
  "@raypx/auth",
  "@raypx/shared",
  "@raypx/db",
  "@raypx/redis",
  "@raypx/email",
  "@raypx/seo",
  "@raypx/analytics",
]

export function createConfig(options: CreateConfigOptions = {}): NextConfig {
  const {
    transpilePackages = [],
    withMDX,
    override = {},
    bundleAnalyzer = false,
    i18n = false,
    output,
  } = options

  // Determine output mode: use provided option, environment variable, or default
  const outputMode =
    output ??
    (process.env.NEXT_OUTPUT as "standalone" | "export" | undefined) ??
    (process.env.DOCKER_BUILD === "true" ? "standalone" : undefined)

  let nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      esmExternals: true,
    },
    serverExternalPackages: ["prettier"],
    allowedDevOrigins: process.env.NEXT_PUBLIC_AUTH_URL
      ? [process.env.NEXT_PUBLIC_AUTH_URL]
      : [],
    transpilePackages: [...INTERNAL_PACKAGES, ...transpilePackages],
    ...(outputMode && { output: outputMode }),
    ...override,
  }

  // Optional MDX support
  if (withMDX) {
    nextConfig = withMDX(nextConfig)
  }

  // Bundle analyzer support
  if (bundleAnalyzer && process.env.ANALYZE === "true") {
    nextConfig = withBundleAnalyzer({
      enabled: true,
    })(nextConfig)
  }

  if (i18n) {
    const withNextIntl = createNextIntlPlugin(
      typeof i18n === "boolean" ? undefined : i18n,
    )
    nextConfig = withNextIntl(nextConfig)
  }

  return nextConfig
}
