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

export interface OrganizationSlugCardProps extends SettingsCardProps {
  slug?: string;
}

export function OrganizationSlugCard({
  className,
  classNames,
  slug: slugProp,
  ...props
}: OrganizationSlugCardProps) {
  const { t, organization: organizationOptions } = useAuth();

  const slug = slugProp || organizationOptions?.slug;

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) {
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        description={t("ORGANIZATION_SLUG_DESCRIPTION")}
        instructions={t("ORGANIZATION_SLUG_INSTRUCTIONS")}
        isPending
        title={t("ORGANIZATION_SLUG")}
        actionLabel={t("SAVE")}
        {...props}
      >
        <CardContent className={classNames?.content}>
          <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
        </CardContent>
      </SettingsCard>
    );
  }

  return (
    <OrganizationSlugForm
      className={className}
      classNames={classNames}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationSlugForm({
  className,
  classNames,
  organization,
  ...props
}: OrganizationSlugCardProps & { organization: Organization }) {
  const {
    t,
    hooks: { useHasPermission },
    mutators: { updateOrganization },
    optimistic,
    toast,
    organization: organizationOptions,
    replace,
  } = useAuth();

  const { refetch: refetchOrganization } = useCurrentOrganization({
    slug: organization.slug,
  });

  const { data: hasPermission, isPending } = useHasPermission({
    organizationId: organization.id,
    permissions: {
      organization: ["update"],
    },
  });

  const formSchema = z.object({
    slug: z
      .string()
      .min(1, {
        message: t("FIELD_IS_REQUIRED", { field: t("ORGANIZATION_SLUG") }),
      })
      .regex(/^[a-z0-9-]+$/, {
        message: `${t("ORGANIZATION_SLUG")} ${t("IS_INVALID")}`,
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: { slug: organization.slug || "" },
  });

  const { isSubmitting } = form.formState;

  const updateOrganizationSlug = async ({ slug }: z.infer<typeof formSchema>) => {
    if (organization.slug === slug) {
      toast({
        variant: "error",
        message: `${t("ORGANIZATION_SLUG")} ${t("IS_THE_SAME")}`,
      });

      return;
    }

    try {
      await updateOrganization({
        organizationId: organization.id,
        data: { slug },
      });

      await refetchOrganization?.();

      toast({
        variant: "success",
        message: `${t("ORGANIZATION_SLUG")} ${t("UPDATED_SUCCESSFULLY")}`,
      });

      // If using slug-based paths, redirect to the new slug's settings route
      if (organizationOptions?.pathMode === "slug") {
        const basePath = organizationOptions.basePath;
        const settingsPath = organizationOptions.viewPaths.SETTINGS;
        replace(`${basePath}/${slug}/${settingsPath}`);
      }
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(updateOrganizationSlug)}>
        <SettingsCard
          className={className}
          classNames={classNames}
          description={t("ORGANIZATION_SLUG_DESCRIPTION")}
          instructions={t("ORGANIZATION_SLUG_INSTRUCTIONS")}
          isPending={isPending}
          title={t("ORGANIZATION_SLUG")}
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className={classNames?.input}
                        placeholder={t("ORGANIZATION_SLUG_PLACEHOLDER")}
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
