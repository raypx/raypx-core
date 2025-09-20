"use client";

import { useAnalytics } from "@raypx/analytics";
import { useAuth } from "@raypx/auth/core";
import { Badge } from "@raypx/ui/components/badge";
import { Button } from "@raypx/ui/components/button";
import { ArrowRight, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const { track } = useAnalytics();
  const {
    viewPaths: pages,
    hooks: { useSession },
  } = useAuth();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStartedClick = () => {
    track("hero_get_started_clicked", {
      section: "hero",
      user_authenticated: !!session?.session,
    });
  };

  const handleSignInClick = () => {
    track("hero_sign_in_clicked", {
      section: "hero",
    });
  };

  const handleConsoleClick = () => {
    track("hero_console_clicked", {
      section: "hero",
      user_id: session?.session?.userId,
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background gradients */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-float delay-0" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-float delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-float delay-2000" />
      </div>

      {/* Tech grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Flowing lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-slide-right" />
        <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-slide-left delay-1000" />
        <div className="absolute top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-slide-right delay-2000" />

        <div className="absolute bottom-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-slide-left delay-500" />
        <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-slide-right delay-1500" />
        <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-slide-left delay-2500" />
      </div>

      {/* Particle effects */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="text-center space-y-8">
          <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2">
            <Sparkles className="h-4 w-4" />
            Built for modern development
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="inline-block animate-fade-in-up">Build AI-Powered</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in-up delay-200 animate-gradient-x">
                Applications
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              Raypx is the complete platform for building, deploying, and scaling AI-powered
              applications with enterprise-grade security and performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-500">
            {session?.session ? (
              <Link href="/console" onClick={handleConsoleClick}>
                <Button
                  size="lg"
                  className="min-w-48 gap-2 group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 text-white"
                >
                  <span className="relative z-10 text-white">Go to Console</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href={pages.SIGN_UP} onClick={handleGetStartedClick}>
                  <Button
                    size="lg"
                    className="min-w-48 gap-2 group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 text-white"
                  >
                    <span className="relative z-10 text-white">Get Started Free</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
                <Link href={pages.SIGN_IN} onClick={handleSignInClick}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-w-48 group border-2 border-blue-200 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Sign In
                    </span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="pt-16">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Trusted by developers worldwide
            </p>
            <div className="flex justify-center items-center gap-12 opacity-60 animate-fade-in-up delay-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
