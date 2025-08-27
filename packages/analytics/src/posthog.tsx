"use client"

import { usePathname, useSearchParams } from "next/navigation"
import type { FC, ReactNode } from "react"
import { useEffect, useState } from "react"
import { envs } from "./envs"

let posthogInstance: any = null
let PostHogProvider: any = null

async function loadPostHog() {
  if (posthogInstance) return { posthog: posthogInstance, PostHogProvider }

  try {
    const [posthogModule, reactModule] = await Promise.all([
      import("posthog-js" as any),
      import("posthog-js/react" as any),
    ])

    posthogInstance = posthogModule.default
    PostHogProvider = reactModule.PostHogProvider

    return { posthog: posthogInstance, PostHogProvider }
  } catch (error) {
    // Silent fail - PostHog is optional
    return { posthog: null, PostHogProvider: null }
  }
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthogInstance?.__loaded) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthogInstance.capture("$pageview", {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}

export const PostHogAnalyticsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [Provider, setProvider] = useState<any>(null)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      envs.NEXT_PUBLIC_POSTHOG_KEY &&
      envs.NEXT_PUBLIC_POSTHOG_HOST &&
      process.env.NODE_ENV === "production"
    ) {
      loadPostHog().then(({ posthog, PostHogProvider: PHProvider }) => {
        if (posthog && PHProvider) {
          posthog.init(envs.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host: envs.NEXT_PUBLIC_POSTHOG_HOST,
            person_profiles: "identified_only",
            capture_pageview: false,
            capture_pageleave: true,
          })
          setProvider(() => PHProvider)
        }
        setIsLoaded(true)
      })
    } else {
      setIsLoaded(true)
    }
  }, [])

  if (!isLoaded) {
    return <>{children}</>
  }

  if (!Provider || !posthogInstance) {
    return <>{children}</>
  }

  return (
    <Provider client={posthogInstance}>
      {children}
      <PostHogPageView />
    </Provider>
  )
}
