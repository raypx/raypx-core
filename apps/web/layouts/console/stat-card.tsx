"use client"

import { Badge } from "@raypx/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface DashboardStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: ReactNode
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
}: DashboardStatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {badge && (
          <Badge variant={badge.variant || "default"} className="mt-2">
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
