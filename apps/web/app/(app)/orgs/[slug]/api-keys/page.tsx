import { OrganizationView } from "@raypx/auth/organization"
import { createMetadata } from "@raypx/seo"
import type { Metadata } from "next"

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "API Keys",
  })
}

interface ApiKeysPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ApiKeysPage({ params }: ApiKeysPageProps) {
  const { slug } = await params
  return <OrganizationView view="API_KEYS" slug={slug} />
}
