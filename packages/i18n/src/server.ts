import { defineRouting } from "next-intl/routing";
import { getRequestConfig } from "next-intl/server";
import type { Promisable } from "type-fest";

export * from "./services/locale";

import { getUserLocale, setUserLocale } from "./services/locale";

export * from "./config";

export const DEFAULT_LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export interface I18nServerConfigOptions {
  getLocale?: () => Promise<string> | string;
  locales: readonly string[];
  defaultLocale: string;
  localeCookieName?: string;
  importMessages: (locale: string) => Promisable<Record<string, unknown>>;
}

export function createI18nServerConfig(options: I18nServerConfigOptions) {
  const {
    getLocale = getUserLocale,
    importMessages,
    locales,
    defaultLocale,
    localeCookieName = DEFAULT_LOCALE_COOKIE_NAME,
  } = options;

  const routing = defineRouting({
    // A list of all locales that are supported
    locales,
    // Default locale when no locale matches
    defaultLocale,

    // Enable auto locale detection for better UX
    // https://next-intl.dev/docs/routing/middleware#locale-detection
    localeDetection: true,

    // Once a locale is detected, it will be remembered for
    // future requests by being stored in the NEXT_LOCALE cookie.
    localeCookie: {
      name: localeCookieName,
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
  });

  return {
    getRequestConfig: getRequestConfig(async () => {
      let lang = await getLocale();
      if (!locales.includes(lang)) {
        lang = defaultLocale;
      }
      const messages = await importMessages(lang);
      return {
        locale: lang,
        messages: messages,
      };
    }),
    routing,
  };
}

export { getUserLocale, setUserLocale };
