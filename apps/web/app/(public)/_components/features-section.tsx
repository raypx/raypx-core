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
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight dark:text-white">
            Everything you need to build
            <span className="block text-blue-600 dark:text-blue-400">
              next-generation applications
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From AI integration to global deployment, we provide all the tools
            and services you need to build, ship, and scale your applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl dark:bg-gray-800 transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="space-y-4">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gray-50 dark:bg-gray-700 w-fit ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
