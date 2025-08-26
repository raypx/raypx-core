import { OrganizationView } from "@raypx/auth/organization"
import { createMetadata } from "@raypx/seo"
import type { Metadata } from "next"

interface OrganizationPageProps {
  params: Promise<{
    slug: string
  }>
}

export const generateMetadata = async ({
  params,
}: OrganizationPageProps): Promise<Metadata> => {
  const { slug } = await params
  return createMetadata({
    title: `Organization ${slug}`,
  })
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params
  return <OrganizationView view="SETTINGS" slug={slug} />
}
