"use client"

import { CardContent } from "@raypx/ui/components/card"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { SettingsCard } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useAuth } from "../../core/hooks/use-auth"
import { socialProviders } from "../../core/lib/providers/social-providers"
import type { Refetch } from "../../types"
import { ProviderCell } from "./provider-cell"
import { SettingsCellSkeleton } from "./settings-cell-skeleton"

export interface ProvidersCardProps {
  className?: string
  classNames?: SettingsCardClassNames
  accounts?: { accountId: string; provider: string }[] | null
  isPending?: boolean
  skipHook?: boolean
  refetch?: Refetch
}

export function ProvidersCard({
  className,
  classNames,
  accounts,
  isPending,
  skipHook,
  refetch,
}: ProvidersCardProps) {
  const {
    hooks: { useListAccounts },
    t,
    social,
    genericOAuth,
  } = useAuth()

  if (!skipHook) {
    const result = useListAccounts()
    accounts = result.data
    isPending = result.isPending
    refetch = result.refetch
  }

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={t("PROVIDERS")}
      description={t("PROVIDERS_DESCRIPTION")}
      isPending={isPending}
    >
      <CardContent className={cn("grid gap-4", classNames?.content)}>
        {isPending ? (
          social?.providers?.map((provider) => (
            <SettingsCellSkeleton key={provider} classNames={classNames} />
          ))
        ) : (
          <>
            {social?.providers?.map((provider) => {
              const socialProvider = socialProviders.find(
                (socialProvider) => socialProvider.provider === provider,
              )

              if (!socialProvider) return null

              return (
                <ProviderCell
                  key={provider}
                  classNames={classNames}
                  account={accounts?.find((acc) => acc.provider === provider)}
                  provider={socialProvider}
                  refetch={refetch}
                />
              )
            })}

            {genericOAuth?.providers?.map((provider) => (
              <ProviderCell
                key={provider.provider}
                classNames={classNames}
                account={accounts?.find(
                  (acc) => acc.provider === provider.provider,
                )}
                provider={provider}
                refetch={refetch}
                other
              />
            ))}
          </>
        )}
      </CardContent>
    </SettingsCard>
  )
}
