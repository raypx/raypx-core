"use client";

import { CardContent } from "@raypx/ui/components/card";
import type { SettingsCardProps } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useState } from "react";
import { useAuth } from "../../core/hooks/use-auth";
import { useIsHydrated } from "../../core/hooks/use-hydrated";
import { SettingsCellSkeleton } from "../account/settings-cell-skeleton";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { OrganizationCell } from "./organization-cell";

export function OrganizationsCard({ className, classNames, ...props }: SettingsCardProps) {
  const {
    hooks: { useListOrganizations },
    t,
  } = useAuth();

  const isHydrated = useIsHydrated();
  const { data: organizations, isPending: organizationsPending } = useListOrganizations();

  const isPending = !isHydrated || organizationsPending;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        title={t("ORGANIZATIONS")}
        description={t("ORGANIZATIONS_DESCRIPTION")}
        instructions={t("ORGANIZATIONS_INSTRUCTIONS")}
        actionLabel={t("CREATE_ORGANIZATION")}
        action={() => setCreateDialogOpen(true)}
        isPending={isPending}
        {...props}
      >
        {organizations && organizations?.length > 0 && (
          <CardContent className={cn("grid gap-4", classNames?.content)}>
            {isPending && <SettingsCellSkeleton />}
            {organizations?.map((organization) => (
              <OrganizationCell
                key={organization.id}
                classNames={classNames}
                organization={organization}
              />
            ))}
          </CardContent>
        )}
      </SettingsCard>

      <CreateOrganizationDialog
        classNames={classNames}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
