"use client";

import { Button } from "@raypx/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog";
import { Loader2 } from "@raypx/ui/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@raypx/ui/components/select";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import type { User } from "better-auth";
import type { Member } from "better-auth/plugins/organization";
import { type ComponentProps, useState } from "react";
import { useAuth } from "../../core/hooks/use-auth";
import { getLocalizedError } from "../../core/lib/utils";
import { MemberCell } from "./member-cell";

export interface UpdateMemberRoleDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  member: Member & { user?: Partial<User> | null };
}

export function UpdateMemberRoleDialog({
  member,
  classNames,
  onOpenChange,
  ...props
}: UpdateMemberRoleDialogProps) {
  const {
    authClient,
    hooks: { useSession, useListMembers },
    t,
    organization,
    toast,
  } = useAuth();

  const { data, refetch } = useListMembers({
    query: { organizationId: member.organizationId },
  });

  const members = data?.members;

  const { data: sessionData } = useSession();

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);

  const builtInRoles = [
    { role: "owner", label: t("OWNER") },
    { role: "admin", label: t("ADMIN") },
    { role: "member", label: t("MEMBER") },
  ];

  const roles = [...builtInRoles, ...(organization?.customRoles || [])];

  const currentUserRole = members?.find((m) => m.user?.id === sessionData?.user.id)?.role;

  const availableRoles = roles.filter((role) => {
    if (role.role === "owner") {
      return currentUserRole === "owner";
    }

    if (role.role === "admin") {
      return currentUserRole === "owner" || currentUserRole === "admin";
    }

    return true;
  });

  const updateMemberRole = async () => {
    if (selectedRole === member.role) {
      toast({
        variant: "error",
        message: `${t("ROLE")} ${t("IS_THE_SAME")}`,
      });

      return;
    }

    setIsUpdating(true);

    try {
      await authClient.organization.updateMemberRole({
        memberId: member.id,
        role: selectedRole as "admin" | "member" | "owner",
        organizationId: member.organizationId,
        fetchOptions: {
          throw: true,
        },
      });

      toast({
        variant: "success",
        message: t("MEMBER_ROLE_UPDATED"),
      });

      await refetch?.();

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }

    setIsUpdating(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={classNames?.dialog?.content}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("UPDATE_ROLE")}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {t("UPDATE_ROLE_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <MemberCell className={classNames?.cell} member={member} hideActions />

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("SELECT_ROLE")} />
            </SelectTrigger>

            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.role} value={role.role}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isUpdating}
          >
            {t("CANCEL")}
          </Button>

          <Button
            type="button"
            onClick={updateMemberRole}
            className={cn(classNames?.button, classNames?.primaryButton)}
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="animate-spin" />}

            {t("UPDATE_ROLE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
