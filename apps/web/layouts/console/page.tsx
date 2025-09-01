"use client"

import { useSession } from "@raypx/auth/client"
import { Button } from "@raypx/ui/components/button"
import { Sheet, SheetContent } from "@raypx/ui/components/sheet"
import { cn } from "@raypx/ui/lib/utils"
import {
  BarChart3,
  Bell,
  Building2,
  FileText,
  Home,
  Key,
  Menu,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { useState } from "react"

export interface ConsolePageProps {
  children: ReactNode
  title: string
  description?: string
  className?: string
  maxWidth?: "4xl" | "6xl" | "full"
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Knowledge", href: "/dashboard/knowledge", icon: FileText },
  { name: "Organizations", href: "/account/organizations", icon: Building2 },
  { name: "API Keys", href: "/account/api-keys", icon: Key },
  { name: "Security", href: "/account/security", icon: Shield },
  { name: "Settings", href: "/account/settings", icon: Settings },
]

export function ConsolePage({
  children,
  title,
  description,
  className = "",
  maxWidth = "full",
}: ConsolePageProps) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  if (!session?.user) {
    return null
  }

  const maxWidthClass = {
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  }[maxWidth]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <h1 className="text-xl font-semibold">Raypx</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-semibold">Raypx</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-border lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-foreground">
                  {title}
                </h1>
                {description && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
              </Button>

              {/* User menu */}
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="hidden text-sm font-medium text-foreground lg:block">
                  {session.user.name || session.user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div
            className={cn(
              "mx-auto px-4 sm:px-6 lg:px-8",
              maxWidthClass,
              className,
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
