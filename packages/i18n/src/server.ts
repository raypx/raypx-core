import { getRequestConfig } from "next-intl/server"
import type { Promisable } from "type-fest"

export * from "next-intl/server"
export * from "./services/locale"

import { getUserLocale, setUserLocale } from "./services/locale"

export * from "./config"

export interface I18nServerConfigOptions {
  getLocale?: () => Promise<string> | string
  locales: readonly string[]
  defaultLocale: string
  importMessages: (locale: string) => Promisable<Record<string, unknown>>
}

export function createI18nServerConfig(options: I18nServerConfigOptions) {
  const {
    getLocale = getUserLocale,
    importMessages,
    locales,
    defaultLocale,
  } = options

  return getRequestConfig(async () => {
    let lang = await getLocale()
    if (!locales.includes(lang)) {
      lang = defaultLocale
    }
    const messages = await importMessages(lang)
    return {
      locale: lang,
      messages: messages,
    }
  })
}

export { getUserLocale, setUserLocale }
