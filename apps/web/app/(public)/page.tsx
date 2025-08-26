import { createMetadata } from "@raypx/seo"
import type { Metadata } from "next"
import appConfig from "@/config/app.config"
import { CTASection } from "./_components/cta-section"
import { FeaturesSection } from "./_components/features-section"
import { Footer } from "./_components/footer"
import { Header } from "./_components/header"
import { HeroSection } from "./_components/hero-section"

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: `${appConfig.name} - Build AI-Powered Applications`,
    description:
      "The complete platform for building, deploying, and scaling AI-powered applications with enterprise-grade security and performance.",
    keywords: [
      ...appConfig.keywords,
      "AI platform",
      "development",
      "machine learning",
      "enterprise",
    ],
  })
}

export default async function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
