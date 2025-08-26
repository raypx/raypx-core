"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@raypx/ui/components/avatar"
import { BuildingIcon } from "@raypx/ui/components/icons"
import { Skeleton } from "@raypx/ui/components/skeleton"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import type { ComponentProps } from "react"
import { useAuth } from "../../core/hooks/use-auth"

export interface OrganizationLogoClassNames {
  base?: string
  image?: string
  fallback?: string
  fallbackIcon?: string
  skeleton?: string
}

export interface OrganizationLogoProps {
  classNames?: OrganizationLogoClassNames
  isPending?: boolean
  size?: "sm" | "default" | "lg" | "xl" | null
  organization?: Partial<Organization> | null
}

/**
 * Displays an organization logo with image and fallback support
 *
 * Renders an organization's logo image when available, with appropriate fallbacks:
 * - Shows a skeleton when isPending is true
 * - Falls back to a building icon when no logo is available
 */
export function OrganizationLogo({
  className,
  classNames,
  isPending,
  size,
  organization,
  ...props
}: OrganizationLogoProps & ComponentProps<typeof Avatar>) {
  const { t, avatar } = useAuth()

  const name = organization?.name
  const src = organization?.logo

  if (isPending) {
    return (
      <Skeleton
        className={cn(
          "shrink-0 rounded-full",
          size === "sm"
            ? "size-6"
            : size === "lg"
              ? "size-10"
              : size === "xl"
                ? "size-12"
                : "size-8",
          className,
          classNames?.base,
          classNames?.skeleton,
        )}
      />
    )
  }

  return (
    <Avatar
      className={cn(
        "bg-muted",
        size === "sm"
          ? "size-6"
          : size === "lg"
            ? "size-10"
            : size === "xl"
              ? "size-12"
              : "size-8",
        className,
        classNames?.base,
      )}
      {...props}
    >
      {avatar?.Image ? (
        <avatar.Image
          alt={name || t("ORGANIZATION")}
          className={classNames?.image}
          src={src || ""}
        />
      ) : (
        <AvatarImage
          alt={name || t("ORGANIZATION")}
          className={classNames?.image}
          src={src || undefined}
        />
      )}

      <AvatarFallback
        className={cn("text-foreground", classNames?.fallback)}
        delayMs={src ? 600 : undefined}
      >
        <BuildingIcon className={cn("size-[50%]", classNames?.fallbackIcon)} />
      </AvatarFallback>
    </Avatar>
  )
}
