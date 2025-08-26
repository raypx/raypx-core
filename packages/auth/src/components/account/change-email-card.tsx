"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CardContent } from "@raypx/ui/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@raypx/ui/components/form"
import { Input } from "@raypx/ui/components/input"
import type { SettingsCardProps } from "@raypx/ui/components/settings"
import { SettingsCard } from "@raypx/ui/components/settings"
import { Skeleton } from "@raypx/ui/components/skeleton"
import { cn } from "@raypx/ui/lib/utils"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"

export function ChangeEmailCard({
  className,
  classNames,
  ...props
}: SettingsCardProps) {
  const {
    authClient,
    emailVerification,
    hooks: { useSession },
    toast,
    t,
  } = useAuth()

  const { data: sessionData, isPending, refetch } = useSession()
  const [resendDisabled, setResendDisabled] = useState(false)

  const formSchema = z.object({
    email: z
      .email({ message: t("INVALID_EMAIL") })
      .min(1, { message: t("EMAIL_REQUIRED") }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      email: sessionData?.user.email || "",
    },
  })

  const resendForm = useForm()

  const { isSubmitting } = form.formState

  const changeEmail = async ({ email }: z.infer<typeof formSchema>) => {
    if (email === sessionData?.user.email) {
      await new Promise((resolve) => setTimeout(resolve))
      toast({
        variant: "error",
        message: t("EMAIL_IS_THE_SAME"),
      })
      return
    }

    try {
      await authClient.changeEmail({
        newEmail: email,
        callbackURL: window.location.pathname,
        fetchOptions: { throw: true },
      })

      if (sessionData?.user.emailVerified) {
        toast({
          variant: "success",
          message: t("EMAIL_VERIFY_CHANGE"),
        })
      } else {
        await refetch?.()
        toast({
          variant: "success",
          message: `${t("EMAIL")} ${t("UPDATED_SUCCESSFULLY")}`,
        })
      }
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  const resendVerification = async () => {
    if (!sessionData) return
    const email = sessionData.user.email

    setResendDisabled(true)

    try {
      await authClient.sendVerificationEmail({
        email,
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("EMAIL_VERIFICATION"),
      })
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
      setResendDisabled(false)
      throw error
    }
  }

  return (
    <>
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(changeEmail)}>
          <SettingsCard
            className={className}
            classNames={classNames}
            description={t("EMAIL_DESCRIPTION")}
            instructions={t("EMAIL_INSTRUCTIONS")}
            isPending={isPending}
            title={t("EMAIL")}
            actionLabel={t("SAVE")}
            {...props}
          >
            <CardContent className={classNames?.content}>
              {isPending ? (
                <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
              ) : (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className={classNames?.input}
                          placeholder={t("EMAIL_PLACEHOLDER")}
                          type="email"
                          disabled={isSubmitting}
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

      {emailVerification &&
        sessionData?.user &&
        !sessionData?.user.emailVerified && (
          <Form {...resendForm}>
            <form onSubmit={resendForm.handleSubmit(resendVerification)}>
              <SettingsCard
                className={className}
                classNames={classNames}
                title={t("VERIFY_YOUR_EMAIL")}
                description={t("VERIFY_YOUR_EMAIL_DESCRIPTION")}
                actionLabel={t("RESEND_VERIFICATION_EMAIL")}
                disabled={resendDisabled}
                {...props}
              />
            </form>
          </Form>
        )}
    </>
  )
}
