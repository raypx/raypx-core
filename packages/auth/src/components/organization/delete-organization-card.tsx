"use client"

import type { SettingsCardProps } from "@raypx/ui/components/settings"
import { SettingsCard } from "@raypx/ui/components/settings"
import type { Organization } from "better-auth/plugins/organization"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useCurrentOrganization } from "../../core/hooks/use-current-organization"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"

export function DeleteOrganizationCard({
  className,
  classNames,
  slug,
  ...props
}: SettingsCardProps & { slug?: string }) {
  const { t } = useAuth()

  const { data: organization } = useCurrentOrganization({ slug })

  if (!organization)
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={t("DELETE_ORGANIZATION")}
        description={t("DELETE_ORGANIZATION_DESCRIPTION")}
        isPending
        title={t("DELETE_ORGANIZATION")}
        variant="destructive"
      />
    )

  return (
    <DeleteOrganizationForm
      className={className}
      classNames={classNames}
      organization={organization}
      {...props}
    />
  )
}

function DeleteOrganizationForm({
  className,
  classNames,
  organization,
}: SettingsCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission },
    t,
  } = useAuth()

  const { data: hasPermission, isPending } = useHasPermission({
    organizationId: organization.id,
    permissions: {
      organization: ["delete"],
    },
  })

  const [showDialog, setShowDialog] = useState(false)

  if (!hasPermission?.success) return null

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={t("DELETE_ORGANIZATION")}
        description={t("DELETE_ORGANIZATION_DESCRIPTION")}
        isPending={isPending}
        title={t("DELETE_ORGANIZATION")}
        variant="destructive"
        action={() => setShowDialog(true)}
      />

      <DeleteOrganizationDialog
        classNames={classNames}
        open={showDialog}
        onOpenChange={setShowDialog}
        organization={organization}
      />
    </>
  )
}
