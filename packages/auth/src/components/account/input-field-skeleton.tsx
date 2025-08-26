"use client"

import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { Skeleton } from "@raypx/ui/components/skeleton"
import { cn } from "@raypx/ui/lib/utils"

export function InputFieldSkeleton({
  classNames,
}: {
  classNames?: SettingsCardClassNames
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className={cn("h-4 w-32", classNames?.skeleton)} />
      <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
    </div>
  )
}
