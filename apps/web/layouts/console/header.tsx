import { OrganizationSwitcher } from "@raypx/auth/organization"
import Link from "next/link"

interface HeaderProps {
  slug?: string
}

export function Header({ slug }: HeaderProps) {
  return (
    <header className="border-b bg-card" role="banner">
      <div className="container mx-auto px-6 py-4">
        <nav
          className="flex items-center justify-between"
          role="navigation"
          aria-label="Console navigation"
        >
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">Raypx</h1>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/console"
                className="text-sm hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                aria-label="Go to console dashboard"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <OrganizationSwitcher slug={slug} size="icon" />
          </div>
        </nav>
      </div>
    </header>
  )
}
