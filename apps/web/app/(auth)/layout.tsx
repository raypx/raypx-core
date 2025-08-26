import type { ReactNode } from "react"
import { AuthLayout as Layout } from "../../layouts/auth"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>
}
