"use client"

import { AnalyticsProvider } from "@raypx/analytics"
import { AuthProvider } from "@raypx/auth"
import { client } from "@raypx/auth/client"
import { useLocale } from "@raypx/i18n"
import { Provider } from "@raypx/ui/components/provider"
import { useRouter } from "next/navigation"
import { authPages } from "../config/auth.config"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter()
  const locale = useLocale()

  return (
    <Provider>
      <AnalyticsProvider>
        <AuthProvider
          authClient={client}
          locale={locale}
          social={{
            providers: ["google", "github"],
          }}
          basePath="/"
          navigate={router.push}
          replace={router.replace}
          viewPaths={authPages}
          credentials={{
            username: true,
            rememberMe: true,
          }}
          signUp={true}
          organization={{
            pathMode: "slug",
            basePath: "/orgs",
            apiKey: true,
            logo: true,
          }}
          onSessionChange={() => {
            router.refresh()
          }}
        >
          {children}
        </AuthProvider>
      </AnalyticsProvider>
    </Provider>
  )
}
