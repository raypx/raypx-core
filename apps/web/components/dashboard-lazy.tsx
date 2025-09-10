"use client"

import { Skeleton } from "@raypx/ui/components/skeleton"
import dynamic from "next/dynamic"

export const DashboardLayout = dynamic(
  () =>
    import("@/layouts/console/page").then((mod) => ({
      default: mod.ConsolePage,
    })),
  {
    loading: () => (
      <div className="min-h-screen bg-background">
        <div className="space-y-6 p-4 md:p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 p-6 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-8 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4 p-6 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
)
