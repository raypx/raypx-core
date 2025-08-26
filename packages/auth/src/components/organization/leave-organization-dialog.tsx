"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog"
import { Loader2 } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import { type ComponentProps, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import { OrganizationCellView } from "./organization-cell-view"

export interface LeaveOrganizationDialogProps
  extends ComponentProps<typeof Dialog> {
  className?: string
  classNames?: SettingsCardClassNames

  organization: Organization
}

export function LeaveOrganizationDialog({
  organization,
  className,
  classNames,

  onOpenChange,
  ...props
}: LeaveOrganizationDialogProps) {
  const {
    authClient,
    hooks: { useListOrganizations },
    t,
    toast,
  } = useAuth()

  const { refetch: refetchOrganizations } = useListOrganizations()

  const [isLeaving, setIsLeaving] = useState(false)

  const handleLeaveOrganization = async () => {
    setIsLeaving(true)

    try {
      await authClient.organization.leave({
        organizationId: organization.id,
        fetchOptions: { throw: true },
      })

      await refetchOrganizations?.()

      toast({
        variant: "success",
        message: t("LEAVE_ORGANIZATION_SUCCESS"),
      })

      onOpenChange?.(false)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setIsLeaving(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={classNames?.dialog?.content}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("LEAVE_ORGANIZATION")}
          </DialogTitle>

          <DialogDescription
            className={cn("text-xs md:text-sm", classNames?.description)}
          >
            {t("LEAVE_ORGANIZATION_CONFIRM")}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row p-4", className, classNames?.cell)}>
          <OrganizationCellView organization={organization} />
        </Card>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isLeaving}
          >
            {t("CANCEL")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleLeaveOrganization}
            className={cn(classNames?.button, classNames?.destructiveButton)}
            disabled={isLeaving}
          >
            {isLeaving && <Loader2 className="animate-spin" />}

            {t("LEAVE_ORGANIZATION")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
