import { AnalyticsProvider } from "@raypx/analytics"
import { RootProvider } from "fumadocs-ui/provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import appConfig from "@/config/app.config"
import "@/styles/globals.css"
import { Toaster } from "@raypx/ui/components/toast"

const inter = Inter({
  subsets: ["latin"],
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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <AnalyticsProvider>
            {children}
            <Toaster />
          </AnalyticsProvider>
        </RootProvider>
      </body>
    </html>
  )
}
