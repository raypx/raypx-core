"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"
import type { FC, ReactNode } from "react"
import { useEffect, useState } from "react"
import { envs } from "./envs"

declare global {
  interface Window {
    gtag: any
  }
}

let gtagInstance: any = null

async function loadGtag() {
  if (gtagInstance) return gtagInstance

  try {
    // Try to load gtag module if available
    const gtagModule = await import("gtag" as any)
    gtagInstance = gtagModule.default || gtagModule
    return gtagInstance
  } catch (error) {
    // Fallback to global gtag if module not available
    if (typeof window !== "undefined" && window.gtag) {
      gtagInstance = window.gtag
      return gtagInstance
    }
    // Silent fail - gtag is optional
    return null
  }
}

function GoogleAnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && gtagInstance && envs.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      let url = pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      gtagInstance("config", envs.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      })
    } else if (pathname && window.gtag && envs.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      let url = pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      window.gtag("config", envs.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  return null
}

export const GoogleAnalyticsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      envs.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
      process.env.NODE_ENV === "production"
    ) {
      loadGtag().then((gtag) => {
        if (gtag) {
          gtagInstance = gtag
        }
        setIsLoaded(true)
      })
    } else {
      setIsLoaded(true)
    }
  }, [])

  if (
    !envs.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NODE_ENV !== "production"
  ) {
    return <>{children}</>
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${envs.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${envs.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      {children}
      {isLoaded && <GoogleAnalyticsPageView />}
    </>
  )
}
