"use client"

import { useAnalytics } from "@raypx/analytics"
import { useAuth } from "@raypx/auth/core"
import { Badge } from "@raypx/ui/components/badge"
import { Button } from "@raypx/ui/components/button"
import { ArrowRight, Shield, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const { track } = useAnalytics()
  const {
    viewPaths: pages,
    hooks: { useSession },
  } = useAuth()
  const { data: session } = useSession()

  const handleGetStartedClick = () => {
    track("hero_get_started_clicked", {
      section: "hero",
      user_authenticated: !!session?.session,
    })
  }

  const handleSignInClick = () => {
    track("hero_sign_in_clicked", {
      section: "hero",
    })
  }

  const handleConsoleClick = () => {
    track("hero_console_clicked", {
      section: "hero",
      user_id: session?.session?.userId,
    })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="text-center space-y-8">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 px-4 py-2"
          >
            <Sparkles className="h-4 w-4" />
            Built for modern development
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Build AI-Powered
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Applications
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Raypx is the complete platform for building, deploying, and
              scaling AI-powered applications with enterprise-grade security and
              performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {session?.session ? (
              <Link href="/console" onClick={handleConsoleClick}>
                <Button size="lg" className="min-w-48 gap-2">
                  Go to Console
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href={pages.SIGN_UP} onClick={handleGetStartedClick}>
                  <Button size="lg" className="min-w-48 gap-2">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href={pages.SIGN_IN} onClick={handleSignInClick}>
                  <Button variant="outline" size="lg" className="min-w-48">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="pt-16">
            <p className="text-sm text-gray-500 mb-8">
              Trusted by developers worldwide
            </p>
            <div className="flex justify-center items-center gap-12 opacity-60">
              <div className="flex items-center gap-2 text-gray-600">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
