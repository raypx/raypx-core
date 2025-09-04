import { HomeLayout } from "fumadocs-ui/layouts/home"
import type { ReactNode } from "react"
import { baseOptions } from "@/app/layout.shared"

interface HomeLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function Layout({ children, params }: HomeLayoutProps) {
  const { lang } = await params
  return <HomeLayout {...baseOptions(lang)}>{children}</HomeLayout>
}
