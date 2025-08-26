"use client"

import { Button } from "@raypx/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import {
  ChevronsUpDown,
  LogInIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
} from "@raypx/ui/components/icons"
import { Link } from "@raypx/ui/components/link"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useCurrentOrganization } from "../../core/hooks/use-current-organization"
import {
  buildAccountUrl,
  buildAuthUrl,
  buildOrganizationUrl,
} from "../../core/lib/url-utils"
import { getLocalizedError } from "../../core/lib/utils"
import type { User } from "../../types"
import { PersonalAccountView } from "../account/personal-account-view"
import { UserAvatar, type UserAvatarClassNames } from "../account/user-avatar"
import type { UserViewClassNames } from "../account/user-view"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import {
  OrganizationCellView,
  type OrganizationViewClassNames,
} from "./organization-cell-view"
import { OrganizationLogo } from "./organization-logo"

export interface OrganizationSwitcherClassNames {
  base?: string
  skeleton?: string
  trigger?: {
    base?: string
    avatar?: UserAvatarClassNames
    user?: UserViewClassNames
    organization?: OrganizationViewClassNames
    skeleton?: string
  }
  content?: {
    base?: string
    user?: UserViewClassNames
    organization?: OrganizationViewClassNames
    avatar?: UserAvatarClassNames
    menuItem?: string
    separator?: string
  }
}

export interface OrganizationSwitcherProps
  extends Omit<ComponentProps<typeof Button>, "trigger"> {
  classNames?: OrganizationSwitcherClassNames
  align?: "center" | "start" | "end"
  trigger?: ReactNode
  slug?: string
  onSetActive?: (organization: Organization | null) => void
  /**
   * Hide the personal organization option from the switcher.
   * When true, users can only switch between organizations and cannot access their personal account.
   * If no organization is active, the first available organization will be automatically selected.
   * @default false
   */
  hidePersonal?: boolean
}

/**
 * Displays an interactive user button with dropdown menu functionality
 *
 * Renders a user interface element that can be displayed as either an icon or full button:
 * - Shows a user avatar or placeholder when in icon mode
 * - Displays user name and email with dropdown indicator in full mode
 * - Provides dropdown menu with authentication options (sign in/out, settings, etc.)
 * - Supports multi-session functionality for switching between accounts
 * - Can be customized with additional links and styling options
 */
