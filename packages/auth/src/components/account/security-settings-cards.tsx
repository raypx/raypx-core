"use client"

import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useAuth } from "../../core/hooks/use-auth"
import { TwoFactorCard } from "../core/two-factor-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { PasskeysCard } from "./passkeys-card"
import { ProvidersCard } from "./providers-card"
import { SessionsCard } from "./sessions-card"

export function SecuritySettingsCards({
  className,
  classNames,
}: {
  className?: string
  classNames?: {
    card?: SettingsCardClassNames
    cards?: string
  }
}) {
  const {
    credentials,
    deleteUser,
    hooks,
    passkey,
    social,
    genericOAuth,
    twoFactor,
  } = useAuth()

  const { useListAccounts } = hooks

  const {
    data: accounts,
    isPending: accountsPending,
    refetch: refetchAccounts,
  } = useListAccounts()

  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === "credential",
  )

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 md:gap-6",
        className,
        classNames?.cards,
      )}
    >
      {credentials && (
        <ChangePasswordCard
          accounts={accounts}
          classNames={classNames?.card}
          isPending={accountsPending}
          skipHook
        />
      )}

      {(social?.providers?.length || genericOAuth?.providers?.length) && (
        <ProvidersCard
          accounts={accounts}
          classNames={classNames?.card}
          isPending={accountsPending}
          refetch={refetchAccounts}
          skipHook
        />
      )}

      {twoFactor && credentialsLinked && (
        <TwoFactorCard classNames={classNames?.card} />
      )}

      {passkey && <PasskeysCard classNames={classNames?.card} />}

      <SessionsCard classNames={classNames?.card} />

      {deleteUser && (
        <DeleteAccountCard
          accounts={accounts}
          classNames={classNames?.card}
          isPending={accountsPending}
          skipHook
        />
      )}
    </div>
  )
}
