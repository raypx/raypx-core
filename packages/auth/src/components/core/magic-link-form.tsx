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
import { cn } from "@raypx/ui/lib/utils"
import type { BetterFetchOption } from "better-auth/react"
import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useCaptcha } from "../../core/hooks/use-captcha"
import { useIsHydrated } from "../../core/hooks/use-hydrated"
import { getLocalizedError, getSearchParam } from "../../core/lib/utils"
import type { AuthFormClassNames } from "./auth-form"
import { Captcha } from "./captcha"

export interface MagicLinkFormProps {
  className?: string
  classNames?: AuthFormClassNames
  callbackURL?: string
  isSubmitting?: boolean
  redirectTo?: string
  setIsSubmitting?: (value: boolean) => void
}

export function MagicLinkForm({
  className,
  classNames,
  callbackURL: callbackURLProp,
  isSubmitting,
  redirectTo: redirectToProp,
  setIsSubmitting,
}: MagicLinkFormProps) {
  const isHydrated = useIsHydrated()
  const { captchaRef, getCaptchaHeaders, resetCaptcha } = useCaptcha()

  const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    redirectTo: contextRedirectTo,
    viewPaths,
    toast,
    t,
  } = useAuth()

  const getRedirectTo = useCallback(
    () => redirectToProp || getSearchParam("redirectTo") || contextRedirectTo,
    [redirectToProp, contextRedirectTo],
  )

  const getCallbackURL = useCallback(
    () =>
      `${baseURL}${
        callbackURLProp ||
        (persistClient
          ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo()}`
          : getRedirectTo())
      }`,
    [
      callbackURLProp,
      persistClient,
      basePath,
      viewPaths,
      baseURL,
      getRedirectTo,
    ],
  )

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

  async function sendMagicLink({ email }: z.infer<typeof formSchema>) {
    try {
      const fetchOptions: BetterFetchOption = {
        throw: true,
        headers: await getCaptchaHeaders("/sign-in/magic-link"),
      }

      await authClient.signIn.magicLink({
        email,
        callbackURL: getCallbackURL(),
        fetchOptions,
      })

      toast({
        variant: "success",
        message: t("MAGIC_LINK_EMAIL"),
      })

      form.reset()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
      resetCaptcha()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(sendMagicLink)}
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

        <Captcha ref={captchaRef} action="/sign-in/magic-link" />

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
            t("MAGIC_LINK_ACTION")
          )}
        </Button>
      </form>
    </Form>
  )
}
