import { createI18nServerConfig } from "@raypx/i18n/server"

export const locales = ["en", "zh"] as const
export const defaultLocale = "en" as const

export type Locale = (typeof locales)[number]

export default createI18nServerConfig({
  locales,
  defaultLocale,
  importMessages: async (locale) => {
    const messages = await import(`../locales/${locale}.json`).then(
      (m) => m.default,
    )

    console.log(messages)

    return messages
  },
})
