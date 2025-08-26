"use client"

import { Button } from "@raypx/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
import { Check, Loader2, X } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { Skeleton } from "@raypx/ui/components/skeleton"
import { cn } from "@raypx/ui/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useAuthenticate } from "../../core/hooks/use-authenticate"
import { getLocalizedError, getSearchParam } from "../../core/lib/utils"
import { OrganizationCellView } from "./organization-cell-view"

export interface AcceptInvitationCardProps {
  className?: string
  classNames?: SettingsCardClassNames
}

export function AcceptInvitationCard({
  className,
  classNames,
}: AcceptInvitationCardProps) {
  const { t, redirectTo, replace, toast } = useAuth()

  const { data: sessionData } = useAuthenticate()
  const [invitationId, setInvitationId] = useState<string | null>(null)

  useEffect(() => {
    const invitationIdParam = getSearchParam("invitationId")

    if (!invitationIdParam) {
      toast({
        variant: "error",
        message: t("INVITATION_NOT_FOUND"),
      })

      replace(redirectTo)
      return
    }

    setInvitationId(invitationIdParam)
  }, [t("INVITATION_NOT_FOUND"), toast, replace, redirectTo])

  if (!sessionData || !invitationId) {
    return (
      <AcceptInvitationSkeleton className={className} classNames={classNames} />
    )
  }

  return (
    <AcceptInvitationContent
      className={className}
      classNames={classNames}
      invitationId={invitationId}
    />
  )
}

function AcceptInvitationContent({
  className,
  classNames,
  invitationId,
}: AcceptInvitationCardProps & { invitationId: string }) {
  const {
    authClient,
    hooks: { useInvitation },
    t,
    organization,
    redirectTo,
    replace,
    toast,
  } = useAuth()

  const [isRejecting, setIsRejecting] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const isProcessing = isRejecting || isAccepting

  const { data: invitation, isPending } = useInvitation({
    query: {
      id: invitationId,
    },
  })

  const getRedirectTo = useCallback(
    () => getSearchParam("redirectTo") || redirectTo,
    [redirectTo],
  )

  useEffect(() => {
    if (isPending || !invitationId) return

    if (!invitation) {
      toast({
        variant: "error",
        message: t("INVITATION_NOT_FOUND"),
      })

      replace(redirectTo)
      return
    }

    if (
      invitation.status !== "pending" ||
      new Date(invitation.expiresAt) < new Date()
    ) {
      toast({
        variant: "error",
        message:
          new Date(invitation.expiresAt) < new Date()
            ? t("INVITATION_EXPIRED")
            : t("INVITATION_NOT_FOUND"),
      })

      replace(redirectTo)
    }
  }, [invitation, isPending, invitationId, t, toast, replace, redirectTo])

  const acceptInvitation = async () => {
    setIsAccepting(true)

    try {
      await authClient.organization.acceptInvitation({
        invitationId: invitationId,
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("INVITATION_ACCEPTED") || "Invitation accepted",
      })

      replace(getRedirectTo())
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      setIsAccepting(false)
    }
  }

  const rejectInvitation = async () => {
    setIsRejecting(true)

    try {
      await authClient.organization.rejectInvitation({
        invitationId: invitationId,
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("INVITATION_REJECTED"),
      })

      replace(redirectTo)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      setIsRejecting(false)
    }
  }

  const builtInRoles = [
    { role: "owner", label: t("OWNER") },
    { role: "admin", label: t("ADMIN") },
    { role: "member", label: t("MEMBER") },
  ]

  const roles = [...builtInRoles, ...(organization?.customRoles || [])]
  const roleLabel =
    roles.find((r) => r.role === invitation?.role)?.label || invitation?.role

  if (!invitation)
    return (
      <AcceptInvitationSkeleton className={className} classNames={classNames} />
    )

  return (
    <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
      <CardHeader
        className={cn("justify-items-center text-center", classNames?.header)}
      >
        <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
          {t("ACCEPT_INVITATION")}
        </CardTitle>

        <CardDescription
          className={cn("text-xs md:text-sm", classNames?.description)}
        >
          {t("ACCEPT_INVITATION_DESCRIPTION")}
        </CardDescription>
      </CardHeader>

      <CardContent
        className={cn("flex flex-col gap-6 truncate", classNames?.content)}
      >
        <Card className={cn("flex-row items-center p-4")}>
          <OrganizationCellView
            organization={{
              id: invitation.organizationId,
              name: invitation.organizationName,
              slug: invitation.organizationSlug,
              logo: invitation.organizationLogo,
              createdAt: new Date(),
            }}
          />

          <p className="ml-auto text-muted-foreground text-sm">{roleLabel}</p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className={cn(classNames?.button, classNames?.outlineButton)}
            onClick={rejectInvitation}
            disabled={isProcessing}
          >
            {isRejecting ? <Loader2 className="animate-spin" /> : <X />}

            {t("REJECT")}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.primaryButton)}
            onClick={acceptInvitation}
            disabled={isProcessing}
          >
            {isAccepting ? <Loader2 className="animate-spin" /> : <Check />}

            {t("ACCEPT")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const AcceptInvitationSkeleton = ({
  className,
  classNames,
}: AcceptInvitationCardProps) => {
  return (
    <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
      <CardHeader className={cn("justify-items-center", classNames?.header)}>
        <Skeleton
          className={cn(
            "my-1 h-5 w-full max-w-32 md:h-5.5 md:w-40",
            classNames?.skeleton,
          )}
        />

        <Skeleton
          className={cn(
            "my-0.5 h-3 w-full max-w-56 md:h-3.5 md:w-64",
            classNames?.skeleton,
          )}
        />
      </CardHeader>

      <CardContent
        className={cn("flex flex-col gap-6 truncate", classNames?.content)}
      >
        <Card className={cn("flex-row items-center p-4")}>
          <OrganizationCellView isPending />

          <Skeleton className="mt-0.5 ml-auto h-4 w-full max-w-14 shrink-2" />
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-9 w-full" />

          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
