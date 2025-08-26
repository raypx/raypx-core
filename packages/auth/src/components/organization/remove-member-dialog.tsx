"use client"

import { Button } from "@raypx/ui/components/button"
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
import type { User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import { type ComponentProps, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import { MemberCell } from "./member-cell"

export interface RemoveMemberDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames
  member: Member & { user?: Partial<User> | null }
}

export function RemoveMemberDialog({
  member,
  classNames,
  onOpenChange,
  ...props
}: RemoveMemberDialogProps) {
  const {
    authClient,
    hooks: { useListMembers },
    t,
    toast,
  } = useAuth()

  const { refetch } = useListMembers({
    query: { organizationId: member.organizationId },
  })

  const [isRemoving, setIsRemoving] = useState(false)

  const removeMember = async () => {
    setIsRemoving(true)

    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: member.id,
        organizationId: member.organizationId,
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("REMOVE_MEMBER_SUCCESS"),
      })

      await refetch?.()

      onOpenChange?.(false)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setIsRemoving(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={classNames?.dialog?.content}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("REMOVE_MEMBER")}
          </DialogTitle>

          <DialogDescription
            className={cn("text-xs md:text-sm", classNames?.description)}
          >
            {t("REMOVE_MEMBER_CONFIRM")}
          </DialogDescription>
        </DialogHeader>

        <MemberCell className={classNames?.cell} member={member} hideActions />

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isRemoving}
          >
            {t("CANCEL")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={removeMember}
            className={cn(classNames?.button, classNames?.destructiveButton)}
            disabled={isRemoving}
          >
            {isRemoving && <Loader2 className="animate-spin" />}

            {t("REMOVE_MEMBER")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
