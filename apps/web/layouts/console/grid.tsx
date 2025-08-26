"use client"

import type { ReactNode } from "react"

export interface ConsoleGridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4
  lgCols?: 1 | 2 | 3 | 4
  gap?: 4 | 6 | 8
  className?: string
}

export function ConsoleGrid({
  children,
  cols = 1,
  lgCols,
  gap = 6,
  className = "",
}: ConsoleGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[cols]

  const lgGridCols = lgCols
    ? {
        1: "lg:grid-cols-1",
        2: "lg:grid-cols-2",
        3: "lg:grid-cols-3",
        4: "lg:grid-cols-4",
      }[lgCols]
    : ""

  const gapClass = {
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  }[gap]

  return (
    <div className={`grid ${gridCols} ${lgGridCols} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}
