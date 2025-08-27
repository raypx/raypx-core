"use client"

import { envs } from "./envs"

let posthogHook: any = null

async function loadPostHogHook() {
  if (posthogHook) return posthogHook

  try {
    const reactModule = await import("posthog-js/react" as any)
    posthogHook = reactModule.usePostHog
    return posthogHook
  } catch (error) {
    return null
  }
}

export function useAnalytics() {
  let posthog: any = null

  // Try to get PostHog instance if available
  if (typeof window !== "undefined" && envs.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      // If PostHog is loaded globally, use it
      if ((window as any).posthog) {
        posthog = (window as any).posthog
      }
    } catch (error) {
      // Silent fail
    }
  }

  const track = (event: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") return

    // PostHog
    if (posthog && posthog.capture) {
      posthog.capture(event, properties)
    }

    // Google Analytics
    if (
      typeof window !== "undefined" &&
      window.gtag &&
      envs.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ) {
      window.gtag("event", event, {
        ...properties,
        send_to: envs.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      })
    }
  }

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") return

    // PostHog
    if (posthog && posthog.identify) {
      posthog.identify(userId, properties)
    }

    // Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", envs.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId,
        ...properties,
      })
    }
  }

  const reset = () => {
    if (process.env.NODE_ENV !== "production") return

    // PostHog
    if (posthog && posthog.reset) {
      posthog.reset()
    }
  }

  const setPersonProperties = (properties: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") return

    // PostHog
    if (posthog && posthog.setPersonProperties) {
      posthog.setPersonProperties(properties)
    }

    // Google Analytics - set custom parameters
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", envs.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        custom_map: properties,
      })
    }
  }

  const group = (
    groupType: string,
    groupKey: string,
    properties?: Record<string, any>,
  ) => {
    if (process.env.NODE_ENV !== "production") return

    // PostHog
    if (posthog && posthog.group) {
      posthog.group(groupType, groupKey, properties)
    }
  }

  const pageView = (url?: string, title?: string) => {
    if (process.env.NODE_ENV !== "production") return

    // PostHog
    if (posthog && posthog.capture) {
      posthog.capture("$pageview", {
        $current_url: url || window.location.href,
        title,
      })
    }

    // Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", envs.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url || window.location.pathname,
        page_title: title,
      })
    }
  }

  return {
    track,
    identify,
    reset,
    setPersonProperties,
    group,
    pageView,
    // Raw instances for advanced usage
    posthog: process.env.NODE_ENV === "production" ? posthog : null,
    gtag:
      process.env.NODE_ENV === "production" && typeof window !== "undefined"
        ? window.gtag
        : null,
  }
}
