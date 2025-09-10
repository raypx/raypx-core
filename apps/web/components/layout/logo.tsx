"use client"

import { cn } from "@raypx/ui/lib/utils"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Logo({ className }: { className?: string }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const logoLight = "/logo.png"
  const logoDark = logoLight

  // During server-side rendering and initial client render, always use logoLight
  // This prevents hydration mismatch
  const logo = mounted && theme === "dark" ? logoDark : logoLight

  // Only show theme-dependent UI after hydration to prevent mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Image
      src={logo}
      alt="Logo"
      title="Logo"
      width={96}
      height={96}
      className={cn("size-8 rounded-md", className)}
    />
  )
}
