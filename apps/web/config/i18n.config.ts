import authEn from "@raypx/auth/localization/en"
import authZh from "@raypx/auth/localization/zh"
import { createI18nServerConfig } from "@raypx/i18n/server"

export const locales = ["en", "zh"] as const
export const defaultLocale = "en" as const

const authLocalization = {
  en: authEn,
  zh: authZh,
}

export type Locale = (typeof locales)[number]

export default createI18nServerConfig({
  locales,
  defaultLocale,
  importMessages: async (locale) => {
    const messages = await import(`../messages/${locale}.json`).then(
      (m) => m.default,
    )

    return {
      common: messages,
      auth: authLocalization[locale as keyof typeof authLocalization] || authEn,
    }
  },
})
