"use client"

import { Skeleton } from "@raypx/ui/components/skeleton"
import dynamic from "next/dynamic"

export const DashboardLayout = dynamic(
  () =>
    import("@/layouts/console").then((mod) => ({ default: mod.ConsolePage })),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    ),
  },
)