export function OrganizationSwitcher({
  className,
  classNames,
  align,
  trigger,
  slug: slugProp,
  size,
  onSetActive,
  hidePersonal,
  ...props
}: OrganizationSwitcherProps) {
  const {
    authClient,
    basePath,
    hooks: { useSession, useListOrganizations },
    t,
    account: accountOptions,
    organization: organizationOptions,
    redirectTo,
    navigate,
    toast,
    viewPaths,
  } = useAuth()

  const {
    pathMode,
    slug: contextSlug,
    personalPath,
  } = organizationOptions || {}

  const slug = slugProp || contextSlug

  const [activeOrganizationPending, setActiveOrganizationPending] =
    useState(false)
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { data: sessionData, isPending: sessionPending } = useSession()
  const user = sessionData?.user

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations()

  const {
    data: activeOrganization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
  } = useCurrentOrganization({ slug })

  const isPending =
    organizationsPending ||
    sessionPending ||
    activeOrganizationPending ||
    organizationPending

  useEffect(() => {
    if (organizationRefetching) return

    setActiveOrganizationPending(false)
  }, [activeOrganization, organizationRefetching])

  const switchOrganization = useCallback(
    async (organization: Organization | null) => {
      // Prevent switching to personal account when hidePersonal is true
      if (hidePersonal && organization === null) {
        return
      }

      if (pathMode === "slug") {
        if (organization) {
          navigate(`${organizationOptions?.basePath}/${organization.slug}`)
        } else {
          navigate(
            personalPath ??
              buildAccountUrl(
                accountOptions?.basePath,
                accountOptions?.viewPaths.SETTINGS,
              ) ??
              redirectTo,
          )
        }

        return
      }

      setActiveOrganizationPending(true)

      try {
        onSetActive?.(organization)

        await authClient.organization.setActive({
          organizationId: organization?.id || null,
          fetchOptions: {
            throw: true,
          },
        })
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, t }),
        })

        setActiveOrganizationPending(false)
      }
    },
    [
      authClient,
      toast,
      t,
      onSetActive,
      hidePersonal,
      pathMode,
      personalPath,
      organizationOptions?.basePath,
      redirectTo,
      navigate,
    ],
  )

  // Auto-select first organization when hidePersonal is true
  useEffect(() => {
    if (
      hidePersonal &&
      !activeOrganization &&
      !activeOrganizationPending &&
      organizations &&
      organizations.length > 0 &&
      !sessionPending &&
      !organizationPending &&
      !slug
    ) {
      switchOrganization(organizations[0])
    }
  }, [
    hidePersonal,
    activeOrganization,
    activeOrganizationPending,
    organizations,
    sessionPending,
    organizationPending,
    switchOrganization,
    slug,
  ])

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          {trigger ||
            (size === "icon" ? (
              <Button
                size="icon"
                className={cn(
                  "size-fit rounded-full",
                  className,
                  classNames?.trigger?.base,
                )}
                variant="ghost"
                type="button"
                {...props}
              >
                {isPending ||
                activeOrganization ||
                !sessionData ||
                (user as User)?.isAnonymous ||
                hidePersonal ? (
                  <OrganizationLogo
                    key={activeOrganization?.logo}
                    className={cn(className, classNames?.base)}
                    classNames={classNames?.trigger?.avatar}
                    isPending={isPending}
                    organization={activeOrganization}
                    aria-label={t("ORGANIZATION")}
                  />
                ) : (
                  <UserAvatar
                    key={user?.image}
                    className={cn(className, classNames?.base)}
                    classNames={classNames?.trigger?.avatar}
                    user={user}
                    aria-label={t("ACCOUNT")}
                  />
                )}
              </Button>
            ) : (
              <Button
                className={cn(
                  "!p-2 h-fit",
                  className,
                  classNames?.trigger?.base,
                )}
                size={size}
                {...props}
              >
                {isPending ||
                activeOrganization ||
                !sessionData ||
                (user as User)?.isAnonymous ||
                hidePersonal ? (
                  <OrganizationCellView
                    classNames={classNames?.trigger?.organization}
                    isPending={isPending}
                    organization={activeOrganization}
                    size={size}
                  />
                ) : (
                  <PersonalAccountView
                    classNames={classNames?.trigger?.user}
                    size={size}
                    user={user}
                  />
                )}

                <ChevronsUpDown className="ml-auto" />
              </Button>
            ))}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn(
            "w-[--radix-dropdown-menu-trigger-width] min-w-56 max-w-64",
            classNames?.content?.base,
          )}
          align={align}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-2 p-2",
              classNames?.content?.menuItem,
            )}
          >
            {(user && !(user as User).isAnonymous) || isPending ? (
              <>
                {activeOrganizationPending ||
                activeOrganization ||
                hidePersonal ? (
                  <OrganizationCellView
                    classNames={classNames?.content?.organization}
                    isPending={isPending || activeOrganizationPending}
                    organization={activeOrganization}
                  />
                ) : (
                  <PersonalAccountView
                    classNames={classNames?.content?.user}
                    isPending={isPending}
                    user={user}
                  />
                )}

                {!isPending && (
                  <Link
                    href={
                      activeOrganization
                        ? buildOrganizationUrl(
                            organizationOptions?.basePath,
                            organizationOptions?.viewPaths.SETTINGS,
                            activeOrganization?.slug,
                            organizationOptions?.pathMode,
                          )
                        : buildAccountUrl(
                            accountOptions?.basePath,
                            accountOptions?.viewPaths.SETTINGS,
                          )
                    }
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      className="!size-8 ml-auto"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <SettingsIcon className="size-4" />
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="-my-1 text-muted-foreground text-xs">
                {t("ORGANIZATION")}
              </div>
            )}
          </div>

          <DropdownMenuSeparator className={classNames?.content?.separator} />

          {activeOrganization && !hidePersonal && (
            <DropdownMenuItem onClick={() => switchOrganization(null)}>
              <PersonalAccountView
                classNames={classNames?.content?.user}
                isPending={isPending}
                user={user}
              />
            </DropdownMenuItem>
          )}

          {organizations?.map(
            (organization) =>
              organization.id !== activeOrganization?.id && (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => switchOrganization(organization)}
                >
                  <OrganizationCellView
                    classNames={classNames?.content?.organization}
                    isPending={isPending}
                    organization={organization}
                  />
                </DropdownMenuItem>
              ),
          )}

          {organizations &&
            organizations.length > 0 &&
            (!hidePersonal || organizations.length > 1) && (
              <DropdownMenuSeparator
                className={classNames?.content?.separator}
              />
            )}

          {!isPending && sessionData && !(user as User).isAnonymous ? (
            <DropdownMenuItem
              className={cn(classNames?.content?.menuItem)}
              onClick={() => setIsCreateOrgDialogOpen(true)}
            >
              <PlusCircleIcon />
              {t("CREATE_ORGANIZATION")}
            </DropdownMenuItem>
          ) : (
            <Link href={buildAuthUrl(basePath, viewPaths.SIGN_IN)}>
              <DropdownMenuItem className={cn(classNames?.content?.menuItem)}>
                <LogInIcon />
                {t("SIGN_IN")}
              </DropdownMenuItem>
            </Link>
          )}
          <DropdownMenuSeparator className={classNames?.content?.separator} />

          <Link href={buildAuthUrl(basePath, viewPaths.SIGN_OUT)}>
            <DropdownMenuItem className={cn(classNames?.content?.menuItem)}>
              <LogOutIcon />
              {t("SIGN_OUT")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={isCreateOrgDialogOpen}
        onOpenChange={setIsCreateOrgDialogOpen}
      />
    </>
  )
}
