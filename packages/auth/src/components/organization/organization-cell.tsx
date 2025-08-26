"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import {
  EllipsisIcon,
  Loader2,
  LogOutIcon,
  SettingsIcon,
} from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import { useCallback, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { OrganizationCellView } from "./organization-cell-view"

export interface OrganizationCellProps {
  className?: string
  classNames?: SettingsCardClassNames
  organization: Organization
}

export function OrganizationCell({
  className,
  classNames,
  organization,
}: OrganizationCellProps) {
  const {
    authClient,
    t,
    organization: organizationOptions,
    navigate,
    toast,
  } = useAuth()

  const { pathMode } = organizationOptions || {}

  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isManagingOrganization, setIsManagingOrganization] = useState(false)

  const handleManageOrganization = useCallback(async () => {
    setIsManagingOrganization(true)

    if (pathMode === "slug") {
      navigate(
        `${organizationOptions?.basePath}/${organization.slug}/${organizationOptions?.viewPaths.SETTINGS}`,
      )

      return
    }

    try {
      await authClient.organization.setActive({
        organizationId: organization.id,
        fetchOptions: {
          throw: true,
        },
      })

      navigate(
        `${organizationOptions?.basePath}/${organizationOptions?.viewPaths?.SETTINGS}`,
      )
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      setIsManagingOrganization(false)
    }
  }, [
    authClient,
    organization.id,
    organizationOptions?.basePath,
    organizationOptions?.viewPaths?.SETTINGS,
    organization.slug,
    pathMode,
    navigate,
    toast,
    t,
  ])

  return (
    <>
      <Card className={cn("flex-row p-4", className, classNames?.cell)}>
        <OrganizationCellView organization={organization} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "relative ms-auto",
                classNames?.button,
                classNames?.outlineButton,
              )}
              disabled={isManagingOrganization}
              size="icon"
              type="button"
              variant="outline"
            >
              {isManagingOrganization ? (
                <Loader2 className="animate-spin" />
              ) : (
                <EllipsisIcon className={classNames?.icon} />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={handleManageOrganization}
              disabled={isManagingOrganization}
            >
              <SettingsIcon className={classNames?.icon} />

              {t("MANAGE_ORGANIZATION")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsLeaveDialogOpen(true)}
              variant="destructive"
            >
              <LogOutIcon className={classNames?.icon} />

              {t("LEAVE_ORGANIZATION")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      <LeaveOrganizationDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        organization={organization}
      />
    </>
  )
}
