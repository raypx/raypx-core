import { createI18nServerConfig } from "@raypx/i18n/server"

export const locales = ["en", "zh"] as const
export const defaultLocale = "en" as const

export type Locale = (typeof locales)[number]

const authMessages: Record<Locale, () => Promise<Record<string, unknown>>> = {
  en: () => import("@raypx/auth/localization/en"),
  zh: () => import("@raypx/auth/localization/zh"),
}

const config = createI18nServerConfig({
  locales,
  defaultLocale,
  importMessages: async (locale) => {
    const messages = {
      common: (await import(`../locales/${locale}/common.json`)).default,
      auth: (await authMessages[locale as Locale]()).default,
      navigation: (await import(`../locales/${locale}/navigation.json`))
        .default,
      layout: (await import(`../locales/${locale}/layout.json`)).default,
    }

    return messages
  },
})

export const { getRequestConfig, routing } = config

export default getRequestConfig
