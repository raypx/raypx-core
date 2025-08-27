import { Analytics } from "@vercel/analytics/react"
import type { FC, ReactNode } from "react"
import { GoogleAnalyticsProvider } from "./google-analytics"
import { PostHogAnalyticsProvider } from "./posthog"

export const AnalyticsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <PostHogAnalyticsProvider>
      <GoogleAnalyticsProvider>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </GoogleAnalyticsProvider>
    </PostHogAnalyticsProvider>
  )
}
