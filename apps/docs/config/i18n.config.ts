import { createI18nServerConfig } from "@raypx/i18n/server"

export const locales = ["en", "zh"] as const
export const defaultLocale = "en" as const

export type Locale = (typeof locales)[number]

const config = createI18nServerConfig({
  locales,
  defaultLocale,
  importMessages: async (locale) => {
    const messages = {
      common: (await import(`../locales/${locale}/common.json`)).default,
      docs: (await import(`../locales/${locale}/docs.json`)).default,
    }

    return messages
  },
})

export const { getRequestConfig, routing } = config

export default getRequestConfig
