"use client"

import type { BetterFetchOption } from "@better-fetch/fetch"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
import { Checkbox } from "@raypx/ui/components/checkbox"
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
import { Link } from "@raypx/ui/components/link"
import { PasswordField } from "@raypx/ui/components/password-field"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useCaptcha } from "../../core/hooks/use-captcha"
import { useIsHydrated } from "../../core/hooks/use-hydrated"
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition"
import { buildAuthUrl } from "../../core/lib/url-utils"
import {
  cn,
  getLocalizedError,
  getPasswordSchema,
  isValidEmail,
} from "../../core/lib/utils"
import type { PasswordValidation } from "../../types"
import type { AuthFormClassNames } from "./auth-form"
import { Captcha } from "./captcha"

export interface SignInFormProps {
  className?: string
  classNames?: AuthFormClassNames
  isSubmitting?: boolean
  redirectTo?: string
  setIsSubmitting?: (isSubmitting: boolean) => void
  passwordValidation?: PasswordValidation
}

export function SignInForm({
  className,
  classNames,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignInFormProps) {
  const isHydrated = useIsHydrated()
  const t = useTranslations("auth")
  const { captchaRef, getCaptchaHeaders, resetCaptcha } = useCaptcha()

  const { authClient, basePath, credentials, viewPaths, navigate, toast } =
    useAuth()

  const rememberMeEnabled = credentials?.rememberMe
  const usernameEnabled = credentials?.username
  const contextPasswordValidation = credentials?.passwordValidation

  passwordValidation = { ...contextPasswordValidation, ...passwordValidation }

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  })

  const formSchema = z.object({
    email: usernameEnabled
      ? z.string().min(1, {
          message: t("FIELD_IS_REQUIRED", { field: t("USERNAME") }),
        })
      : z
          .email({
            message: `${t("EMAIL")} ${t("IS_INVALID")}`,
          })
          .min(1, {
            message: t("FIELD_IS_REQUIRED", { field: t("EMAIL") }),
          }),
    password: getPasswordSchema(passwordValidation, {
      PASSWORD_REQUIRED: t("PASSWORD_REQUIRED"),
      PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
      PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
      INVALID_PASSWORD: t("INVALID_PASSWORD"),
    }),
    rememberMe: z.boolean().optional(),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: !rememberMeEnabled,
    },
  })

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

  async function signIn({
    email,
    password,
    rememberMe,
  }: z.infer<typeof formSchema>) {
    try {
      let response: Record<string, unknown> = {}

      if (usernameEnabled && !isValidEmail(email)) {
        const fetchOptions: BetterFetchOption = {
          throw: true,
          headers: await getCaptchaHeaders("/sign-in/username"),
        }

        response = await authClient.signIn.username({
          username: email,
          password,
          rememberMe,
          fetchOptions,
        })
      } else {
        const fetchOptions: BetterFetchOption = {
          throw: true,
          headers: await getCaptchaHeaders("/sign-in/email"),
        }

        response = await authClient.signIn.email({
          email,
          password,
          rememberMe,
          fetchOptions,
        })
      }

      if (response.twoFactorRedirect) {
        navigate(`${basePath}/${viewPaths.TWO_FACTOR}${window.location.search}`)
      } else {
        await onSuccess()
      }
    } catch (error) {
      form.resetField("password")
      resetCaptcha()

      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(signIn)}
        noValidate={isHydrated}
        className={cn("grid w-full gap-6", className, classNames?.base)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>
                {usernameEnabled ? t("USERNAME") : t("EMAIL")}
              </FormLabel>

              <FormControl>
                <Input
                  autoComplete={usernameEnabled ? "username" : "email"}
                  className={classNames?.input}
                  type={usernameEnabled ? "text" : "email"}
                  placeholder={
                    usernameEnabled
                      ? t("SIGN_IN_USERNAME_PLACEHOLDER")
                      : t("EMAIL_PLACEHOLDER")
                  }
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className={classNames?.label}>
                  {t("PASSWORD")}
                </FormLabel>

                {credentials?.forgotPassword && (
                  <Link
                    className={cn(
                      "text-sm hover:underline",
                      classNames?.forgotPasswordLink,
                    )}
                    href={buildAuthUrl(
                      basePath,
                      viewPaths.FORGOT_PASSWORD,
                      isHydrated,
                    )}
                  >
                    {t("FORGOT_PASSWORD_LINK")}
                  </Link>
                )}
              </div>

              <FormControl>
                <PasswordField
                  autoComplete="current-password"
                  className={classNames?.input}
                  placeholder={t("PASSWORD_PLACEHOLDER")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        {rememberMeEnabled && (
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>

                <FormLabel>{t("REMEMBER_ME")}</FormLabel>
              </FormItem>
            )}
          />
        )}

        <Captcha ref={captchaRef} action="/sign-in/email" />

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
            t("SIGN_IN_ACTION")
          )}
        </Button>
      </form>
    </Form>
  )
}
