"use client"

import { useAuth } from "@raypx/auth/core"
import { Button } from "@raypx/ui/components/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const benefits = [
  "Free tier with generous limits",
  "No setup or maintenance required",
  "Scale from prototype to production",
  "24/7 expert support",
]

export function CTASection() {
  const {
    viewPaths: pages,
    hooks: { useSession },
  } = useAuth()
  const { data: session } = useSession()

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="space-y-8 text-white">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to build the future?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of developers already building amazing AI
              applications with Raypx.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {session?.session ? (
              <Link href="/console">
                <Button
                  size="lg"
                  variant="secondary"
                  className="min-w-48 gap-2 bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl font-semibold"
                >
                  Go to Console
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href={pages.SIGN_UP}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="min-w-48 gap-2 bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl font-semibold group"
                  >
                    Start Building Today
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href={pages.SIGN_IN}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-48 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:shadow-lg backdrop-blur-sm bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          <p className="text-sm text-blue-200">
            Start free • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
