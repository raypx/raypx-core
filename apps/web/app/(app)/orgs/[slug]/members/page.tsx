import { OrganizationView } from "@raypx/auth/organization"
import { createMetadata } from "@raypx/seo"
import type { Metadata } from "next"

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "Members",
  })
}

interface MembersPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params
  return <OrganizationView view="MEMBERS" slug={slug} />
}
