import appConfig from "@/config/app.config"
import { docsI18nConfig } from "@/lib/docs/i18n"
import "@/styles/globals.css"
import { AnalyticsProvider } from "@raypx/analytics"
import { Toaster } from "@raypx/ui/components/toast"
import { defineI18nUI } from "fumadocs-ui/i18n"
import { RootProvider } from "fumadocs-ui/provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import type { ReactNode } from "react"

const inter = Inter({
  subsets: ["latin"],
})

const { provider } = defineI18nUI(docsI18nConfig, {
  translations: {
    en: {
      displayName: "English",
      search: "Search",
    },
    zh: {
      displayName: "中文",
      search: "搜索",
    },
  },
})

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
  keywords: appConfig.keywords,
  metadataBase: new URL(appConfig.url),
  openGraph: {
    title: appConfig.name,
    description: appConfig.description,
    url: appConfig.url,
    siteName: appConfig.name,
  },
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const messages = await getMessages({ locale: lang })

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider locale={lang} messages={messages}>
          <RootProvider i18n={provider(lang)}>
            <AnalyticsProvider>
              {children}
              <Toaster />
            </AnalyticsProvider>
          </RootProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
