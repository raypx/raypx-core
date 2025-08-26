import { RedirectToSignIn } from "@raypx/auth/core"
import { createMetadata } from "@raypx/seo"
import { ChevronRight, Home } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { Header } from "@/layouts/console/header"

interface AccountLayoutProps {
  children: ReactNode
}

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "Account",
  })
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      <div className="min-h-screen bg-background">
        <Header />
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-6 py-2">
            <nav
              className="flex items-center space-x-1 text-sm text-muted-foreground"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="flex items-center hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label="Go to home page"
              >
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-foreground" aria-current="location">
                Account
              </span>
            </nav>
          </div>
        </div>
        <main className="container mx-auto px-6 py-8" role="main">
          {children}
        </main>
      </div>
    </>
  )
}
