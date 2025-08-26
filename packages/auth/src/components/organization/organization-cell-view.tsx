"use client"

import { Skeleton } from "@raypx/ui/components/skeleton"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import { useAuth } from "../../core/hooks/use-auth"
import {
  OrganizationLogo,
  type OrganizationLogoClassNames,
} from "./organization-logo"

export interface OrganizationViewClassNames {
  base?: string
  avatar?: OrganizationLogoClassNames
  content?: string
  title?: string
  subtitle?: string
  skeleton?: string
}

export interface OrganizationViewProps {
  className?: string
  classNames?: OrganizationViewClassNames
  isPending?: boolean
  size?: "sm" | "default" | "lg" | null
  organization?: Organization | null
}

export function OrganizationCellView({
  className,
  classNames,
  isPending,
  size,
  organization,
}: OrganizationViewProps) {
  const { t } = useAuth()

  return (
    <div
      className={cn(
        "flex items-center gap-2 truncate",
        className,
        classNames?.base,
      )}
    >
      <OrganizationLogo
        className={cn(size !== "sm" && "my-0.5")}
        classNames={classNames?.avatar}
        isPending={isPending}
        organization={organization}
        size={size}
      />
      <div
        className={cn(
          "flex flex-col truncate text-left leading-tight",
          classNames?.content,
        )}
      >
        {isPending ? (
          <>
            <Skeleton
              className={cn(
                "max-w-full",
                size === "lg" ? "h-4.5 w-32" : "h-3.5 w-24",
                classNames?.title,
                classNames?.skeleton,
              )}
            />

            {size !== "sm" && (
              <Skeleton
                className={cn(
                  "mt-1.5 max-w-full",
                  size === "lg" ? "h-3.5 w-24" : "h-3 w-16",
                  classNames?.subtitle,
                  classNames?.skeleton,
                )}
              />
            )}
          </>
        ) : (
          <>
            <span
              className={cn(
                "truncate font-semibold",
                size === "lg" ? "text-base" : "text-sm",
                classNames?.title,
              )}
            >
              {organization?.name || t("ORGANIZATION")}
            </span>

            {size !== "sm" && organization?.slug && (
              <span
                className={cn(
                  "truncate opacity-70",
                  size === "lg" ? "text-sm" : "text-xs",
                  classNames?.subtitle,
                )}
              >
                {organization.slug}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
