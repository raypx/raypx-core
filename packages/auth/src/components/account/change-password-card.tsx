"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CardContent } from "@raypx/ui/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form"
import { PasswordField } from "@raypx/ui/components/password-field"
import {
  SettingsCard,
  type SettingsCardClassNames,
} from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError, getPasswordSchema } from "../../core/lib/utils"
import type { PasswordValidation } from "../../types"
import { InputFieldSkeleton } from "./input-field-skeleton"

export interface ChangePasswordCardProps {
  className?: string
  classNames?: SettingsCardClassNames
  accounts?: { provider: string }[] | null
  isPending?: boolean
  skipHook?: boolean
  passwordValidation?: PasswordValidation
}

export function ChangePasswordCard({
  className,
  classNames,
  accounts,
  isPending,
  skipHook,
  passwordValidation,
}: ChangePasswordCardProps) {
  const {
    authClient,
    basePath,
    baseURL,
    credentials,
    hooks: { useSession, useListAccounts },
    t,
    viewPaths,
    toast,
  } = useAuth()

  const confirmPasswordEnabled = credentials?.confirmPassword
  const contextPasswordValidation = credentials?.passwordValidation

  passwordValidation = { ...contextPasswordValidation, ...passwordValidation }

  const { data: sessionData } = useSession()

  if (!skipHook) {
    const result = useListAccounts()
    accounts = result.data
    isPending = result.isPending
  }

  const formSchema = z
    .object({
      currentPassword: getPasswordSchema(passwordValidation, {
        PASSWORD_REQUIRED: t("PASSWORD_REQUIRED"),
        PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
        PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
        INVALID_PASSWORD: t("INVALID_PASSWORD"),
      }),
      newPassword: getPasswordSchema(passwordValidation, {
        PASSWORD_REQUIRED: t("NEW_PASSWORD_REQUIRED"),
        PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
        PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
        INVALID_PASSWORD: t("INVALID_PASSWORD"),
      }),
      confirmPassword: confirmPasswordEnabled
        ? getPasswordSchema(passwordValidation, {
            PASSWORD_REQUIRED: t("CONFIRM_PASSWORD_REQUIRED"),
            PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
            PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
            INVALID_PASSWORD: t("INVALID_PASSWORD"),
          })
        : z.string().optional(),
    })
    .refine(
      (data) =>
        !confirmPasswordEnabled || data.newPassword === data.confirmPassword,
      {
        message: t("PASSWORDS_DO_NOT_MATCH"),
        path: ["confirmPassword"],
      },
    )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const setPasswordForm = useForm()

  const { isSubmitting } = form.formState

  const setPassword = async () => {
    if (!sessionData) return
    const email = sessionData?.user.email

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${baseURL}${basePath}/${viewPaths.RESET_PASSWORD}`,
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("FORGOT_PASSWORD_EMAIL"),
      })
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  const changePassword = async ({
    currentPassword,
    newPassword,
  }: z.infer<typeof formSchema>) => {
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("CHANGE_PASSWORD_SUCCESS"),
      })
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    form.reset()
  }

  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === "credential",
  )

  if (!isPending && !credentialsLinked) {
    return (
      <Form {...setPasswordForm}>
        <form onSubmit={setPasswordForm.handleSubmit(setPassword)}>
          <SettingsCard
            title={t("SET_PASSWORD")}
            description={t("SET_PASSWORD_DESCRIPTION")}
            actionLabel={t("SET_PASSWORD")}
            isPending={isPending}
            className={className}
            classNames={classNames}
          />
        </form>
      </Form>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(changePassword)}>
        <SettingsCard
          className={className}
          classNames={classNames}
          actionLabel={t("SAVE")}
          description={t("CHANGE_PASSWORD_DESCRIPTION")}
          instructions={t("CHANGE_PASSWORD_INSTRUCTIONS")}
          isPending={isPending}
          title={t("CHANGE_PASSWORD")}
        >
          <CardContent className={cn("grid gap-6", classNames?.content)}>
            {isPending || !accounts ? (
              <>
                <InputFieldSkeleton classNames={classNames} />
                <InputFieldSkeleton classNames={classNames} />

                {confirmPasswordEnabled && (
                  <InputFieldSkeleton classNames={classNames} />
                )}
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={classNames?.label}>
                        {t("CURRENT_PASSWORD")}
                      </FormLabel>

                      <FormControl>
                        <PasswordField
                          className={classNames?.input}
                          autoComplete="current-password"
                          placeholder={t("CURRENT_PASSWORD_PLACEHOLDER")}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>

                      <FormMessage className={classNames?.error} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={classNames?.label}>
                        {t("NEW_PASSWORD")}
                      </FormLabel>

                      <FormControl>
                        <PasswordField
                          className={classNames?.input}
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          placeholder={t("NEW_PASSWORD_PLACEHOLDER")}
                          {...field}
                        />
                      </FormControl>

                      <FormMessage className={classNames?.error} />
                    </FormItem>
                  )}
                />

                {confirmPasswordEnabled && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={classNames?.label}>
                          {t("CONFIRM_PASSWORD")}
                        </FormLabel>

                        <FormControl>
                          <PasswordField
                            className={classNames?.input}
                            autoComplete="new-password"
                            placeholder={t("CONFIRM_PASSWORD_PLACEHOLDER")}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage className={classNames?.error} />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </CardContent>
        </SettingsCard>
      </form>
    </Form>
  )
}
