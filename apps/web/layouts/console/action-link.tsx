"use client"

import { Badge } from "@raypx/ui/components/badge"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

export interface DashboardActionLinkProps {
  href: string
  icon: LucideIcon
  title: string
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  disabled?: boolean
}

export function DashboardActionLink({
  href,
  icon: Icon,
  title,
  badge,
  disabled = false,
}: DashboardActionLinkProps) {
  const className = `flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
    disabled ? "opacity-50" : ""
  }`

  const content = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span className="font-medium">{title}</span>
      </div>
      {badge && (
        <Badge variant={badge.variant || "outline"}>{badge.text}</Badge>
      )}
    </>
  )

  if (disabled) {
    return <div className={className}>{content}</div>
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}
