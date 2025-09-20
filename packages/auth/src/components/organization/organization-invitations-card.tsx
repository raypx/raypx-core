"use client";

import { CardContent } from "@raypx/ui/components/card";
import type { SettingsCardProps } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import type { Organization } from "better-auth/plugins/organization";
import { useAuth } from "../../core/hooks/use-auth";
import { useCurrentOrganization } from "../../core/hooks/use-current-organization";
import { InvitationCell } from "./invitation-cell";

export function OrganizationInvitationsCard({
  className,
  classNames,
  slug: slugProp,
  ...props
}: SettingsCardProps & { slug?: string }) {
  const { organization: organizationOptions } = useAuth();

  const slug = slugProp || organizationOptions?.slug;

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) return null;

  return (
    <OrganizationInvitationsContent
      className={className}
      classNames={classNames}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationInvitationsContent({
  className,
  classNames,
  organization,
  ...props
}: SettingsCardProps & { organization: Organization }) {
  const {
    hooks: { useListInvitations },
    t,
  } = useAuth();

  const { data: invitations } = useListInvitations({
    query: { organizationId: organization.id },
  });

  const pendingInvitations = invitations?.filter((invitation) => invitation.status === "pending");
  if (!pendingInvitations?.length) return null;

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={t("PENDING_INVITATIONS")}
      description={t("PENDING_INVITATIONS_DESCRIPTION")}
      {...props}
    >
      <CardContent className={cn("grid gap-4", classNames?.content)}>
        {pendingInvitations.map((invitation) => (
          <InvitationCell
            key={invitation.id}
            classNames={classNames}
            invitation={invitation}
            organization={organization}
          />
        ))}
      </CardContent>
    </SettingsCard>
  );
}
