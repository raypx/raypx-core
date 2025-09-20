import { Card, CardContent, CardHeader } from "@raypx/ui/components/card";
import { Skeleton } from "@raypx/ui/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="hidden sm:block">
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-6 w-36" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20 hidden sm:block" />
              </div>
              <Skeleton className="h-3 w-32 hidden sm:block" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 sm:h-64 lg:h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
