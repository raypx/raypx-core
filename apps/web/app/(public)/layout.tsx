import type { ReactNode } from "react"
import { LandingLayout } from "@/layouts/landing"

export interface LandingLayoutProps {
  children: ReactNode
}

export default function LandingLayoutPage({ children }: LandingLayoutProps) {
  return <LandingLayout>{children}</LandingLayout>
}
