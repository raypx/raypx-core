"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form"
import { Loader2 } from "@raypx/ui/components/icons"
import { Input } from "@raypx/ui/components/input"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import type { ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import { OrganizationCellView } from "./organization-cell-view"

export interface DeleteOrganizationDialogProps
  extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames
  organization: Organization
}

export function DeleteOrganizationDialog({
  classNames,
  onOpenChange,
  organization,
  ...props
}: DeleteOrganizationDialogProps) {
  const {
    authClient,
    account: accountOptions,
    hooks: { useListOrganizations },
    t,
    navigate,
    toast,
  } = useAuth()

  const { refetch: refetchOrganizations } = useListOrganizations()

  const formSchema = z.object({
    slug: z
      .string()
      .min(1, { message: t("SLUG_REQUIRED") })
      .refine((val) => val === organization.slug, {
        message: t("SLUG_DOES_NOT_MATCH"),
      }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  })

  const { isSubmitting } = form.formState

  const deleteOrganization = async () => {
    try {
      await authClient.organization.delete({
        organizationId: organization.id,
        fetchOptions: { throw: true },
      })

      await refetchOrganizations?.()

      toast({
        variant: "success",
        message: t("DELETE_ORGANIZATION_SUCCESS"),
      })

      navigate(
        `${accountOptions?.basePath}/${accountOptions?.viewPaths.ORGANIZATIONS}`,
      )

      onOpenChange?.(false)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("DELETE_ORGANIZATION")}
          </DialogTitle>

          <DialogDescription
            className={cn("text-xs md:text-sm", classNames?.description)}
          >
            {t("DELETE_ORGANIZATION_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row p-4", classNames?.cell)}>
          <OrganizationCellView organization={organization} />
        </Card>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(deleteOrganization)}
            className="grid gap-6"
          >
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={classNames?.label}>
                    {t("DELETE_ORGANIZATION_INSTRUCTIONS")}

                    <span className="font-bold">{organization.slug}</span>
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder={organization.slug}
                      className={classNames?.input}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className={classNames?.error} />
                </FormItem>
              )}
            />

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                type="button"
                variant="secondary"
                className={cn(classNames?.button, classNames?.secondaryButton)}
                onClick={() => onOpenChange?.(false)}
              >
                {t("CANCEL")}
              </Button>

              <Button
                className={cn(
                  classNames?.button,
                  classNames?.destructiveButton,
                )}
                disabled={isSubmitting}
                variant="destructive"
                type="submit"
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {t("DELETE_ORGANIZATION")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
