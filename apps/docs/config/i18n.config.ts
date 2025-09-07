import enMessages from "@raypx/i18n/locales/en"
import zhMessages from "@raypx/i18n/locales/zh"
import { createI18nServerConfig } from "@raypx/i18n/server"

export const locales = ["en", "zh"] as const
export const defaultLocale = "en" as const

export type Locale = (typeof locales)[number]

const messages: Record<Locale, Record<string, unknown>> = {
  en: enMessages,
  zh: zhMessages,
}

export default createI18nServerConfig({
  locales,
  defaultLocale,
  importMessages: (locale) => messages[locale as Locale],
})
