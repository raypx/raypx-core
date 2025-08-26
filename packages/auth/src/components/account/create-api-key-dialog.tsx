"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@raypx/ui/components/select"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import type { ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useLang } from "../../core/hooks/use-lang"
import { getLocalizedError } from "../../core/lib/utils"
import type { Refetch } from "../../types"
import { OrganizationCellView } from "../organization/organization-cell-view"
import { PersonalAccountView } from "./personal-account-view"

interface CreateApiKeyDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames
  onSuccess: (key: string) => void
  refetch?: Refetch
  organizationId?: string
}

export function CreateApiKeyDialog({
  classNames,
  onSuccess,
  refetch,
  organizationId,
  onOpenChange,
  ...props
}: CreateApiKeyDialogProps) {
  const {
    authClient,
    apiKey,
    hooks: { useListOrganizations, useSession },
    t,
    organization: contextOrganization,
    toast,
  } = useAuth()

  const { lang } = useLang()

  let organizations: Organization[] | null | undefined
  if (contextOrganization) {
    const { data } = useListOrganizations()
    organizations = data
  }

  const { data: sessionData } = useSession()
  const user = sessionData?.user

  const showOrganizationSelect = contextOrganization?.apiKey

  const formSchema = z.object({
    name: z.string().min(1, t("FIELD_IS_REQUIRED", { field: t("NAME") })),
    expiresInDays: z.string().optional(),
    organizationId: showOrganizationSelect
      ? z.string().min(1, t("FIELD_IS_REQUIRED", { field: t("ORGANIZATION") }))
      : z.string().optional(),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      name: "",
      expiresInDays: "none",
      organizationId: organizationId ?? "personal",
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const expiresIn =
        values.expiresInDays && values.expiresInDays !== "none"
          ? Number.parseInt(values.expiresInDays, 10) * 60 * 60 * 24
          : undefined

      const selectedOrgId =
        values.organizationId === "personal" ? undefined : values.organizationId

      const metadata = {
        ...(typeof apiKey === "object" ? apiKey.metadata : {}),
        ...(contextOrganization && selectedOrgId
          ? { organizationId: selectedOrgId }
          : {}),
      }

      const result = await authClient.apiKey.create({
        name: values.name,
        expiresIn,
        prefix: typeof apiKey === "object" ? apiKey.prefix : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        fetchOptions: { throw: true },
      })

      await refetch?.()
      onSuccess(result.key)
      onOpenChange?.(false)
      form.reset()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  const rtf = new Intl.RelativeTimeFormat(lang ?? "en")

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={classNames?.dialog?.content}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("CREATE_API_KEY")}
          </DialogTitle>

          <DialogDescription
            className={cn("text-xs md:text-sm", classNames?.description)}
          >
            {t("CREATE_API_KEY_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {showOrganizationSelect && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={classNames?.label}>
                      {t("ORGANIZATION")}
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn("w-full p-2", classNames?.input)}
                        >
                          <SelectValue placeholder={t("ORGANIZATION")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="w-[--radix-select-trigger-width]">
                        <SelectItem value="personal" className="p-2">
                          <PersonalAccountView user={user} size="sm" />
                        </SelectItem>

                        {organizations?.map((org) => (
                          <SelectItem
                            key={org.id}
                            value={org.id}
                            className="p-2"
                          >
                            <OrganizationCellView
                              organization={org}
                              size="sm"
                            />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className={classNames?.label}>
                      {t("NAME")}
                    </FormLabel>

                    <FormControl>
                      <Input
                        className={classNames?.input}
                        placeholder={t("API_KEY_NAME_PLACEHOLDER")}
                        autoFocus
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={classNames?.label}>
                      {t("EXPIRES")}
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className={classNames?.input}>
                          <SelectValue placeholder={t("NO_EXPIRATION")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="none">
                          {t("NO_EXPIRATION")}
                        </SelectItem>

                        {[1, 7, 30, 60, 90, 180, 365].map((days) => (
                          <SelectItem key={days} value={days.toString()}>
                            {days === 365
                              ? rtf.format(1, "year")
                              : rtf.format(days, "day")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                className={cn(classNames?.button, classNames?.outlineButton)}
                disabled={isSubmitting}
              >
                {t("CANCEL")}
              </Button>

              <Button
                type="submit"
                variant="default"
                className={cn(classNames?.button, classNames?.primaryButton)}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {t("CREATE_API_KEY")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
