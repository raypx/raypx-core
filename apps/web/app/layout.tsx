import { AnalyticsProvider } from "@raypx/analytics"
import { createMetadata } from "@raypx/seo"
import { Toaster } from "@raypx/ui/components/toast"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import type { ReactNode } from "react"
import appConfig from "@/config/app.config"
import "../styles/globals.css"
import { Providers } from "./providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    description: appConfig.description,
  })
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages({ locale })

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <AnalyticsProvider>
              {children}
              <Toaster />
            </AnalyticsProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
