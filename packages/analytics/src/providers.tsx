import { Analytics } from "@vercel/analytics/react"
import type { FC, ReactNode } from "react"

export const AnalyticsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "production" && <Analytics />}
    </>
  )
}
