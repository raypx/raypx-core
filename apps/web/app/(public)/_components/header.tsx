"use client"

import { useAuth } from "@raypx/auth/core"
import { OrganizationSwitcher } from "@raypx/auth/organization"
import { Button } from "@raypx/ui/components/button"
import Image from "next/image"
import Link from "next/link"
import { LangSwitcher } from "@/components/lang-switcher"

export function Header() {
  const {
    viewPaths: pages,
    hooks: { useSession },
  } = useAuth()
  const { data: session } = useSession()

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl font-semibold">
            <Image
              src="/images/logo.png"
              alt="Raypx"
              className="size-8 rounded-full"
              width={40}
              height={40}
            />
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <LangSwitcher />
          {session?.session ? (
            <OrganizationSwitcher size="icon" />
          ) : (
            <div className="flex items-center gap-2">
              <Link href={pages.SIGN_IN}>
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href={pages.SIGN_UP}>
                <Button>Get started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
