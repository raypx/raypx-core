import { AccountView } from "@raypx/auth/account"
import { createMetadata } from "@raypx/seo"
import type { Metadata } from "next"

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "Settings",
  })
}

export default function SettingsPage() {
  return <AccountView view="SETTINGS" />
}
