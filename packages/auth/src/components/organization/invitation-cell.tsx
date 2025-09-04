"use client"

import { dayjs } from "@raypx/shared/utils"
import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import { EllipsisIcon, Loader2, X } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import type { Invitation } from "../../types"
import { UserAvatar } from "../account/user-avatar"

export interface InvitationCellProps {
  className?: string
  classNames?: SettingsCardClassNames
  invitation: Invitation

  organization: Organization
}

export function InvitationCell({
  className,
  classNames,
  invitation,

  organization,
}: InvitationCellProps) {
  const {
    authClient,
    hooks: { useListInvitations },
    organization: organizationOptions,
    toast,
    t,
    locale,
  } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  const builtInRoles = [
    { role: "owner", label: t("OWNER") },
    { role: "admin", label: t("ADMIN") },
    { role: "member", label: t("MEMBER") },
  ]

  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])]
  const role = roles.find((r) => r.role === invitation.role)

  const { refetch } = useListInvitations({
    query: { organizationId: organization?.id },
  })

  const handleCancelInvitation = async () => {
    setIsLoading(true)

    try {
      await authClient.organization.cancelInvitation({
        invitationId: invitation.id,
        fetchOptions: { throw: true },
      })

      await refetch?.()

      toast({
        variant: "success",
        message: t("INVITATION_CANCELLED"),
      })
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setIsLoading(false)
  }

  return (
    <Card
      className={cn("flex-row items-center p-4", className, classNames?.cell)}
    >
      <div className="flex flex-1 items-center gap-2">
        <UserAvatar className="my-0.5" user={invitation} />

        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate font-semibold text-sm">
            {invitation.email}
          </span>

          <span className="truncate text-muted-foreground text-xs">
            {t("EXPIRES")}{" "}
            {dayjs(invitation.expiresAt).locale(locale).format("LL")}
          </span>
        </div>
      </div>

      <span className="truncate text-sm opacity-70">{role?.label}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              "relative ms-auto",
              classNames?.button,
              classNames?.outlineButton,
            )}
            disabled={isLoading}
            size="icon"
            type="button"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <EllipsisIcon className={classNames?.icon} />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuItem
            onClick={handleCancelInvitation}
            disabled={isLoading}
            variant="destructive"
          >
            <X className={classNames?.icon} />

            {t("CANCEL_INVITATION")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}
