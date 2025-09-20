import { OrganizationView } from "@raypx/auth/organization";
import { createMetadata } from "@raypx/seo";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "Settings",
  });
};

interface SettingsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;
  return <OrganizationView view="SETTINGS" slug={slug} />;
}
