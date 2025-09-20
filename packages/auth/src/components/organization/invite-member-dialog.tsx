"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@raypx/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form";
import { Loader2 } from "@raypx/ui/components/icons";
import { Input } from "@raypx/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@raypx/ui/components/select";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import type { Organization } from "better-auth/plugins/organization";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAuth } from "../../core/hooks/use-auth";
import { getLocalizedError } from "../../core/lib/utils";

export interface InviteMemberDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  organization: Organization;
}

export function InviteMemberDialog({
  classNames,
  onOpenChange,
  organization,
  ...props
}: InviteMemberDialogProps) {
  const {
    authClient,
    hooks: { useListInvitations, useListMembers, useSession },
    t,
    toast,
    organization: organizationOptions,
  } = useAuth();

  const { data } = useListMembers({
    query: { organizationId: organization.id },
  });

  const { refetch } = useListInvitations({
    query: { organizationId: organization.id },
  });

  const members = data?.members;

  const { data: sessionData } = useSession();
  const membership = members?.find((m) => m.userId === sessionData?.user.id);

  const builtInRoles = [
    { role: "owner", label: t("OWNER") },
    { role: "admin", label: t("ADMIN") },
    { role: "member", label: t("MEMBER") },
  ] as const;

  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const availableRoles = roles.filter(
    (role) => membership?.role === "owner" || role.role !== "owner",
  );

  const formSchema = z.object({
    email: z
      .email({
        message: t("INVALID_EMAIL"),
      })
      .min(1, { message: t("EMAIL_REQUIRED") }),
    role: z.string().min(1, {
      message: t("FIELD_IS_REQUIRED", { field: t("ROLE") }),
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ email, role }: z.infer<typeof formSchema>) {
    try {
      await authClient.organization.inviteMember({
        email,
        role: role as (typeof builtInRoles)[number]["role"],
        organizationId: organization.id,
        fetchOptions: { throw: true },
      });

      await refetch?.();

      onOpenChange?.(false);
      form.reset();

      toast({
        variant: "success",
        message: t("SEND_INVITATION_SUCCESS") || "Invitation sent successfully",
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("INVITE_MEMBER")}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {t("INVITE_MEMBER_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={classNames?.label}>{t("EMAIL")}</FormLabel>

                  <FormControl>
                    <Input
                      placeholder={t("EMAIL_PLACEHOLDER")}
                      type="email"
                      {...field}
                      className={classNames?.input}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={classNames?.label}>{t("ROLE")}</FormLabel>

                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.role} value={role.role}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                className={cn(classNames?.button, classNames?.outlineButton)}
              >
                {t("CANCEL")}
              </Button>

              <Button
                type="submit"
                className={cn(classNames?.button, classNames?.primaryButton)}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {t("SEND_INVITATION")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
