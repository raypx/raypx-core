import { defineRouting } from "next-intl/routing"

export const DEFAULT_LOCALE = "en"
export const LOCALES = ["en", "zh"]

// The name of the cookie that is used to determine the locale
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE"

/**
 * Next.js internationalized routing
 *
 * https://next-intl.dev/docs/routing
 * https://github.com/amannn/next-intl/blob/main/examples/example-app-router/src/i18n/routing.ts
 */
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: LOCALES,
  // Default locale when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Enable auto locale detection for better UX
  // https://next-intl.dev/docs/routing/middleware#locale-detection
  localeDetection: true,

  // Once a locale is detected, it will be remembered for
  // future requests by being stored in the NEXT_LOCALE cookie.
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    // Set cookie to expire in 1 year for better UX
    maxAge: 60 * 60 * 24 * 365,
    // Enable cookie for all paths
    sameSite: "lax",
    // Secure cookie in production
    secure: process.env.NODE_ENV === "production",
  },

  // The prefix to use for the locale in the URL
  // Use "always" for better SEO and clearer URLs
  // https://next-intl.dev/docs/routing#locale-prefix
  localePrefix: "as-needed",
})
