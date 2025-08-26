"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
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
import { InputOTP } from "@raypx/ui/components/input-otp"
import { cn } from "@raypx/ui/lib/utils"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useIsHydrated } from "../../core/hooks/use-hydrated"
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition"
import { getLocalizedError } from "../../core/lib/utils"
import type { AuthFormClassNames } from "./auth-form"
import { OTPInputGroup } from "./otp-input-group"

export interface EmailOTPFormProps {
  className?: string
  classNames?: AuthFormClassNames
  callbackURL?: string
  isSubmitting?: boolean
  otpSeparators?: 0 | 1 | 2
  redirectTo?: string
  setIsSubmitting?: (value: boolean) => void
}

export function EmailOTPForm(props: EmailOTPFormProps) {
  const [email, setEmail] = useState<string | undefined>()

  if (!email) {
    return <EmailForm {...props} setEmail={setEmail} />
  }

  return <OTPForm {...props} email={email} />
}

function EmailForm({
  className,
  classNames,
  isSubmitting,
  setIsSubmitting,
  setEmail,
}: EmailOTPFormProps & {
  setEmail: (email: string) => void
}) {
  const isHydrated = useIsHydrated()

  const { authClient, t, toast } = useAuth()

  const formSchema = z.object({
    email: z
      .email({
        message: `${t("EMAIL")} ${t("IS_INVALID")}`,
      })
      .min(1, {
        message: t("FIELD_IS_REQUIRED", { field: t("EMAIL") }),
      }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  isSubmitting = isSubmitting || form.formState.isSubmitting

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting)
  }, [form.formState.isSubmitting, setIsSubmitting])

  async function sendEmailOTP({ email }: z.infer<typeof formSchema>) {
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: { throw: true },
      })

      toast({
        variant: "success",
        message: t("EMAIL_OTP_VERIFICATION_SENT"),
      })

      setEmail(email)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(sendEmailOTP)}
        noValidate={isHydrated}
        className={cn("grid w-full gap-6", className, classNames?.base)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>{t("EMAIL")}</FormLabel>

              <FormControl>
                <Input
                  className={classNames?.input}
                  type="email"
                  placeholder={t("EMAIL_PLACEHOLDER")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full",
            classNames?.button,
            classNames?.primaryButton,
          )}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("EMAIL_OTP_SEND_ACTION")
          )}
        </Button>
      </form>
    </Form>
  )
}

export function OTPForm({
  className,
  classNames,
  isSubmitting,
  otpSeparators = 0,
  redirectTo,
  setIsSubmitting,
  email,
}: EmailOTPFormProps & {
  email: string
}) {
  const { authClient, t, toast } = useAuth()

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  })

  const formSchema = z.object({
    code: z
      .string()
      .min(1, {
        message: t("FIELD_IS_REQUIRED", { field: t("EMAIL_OTP") }),
      })
      .min(6, {
        message: `${t("EMAIL_OTP")} ${t("IS_INVALID")}`,
      }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

  async function verifyCode({ code }: z.infer<typeof formSchema>) {
    try {
      await authClient.signIn.emailOtp({
        email,
        otp: code,
        fetchOptions: { throw: true },
      })

      await onSuccess()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      form.reset()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(verifyCode)}
        className={cn("grid w-full gap-6", className, classNames?.base)}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>
                {t("EMAIL_OTP")}
              </FormLabel>

              <FormControl>
                <InputOTP
                  {...field}
                  maxLength={6}
                  onChange={(value) => {
                    field.onChange(value)

                    if (value.length === 6) {
                      form.handleSubmit(verifyCode)()
                    }
                  }}
                  containerClassName={classNames?.otpInputContainer}
                  className={classNames?.otpInput}
                  disabled={isSubmitting}
                >
                  <OTPInputGroup otpSeparators={otpSeparators} />
                </InputOTP>
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        <div className="grid gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(classNames?.button, classNames?.primaryButton)}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {t("EMAIL_OTP_VERIFY_ACTION")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
