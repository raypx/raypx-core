"use client";

import { dayjs } from "@raypx/shared/utils";
import { Button } from "@raypx/ui/components/button";
import { Card, CardContent } from "@raypx/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu";
import { Check, EllipsisIcon, Loader2, X } from "@raypx/ui/components/icons";
import type { SettingsCardProps } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useState } from "react";
import { useAuth } from "../../core/hooks/use-auth";
import { getLocalizedError } from "../../core/lib/utils";
import { UserAvatar } from "./user-avatar";

export function UserInvitationsCard({ className, classNames, ...props }: SettingsCardProps) {
  const {
    hooks: { useListUserInvitations, useListOrganizations },
    t,
  } = useAuth();

  const { data: invitations, refetch: refetchInvitations } = useListUserInvitations();
  const { refetch: refetchOrganizations } = useListOrganizations();

  const handleRefresh = async () => {
    await refetchInvitations?.();
    await refetchOrganizations?.();
  };

  const pendingInvitations = invitations?.filter((invitation) => invitation.status === "pending");

  if (!pendingInvitations?.length) return null;

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={t("PENDING_INVITATIONS")}
      description={t("PENDING_USER_INVITATIONS_DESCRIPTION")}
      {...props}
    >
      <CardContent className={cn("grid gap-4", classNames?.content)}>
        {pendingInvitations.map((invitation) => (
          <UserInvitationRow
            key={invitation.id}
            classNames={classNames}
            invitation={{
              id: invitation.id,
              email: invitation.email,
              role: invitation.role,
              status: invitation.status,
              expiresAt: invitation.expiresAt,
            }}
            onChanged={handleRefresh}
          />
        ))}
      </CardContent>
    </SettingsCard>
  );
}

function UserInvitationRow({
  classNames,
  invitation,
  onChanged,
}: {
  classNames?: SettingsCardProps["classNames"];
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: Date;
  };
  onChanged?: () => unknown;
}) {
  const { authClient, organization: organizationOptions, t, toast, locale } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const builtInRoles = [
    { role: "owner", label: t("OWNER") },
    { role: "admin", label: t("ADMIN") },
    { role: "member", label: t("MEMBER") },
  ];

  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const role = roles.find((r) => r.role === invitation.role);

  const handleAccept = async () => {
    setIsLoading(true);

    try {
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
        fetchOptions: { throw: true },
      });

      await onChanged?.();

      toast({
        variant: "success",
        message: t("INVITATION_ACCEPTED"),
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }

    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);

    try {
      await authClient.organization.rejectInvitation({
        invitationId: invitation.id,
        fetchOptions: { throw: true },
      });

      await onChanged?.();

      toast({
        variant: "success",
        message: t("INVITATION_REJECTED"),
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className={cn("flex-row items-center p-4", classNames?.cell)}>
      <div className="flex flex-1 items-center gap-2">
        <UserAvatar className="my-0.5" user={{ email: invitation.email }} />

        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate font-semibold text-sm">{invitation.email}</span>

          <span className="truncate text-muted-foreground text-xs">
            {t("EXPIRES")} {dayjs(invitation.expiresAt).locale(locale).format("LL")}
          </span>
        </div>
      </div>

      <span className="truncate text-sm opacity-70">{role?.label}</span>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn("relative ms-auto", classNames?.button, classNames?.outlineButton)}
              disabled={isLoading}
              size="icon"
              type="button"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <EllipsisIcon className={classNames?.icon} />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onClick={handleAccept} disabled={isLoading}>
              <Check className={classNames?.icon} />

              {t("ACCEPT")}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleReject} disabled={isLoading} variant="destructive">
              <X className={classNames?.icon} />

              {t("REJECT")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
