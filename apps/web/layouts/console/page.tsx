"use client"

import { useSession } from "@raypx/auth/client"
import type { ReactNode } from "react"

export interface ConsolePageProps {
  children: ReactNode
  title: string
  description?: string
  className?: string
  maxWidth?: "4xl" | "6xl" | "full"
}

export function ConsolePage({
  children,
  className = "",
  maxWidth = "full",
}: ConsolePageProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const maxWidthClass = {
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  }[maxWidth]

  return (
    <div
      className={`container mx-auto ${maxWidthClass} p-6 space-y-6 ${className}`}
    >
      {children}
    </div>
  )
}
