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
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useAuth } from "../../core/hooks/use-auth"
import { buildAccountUrl } from "../../core/lib/url-utils"
import { getViewByPath } from "../../core/lib/utils"
import type { AccountViewPath } from "../../server"
import { OrganizationsCard } from "../organization/organizations-card"
import { AccountSettingsCards } from "./account-settings-cards"
import { ApiKeysCard } from "./api-keys-card"
import { SecuritySettingsCards } from "./security-settings-cards"
import { UserInvitationsCard } from "./user-invitations-card"

export interface AccountViewProps {
  className?: string
  classNames?: {
    base?: string
    cards?: string
    drawer?: { menuItem?: string }
    sidebar?: { base?: string; button?: string; buttonActive?: string }
    card?: SettingsCardClassNames
  }
  pathname?: string
  view?: AccountViewPath
  path?: string
  hideNav?: boolean
}

export function AccountView({
  className,
  classNames,
  pathname,
  view: viewProp,
  hideNav,
  path: pathProp,
}: AccountViewProps) {
  const { apiKey, t, organization, account: accountOptions } = useAuth()

  if (!accountOptions) {
    return null
  }

  const path = pathProp ?? pathname?.split("/").pop()
  const view =
    viewProp || getViewByPath(accountOptions.viewPaths, path) || "SETTINGS"

  const navItems: {
    view: AccountViewPath
    label: string
  }[] = [
    { view: "SETTINGS", label: t("ACCOUNT") },
    { view: "SECURITY", label: t("SECURITY") },
  ]

  if (apiKey) {
    navItems.push({
      view: "API_KEYS",
      label: t("API_KEYS"),
    })
  }

  if (organization) {
    navItems.push({
      view: "ORGANIZATIONS",
      label: t("ORGANIZATIONS"),
    })
  }

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
                <DrawerTitle className="hidden">{t("SETTINGS")}</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col px-4 pb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.view}
                    href={buildAccountUrl(
                      accountOptions?.basePath,
                      accountOptions?.viewPaths[item.view],
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
                href={buildAccountUrl(
                  accountOptions?.basePath,
                  accountOptions?.viewPaths[item.view],
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

      {view === "SETTINGS" && <AccountSettingsCards classNames={classNames} />}

      {view === "SECURITY" && <SecuritySettingsCards classNames={classNames} />}

      {view === "API_KEYS" && <ApiKeysCard classNames={classNames?.card} />}

      {view === "ORGANIZATIONS" && organization && (
        <div className="grid w-full gap-4 md:gap-6">
          <OrganizationsCard classNames={classNames?.card} />

          <UserInvitationsCard classNames={classNames?.card} />
        </div>
      )}
    </div>
  )
}
