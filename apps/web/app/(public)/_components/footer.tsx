"use client"

import { Github, Globe, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl">Raypx</span>
            </div>
            <p className="text-gray-600 text-sm">
              The complete platform for building AI-powered applications.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Globe className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Product</h3>
            <div className="space-y-2">
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Features
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                API Reference
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Company</h3>
            <div className="space-y-2">
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                About
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Blog
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Careers
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <div className="space-y-2">
              <Link
                href="/privacy"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Security
              </Link>
              <Link
                href="#"
                className="block text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Status
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2025 Raypx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
