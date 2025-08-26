import { RedirectToSignIn } from "@raypx/auth/core"
import type { ReactNode } from "react"

interface AppLayoutProps {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      {children}
    </>
  )
}
