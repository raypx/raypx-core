"use client";

import { Skeleton } from "@raypx/ui/components/skeleton";
import { cn } from "@raypx/ui/lib/utils";
import { useAuth } from "../../core/hooks/use-auth";
import type { UserViewProps } from "../account/user-view";
import { UserAvatar } from "./user-avatar";

/**
 * Displays user information with avatar and details in a compact view for personal accounts
 *
 * Renders a user's profile information with appropriate fallbacks:
 * - Shows avatar alongside user name and "Personal Account" subtitle when available
 * - Shows loading skeletons when isPending is true
 * - Falls back to generic "User" text when neither name nor email is available
 * - Always shows "Personal Account" as subtitle for default and lg sizes
 * - Supports customization through classNames prop
 */
export function PersonalAccountView({
  className,
  classNames,
  isPending,
  size,
  user,
}: UserViewProps) {
  const { t } = useAuth();

  return (
    <div className={cn("flex items-center gap-2", className, classNames?.base)}>
      <UserAvatar
        className={cn(size !== "sm" && "my-0.5")}
        classNames={classNames?.avatar}
        isPending={isPending}
        size={size}
        user={user}
      />

      <div className={cn("grid flex-1 text-left leading-tight", classNames?.content)}>
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
                  size === "lg" ? "h-3.5 w-40" : "h-3 w-32",
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
              {user?.displayName ||
                user?.name ||
                user?.fullName ||
                user?.firstName ||
                user?.displayUsername ||
                user?.username ||
                user?.email ||
                t("USER")}
            </span>

            {size !== "sm" && (
              <span
                className={cn(
                  "truncate opacity-70",
                  size === "lg" ? "text-sm" : "text-xs",
                  classNames?.subtitle,
                )}
              >
                {t("PERSONAL_ACCOUNT")}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
