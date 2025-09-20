"use client";

import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useAuth } from "../../core/hooks/use-auth";
import { DeleteOrganizationCard } from "./delete-organization-card";
import { OrganizationLogoCard } from "./organization-logo-card";
import { OrganizationNameCard } from "./organization-name-card";
import { OrganizationSlugCard } from "./organization-slug-card";

export type OrganizationSettingsCardsProps = {
  className?: string;
  classNames?: {
    card?: SettingsCardClassNames;
    cards?: string;
  };
  slug?: string;
};

export function OrganizationSettingsCards({
  className,
  classNames,
  slug,
}: OrganizationSettingsCardsProps) {
  const { organization: organizationOptions } = useAuth();

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
      {organizationOptions?.logo && (
        <OrganizationLogoCard classNames={classNames?.card} slug={slug} />
      )}

      <OrganizationNameCard classNames={classNames?.card} slug={slug} />

      <OrganizationSlugCard classNames={classNames?.card} slug={slug} />

      <DeleteOrganizationCard classNames={classNames?.card} slug={slug} />
    </div>
  );
}
