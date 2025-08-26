import { Button } from "@raypx/ui/components/button"
import Link from "next/link"
import appConfig from "@/config/app.config"

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">Welcome to Raypx</h1>
      <p className="text-fd-muted-foreground mb-6 max-w-2xl mx-auto">
        A modern web application platform built with Next.js and TypeScript for
        building AI-powered applications.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/docs">
          <Button className="cursor-pointer">Get Started</Button>
        </Link>
        <Link href={appConfig.url}>
          <Button variant="outline" className="cursor-pointer">
            Visit Website
          </Button>
        </Link>
      </div>
    </main>
  )
}
