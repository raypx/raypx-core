"use client"

import { Button } from "@raypx/ui/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@raypx/ui/components/drawer"
import { MenuIcon } from "@raypx/ui/components/icons"
import { Label } from "@raypx/ui/components/label"
import { Link } from "@raypx/ui/components/link"
import { cn } from "@raypx/ui/lib/utils"
import { useEffect } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useCurrentOrganization } from "../../core/hooks/use-current-organization"
import { buildOrganizationUrl } from "../../core/lib/url-utils"
import { getViewByPath } from "../../core/lib/utils"
import type { OrganizationViewPath } from "../../core/lib/view-paths"
import type { AccountViewProps } from "../account/account-view"
import { ApiKeysCard } from "../account/api-keys-card"
import { OrganizationInvitationsCard } from "./organization-invitations-card"
import { OrganizationMembersCard } from "./organization-members-card"
import { OrganizationSettingsCards } from "./organization-settings-cards"

export type OrganizationViewPageProps = Omit<AccountViewProps, "view"> & {
  slug?: string
  view?: OrganizationViewPath
}

export function OrganizationView({
  className,
  classNames,

  pathname,
  view: viewProp,
  hideNav,
  slug: slugProp,
  path: pathProp,
}: OrganizationViewPageProps) {
  const {
    organization: organizationOptions,

    t,
    account: accountOptions,

    replace,
  } = useAuth()

  const { slug: contextSlug, viewPaths, apiKey } = organizationOptions || {}

  const path = pathProp ?? pathname?.split("/").pop()
  const view = viewProp || getViewByPath(viewPaths || {}, path) || "SETTINGS"

  const slug = slugProp || contextSlug

  const {
    data: organization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
  } = useCurrentOrganization({ slug })

  const navItems: {
    view: OrganizationViewPath
    label: string
  }[] = [
    { view: "SETTINGS", label: t("SETTINGS") },
    { view: "MEMBERS", label: t("MEMBERS") },
  ]

  if (apiKey) {
    navItems.push({
      view: "API_KEYS",
      label: t("API_KEYS"),
    })
  }

  useEffect(() => {
    if (organization || organizationPending || organizationRefetching) return

    replace(
      `${accountOptions?.basePath}/${accountOptions?.viewPaths?.ORGANIZATIONS}`,
    )
  }, [
    organization,
    organizationPending,
    organizationRefetching,
    accountOptions?.basePath,
    accountOptions?.viewPaths?.ORGANIZATIONS,
    replace,
  ])

  return (
    <div
      className={cn(
        "flex w-full grow flex-col gap-4 md:flex-row md:gap-12",
        className,
        classNames?.base,
      )}
    >
      {!hideNav && (
        <div className="flex justify-between gap-2 md:hidden">
          <Label className="font-semibold text-base">
            {navItems.find((i) => i.view === view)?.label}
          </Label>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <MenuIcon />
              </Button>
            </DrawerTrigger>

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="hidden">
                  {t("ORGANIZATION")}
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col px-4 pb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.view}
                    href={buildOrganizationUrl(
                      organizationOptions?.basePath,
                      organizationOptions?.viewPaths[item.view],
                      slug,
                      organizationOptions?.pathMode,
                    )}
                  >
                    <Button
                      size="lg"
                      className={cn(
                        "w-full justify-start px-4 transition-none",
                        classNames?.drawer?.menuItem,
                        view === item.view
                          ? "font-semibold"
                          : "text-foreground/70",
                      )}
                      variant="ghost"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      {!hideNav && (
        <div className="hidden md:block">
          <div
            className={cn(
              "flex w-48 flex-col gap-1 lg:w-60",
              classNames?.sidebar?.base,
            )}
          >
            {navItems.map((item) => (
              <Link
                key={item.view}
                href={buildOrganizationUrl(
                  organizationOptions?.basePath,
                  organizationOptions?.viewPaths[item.view],
                  slug,
                  organizationOptions?.pathMode,
                )}
              >
                <Button
                  size="lg"
                  className={cn(
                    "w-full justify-start px-4 transition-none",
                    classNames?.sidebar?.button,
                    view === item.view ? "font-semibold" : "text-foreground/70",
                    view === item.view && classNames?.sidebar?.buttonActive,
                  )}
                  variant="ghost"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {view === "MEMBERS" && (
        <div
          className={cn(
            "flex w-full flex-col gap-4 md:gap-6",
            className,
            classNames?.cards,
          )}
        >
          <OrganizationMembersCard classNames={classNames?.card} slug={slug} />

          <OrganizationInvitationsCard
            classNames={classNames?.card}
            slug={slug}
          />
        </div>
      )}

      {view === "API_KEYS" && (
        <ApiKeysCard
          classNames={classNames?.card}
          isPending={organizationPending}
          organizationId={organization?.id}
        />
      )}

      {view === "SETTINGS" && (
        <OrganizationSettingsCards classNames={classNames} slug={slug} />
      )}
    </div>
  )
}
