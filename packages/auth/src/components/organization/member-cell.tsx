"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import { EllipsisIcon, UserCogIcon, UserX } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { UserView } from "../account/user-view"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { RemoveMemberDialog } from "./remove-member-dialog"
import { UpdateMemberRoleDialog } from "./update-member-role-dialog"

export interface MemberCellProps {
  className?: string
  classNames?: SettingsCardClassNames
  member: Member & { user?: Partial<User> | null }
  hideActions?: boolean
}

export function MemberCell({
  className,
  classNames,
  member,
  hideActions,
}: MemberCellProps) {
  const {
    organization: organizationOptions,
    hooks: {
      useListMembers,
      useSession,
      useListOrganizations,
      useHasPermission,
    },
    t,
  } = useAuth()

  const { data: sessionData } = useSession()
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false)

  const builtInRoles = [
    { role: "owner", label: t("OWNER") },
    { role: "admin", label: t("ADMIN") },
    { role: "member", label: t("MEMBER") },
  ]

  const { data } = useListMembers({
    query: { organizationId: member.organizationId },
  })

  const members = data?.members

  const myRole = members?.find((m) => m.user?.id === sessionData?.user.id)?.role
  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])]
  const role = roles.find((r) => r.role === member.role)

  const isSelf = sessionData?.user.id === member?.userId

  const { data: organizations } = useListOrganizations()
  const organization = organizations?.find(
    (org) => org.id === member.organizationId,
  )

  const { data: hasPermissionToUpdateMember } = useHasPermission({
    organizationId: member.organizationId,
    permission: { member: ["update"] },
  })

  return (
    <>
      <Card
        className={cn("flex-row items-center p-4", className, classNames?.cell)}
      >
        <UserView user={member.user} className="flex-1" />

        <span className="text-xs opacity-70">{role?.label}</span>

        {!hideActions &&
          (isSelf || member.role !== "owner" || myRole === "owner") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(
                    "relative ms-auto",
                    classNames?.button,
                    classNames?.outlineButton,
                  )}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <EllipsisIcon className={classNames?.icon} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {hasPermissionToUpdateMember?.success && (
                  <DropdownMenuItem
                    onClick={() => setUpdateRoleDialogOpen(true)}
                  >
                    <UserCogIcon className={classNames?.icon} />
                    {t("UPDATE_ROLE")}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() =>
                    isSelf
                      ? setLeaveDialogOpen(true)
                      : setRemoveDialogOpen(true)
                  }
                  variant="destructive"
                >
                  <UserX className={classNames?.icon} />
                  {isSelf ? t("LEAVE_ORGANIZATION") : t("REMOVE_MEMBER")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
      </Card>

      <RemoveMemberDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        member={member}
        classNames={classNames}
      />

      {organization && (
        <LeaveOrganizationDialog
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
          organization={organization}
          classNames={classNames}
        />
      )}

      <UpdateMemberRoleDialog
        open={updateRoleDialogOpen}
        onOpenChange={setUpdateRoleDialogOpen}
        member={member}
        classNames={classNames}
      />
    </>
  )
}
