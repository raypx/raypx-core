import { Suspense } from "react"
import { Header } from "@/app/(public)/_components/header"
import { DashboardLayout as DashboardLayoutLazy } from "@/components/dashboard-lazy"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardLayoutLazy
        title="Dashboard"
        description="Welcome to your console"
      >
        <Header />
        {children}
      </DashboardLayoutLazy>
    </Suspense>
  )
}
