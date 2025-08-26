"use client"

import { CardContent } from "@raypx/ui/components/card"
import type { SettingsCardProps } from "@raypx/ui/components/settings"
import { SettingsCard } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useCurrentOrganization } from "../../core/hooks/use-current-organization"
import { InviteMemberDialog } from "./invite-member-dialog"
import { MemberCell } from "./member-cell"

export function OrganizationMembersCard({
  className,
  classNames,
  slug: slugProp,
  ...props
}: SettingsCardProps & { slug?: string }) {
  const { t, organization: organizationOptions } = useAuth()

  const slug = slugProp || organizationOptions?.slug

  const { data: organization } = useCurrentOrganization({ slug })

  if (!organization) {
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        title={t("MEMBERS")}
        description={t("MEMBERS_DESCRIPTION")}
        instructions={t("MEMBERS_INSTRUCTIONS")}
        actionLabel={t("INVITE_MEMBER")}
        isPending
        {...props}
      />
    )
  }

  return (
    <OrganizationMembersContent
      className={className}
      classNames={classNames}
      organization={organization}
      {...props}
    />
  )
}

function OrganizationMembersContent({
  className,
  classNames,
  organization,
  ...props
}: SettingsCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission, useListMembers },
    t,
  } = useAuth()

  const { data: hasPermissionInvite, isPending: isPendingInvite } =
    useHasPermission({
      organizationId: organization.id,
      permissions: {
        invitation: ["create"],
      },
    })

  const { data: hasPermissionUpdateMember, isPending: isPendingUpdateMember } =
    useHasPermission({
      organizationId: organization.id,
      permission: {
        member: ["update"],
      },
    })

  const isPending = isPendingInvite || isPendingUpdateMember

  const { data } = useListMembers({
    query: { organizationId: organization.id },
  })

  const members = data?.members

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        title={t("MEMBERS")}
        description={t("MEMBERS_DESCRIPTION")}
        instructions={t("MEMBERS_INSTRUCTIONS")}
        actionLabel={t("INVITE_MEMBER")}
        action={() => setInviteDialogOpen(true)}
        isPending={isPending}
        disabled={!hasPermissionInvite?.success}
        {...props}
      >
        {!isPending && members && members.length > 0 && (
          <CardContent className={cn("grid gap-4", classNames?.content)}>
            {members
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              )
              .map((member) => (
                <MemberCell
                  key={member.id}
                  classNames={classNames}
                  member={member}
                  hideActions={!hasPermissionUpdateMember?.success}
                />
              ))}
          </CardContent>
        )}
      </SettingsCard>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        classNames={classNames}
        organization={organization}
      />
    </>
  )
}
