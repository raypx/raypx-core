"use client";

import { AnalyticsProvider } from "@raypx/analytics";
import { AuthProvider } from "@raypx/auth";
import { client } from "@raypx/auth/client";
import { Provider } from "@raypx/ui/components/provider";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { authPages } from "../config/auth.config";

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Provider>
        <AnalyticsProvider>
          <AuthProvider
            authClient={client}
            locale={locale}
            social={{
              providers: ["google", "github"],
            }}
            basePath="/auth"
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
              router.refresh();
            }}
          >
            {children}
          </AuthProvider>
        </AnalyticsProvider>
      </Provider>
    </NextIntlClientProvider>
  );
}
