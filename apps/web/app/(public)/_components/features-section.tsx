"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
import {
  BarChart3,
  Bot,
  Code2,
  Database,
  Globe,
  Lock,
  Rocket,
  Users,
  Zap,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
  {
    icon: Bot,
    title: "AI Integration",
    description:
      "Seamlessly integrate advanced AI models and capabilities into your applications with our comprehensive SDK.",
    color: "text-purple-600",
  },
  {
    icon: Database,
    title: "Data Management",
    description:
      "Powerful data processing and storage solutions with real-time synchronization and backup capabilities.",
    color: "text-blue-600",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade security with multi-factor authentication, encryption, and compliance certifications.",
    color: "text-green-600",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description:
      "Optimized infrastructure delivering sub-100ms response times with global edge deployment.",
    color: "text-yellow-600",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description:
      "Deploy worldwide with automatic scaling, load balancing, and CDN integration for optimal performance.",
    color: "text-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Real-time analytics dashboard with detailed metrics, user behavior tracking, and performance monitoring.",
    color: "text-red-600",
  },
  {
    icon: Code2,
    title: "Developer Experience",
    description:
      "Rich SDKs, comprehensive documentation, and powerful CLI tools for streamlined development workflow.",
    color: "text-cyan-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Built-in team management, role-based access control, and collaborative development features.",
    color: "text-orange-600",
  },
  {
    icon: Rocket,
    title: "Rapid Deployment",
    description:
      "One-click deployments with automated CI/CD pipelines, rollback capabilities, and environment management.",
    color: "text-pink-600",
  },
]

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.indexOf(entry.target as HTMLDivElement)
          if (entry.isIntersecting && index !== -1) {
            setVisibleCards((prev) => new Set(prev).add(index))
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: "50px",
      },
    )

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      {/* Tech background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse" />
        <div
          className="absolute top-40 right-20 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-indigo-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 right-1/3 w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight dark:text-white animate-fade-in-up">
            Everything you need to build
            <span className="block text-blue-600 dark:text-blue-400 animate-fade-in-up delay-200">
              next-generation applications
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-300">
            From AI integration to global deployment, we provide all the tools
            and services you need to build, ship, and scale your applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const isVisible = visibleCards.has(index)
            const delay = `${index * 100}ms`

            return (
              <Card
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                className={`border-0 shadow-lg hover:shadow-xl dark:bg-gray-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group relative overflow-hidden ${
                  isVisible
                    ? "animate-fade-in-up opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ animationDelay: isVisible ? delay : undefined }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="space-y-4 relative z-10">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gray-50 dark:bg-gray-700 w-fit ${feature.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </Card>
            )
          })}
        </div>

        {/* Floating decorative elements */}
        <div className="flex justify-center mt-16 animate-fade-in-up delay-700">
          <div className="flex items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: "2s" }}
              />
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
