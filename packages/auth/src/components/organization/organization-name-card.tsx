"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent } from "@raypx/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@raypx/ui/components/form";
import { Input } from "@raypx/ui/components/input";
import { SettingsCard, type SettingsCardProps } from "@raypx/ui/components/settings";
import { Skeleton } from "@raypx/ui/components/skeleton";
import { cn } from "@raypx/ui/lib/utils";
import type { Organization } from "better-auth/plugins/organization";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAuth } from "../../core/hooks/use-auth";
import { useCurrentOrganization } from "../../core/hooks/use-current-organization";
import { getLocalizedError } from "../../core/lib/utils";

export interface OrganizationNameCardProps extends SettingsCardProps {
  slug?: string;
}

export function OrganizationNameCard({
  className,
  classNames,
  slug,
  ...props
}: OrganizationNameCardProps) {
  const { t } = useAuth();

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) {
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={t("SAVE")}
        description={t("ORGANIZATION_NAME_DESCRIPTION")}
        instructions={t("ORGANIZATION_NAME_INSTRUCTIONS")}
        isPending
        title={t("ORGANIZATION_NAME")}
        {...props}
      >
        <CardContent className={classNames?.content}>
          <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
        </CardContent>
      </SettingsCard>
    );
  }

  return (
    <OrganizationNameForm
      className={className}
      classNames={classNames}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationNameForm({
  className,
  classNames,
  organization,
  ...props
}: OrganizationNameCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission },
    mutators: { updateOrganization },
    optimistic,
    toast,
    t,
  } = useAuth();

  const { data: hasPermission, isPending: permissionPending } = useHasPermission({
    organizationId: organization.id,
    permissions: {
      organization: ["update"],
    },
  });

  const { refetch: refetchOrganization } = useCurrentOrganization({
    slug: organization.slug,
  });

  const isPending = permissionPending;

  const formSchema = z.object({
    name: z.string().min(1, {
      message: t("FIELD_IS_REQUIRED", { field: t("ORGANIZATION_NAME") }),
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: { name: organization.name || "" },
  });

  const { isSubmitting } = form.formState;

  const updateOrganizationName = async ({ name }: z.infer<typeof formSchema>) => {
    if (organization.name === name) {
      toast({
        variant: "error",
        message: `${t("ORGANIZATION_NAME")} ${t("IS_THE_SAME")}`,
      });

      return;
    }

    try {
      await updateOrganization({
        organizationId: organization.id,
        data: { name },
      });

      await refetchOrganization?.();

      toast({
        variant: "success",
        message: `${t("ORGANIZATION_NAME")} ${t("UPDATED_SUCCESSFULLY")}`,
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(updateOrganizationName)}>
        <SettingsCard
          className={className}
          classNames={classNames}
          description={t("ORGANIZATION_NAME_DESCRIPTION")}
          instructions={t("ORGANIZATION_NAME_INSTRUCTIONS")}
          isPending={isPending}
          title={t("ORGANIZATION_NAME")}
          actionLabel={t("SAVE")}
          optimistic={optimistic}
          disabled={!hasPermission?.success}
          {...props}
        >
          <CardContent className={classNames?.content}>
            {isPending ? (
              <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
            ) : (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className={classNames?.input}
                        placeholder={t("ORGANIZATION_NAME_PLACEHOLDER")}
                        disabled={isSubmitting || !hasPermission?.success}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </SettingsCard>
      </form>
    </Form>
  );
}
