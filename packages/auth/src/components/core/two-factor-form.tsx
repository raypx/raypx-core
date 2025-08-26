"use client"

import type { BetterFetchError } from "@better-fetch/fetch"
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
import { Loader2, QrCode, Send } from "@raypx/ui/components/icons"
import { InputOTP } from "@raypx/ui/components/input-otp"
import { Label } from "@raypx/ui/components/label"
import { Link } from "@raypx/ui/components/link"
import { cn } from "@raypx/ui/lib/utils"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import QRCode from "react-qr-code"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useIsHydrated } from "../../core/hooks/use-hydrated"
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition"
import { buildAuthUrl } from "../../core/lib/url-utils"
import { getLocalizedError, getSearchParam } from "../../core/lib/utils"
import type { User } from "../../types"
import type { AuthFormClassNames } from "./auth-form"
import { OTPInputGroup } from "./otp-input-group"

export interface TwoFactorFormProps {
  className?: string
  classNames?: AuthFormClassNames
  isSubmitting?: boolean
  otpSeparators?: 0 | 1 | 2
  redirectTo?: string
  setIsSubmitting?: (value: boolean) => void
}

export function TwoFactorForm({
  className,
  classNames,
  isSubmitting,
  otpSeparators = 0,
  redirectTo,
  setIsSubmitting,
}: TwoFactorFormProps) {
  const isHydrated = useIsHydrated()
  const totpURI = isHydrated ? getSearchParam("totpURI") : null
  const initialSendRef = useRef(false)

  const {
    authClient,
    basePath,
    hooks: { useSession },
    t,
    twoFactor,
    viewPaths,
    toast,
  } = useAuth()

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  })

  const { data: sessionData } = useSession()
  const isTwoFactorEnabled = (sessionData?.user as User)?.twoFactorEnabled

  const [method, setMethod] = useState<"totp" | "otp" | null>(
    twoFactor?.length === 1 ? twoFactor[0] : null,
  )

  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const formSchema = z.object({
    code: z
      .string()
      .min(1, {
        message: t("FIELD_IS_REQUIRED", { field: t("ONE_TIME_PASSWORD") }),
      })
      .min(6, {
        message: `${t("ONE_TIME_PASSWORD")} ${t("IS_INVALID")}`,
      }),
    trustDevice: z.boolean().optional(),
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

  useEffect(() => {
    if (method === "otp" && cooldownSeconds <= 0 && !initialSendRef.current) {
      initialSendRef.current = true
      sendOtp()
    }
  }, [method])

  useEffect(() => {
    if (cooldownSeconds <= 0) return

    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [cooldownSeconds])

  const sendOtp = async () => {
    if (isSendingOtp || cooldownSeconds > 0) return

    try {
      setIsSendingOtp(true)
      await authClient.twoFactor.sendOtp({
        fetchOptions: { throw: true },
      })
      setCooldownSeconds(60)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      if (
        (error as BetterFetchError).error.code === "INVALID_TWO_FACTOR_COOKIE"
      ) {
        history.back()
      }
    }

    initialSendRef.current = false
    setIsSendingOtp(false)
  }

  async function verifyCode({ code, trustDevice }: z.infer<typeof formSchema>) {
    try {
      const verifyMethod =
        method === "totp"
          ? authClient.twoFactor.verifyTotp
          : authClient.twoFactor.verifyOtp

      await verifyMethod({
        code,
        trustDevice,
        fetchOptions: { throw: true },
      })

      await onSuccess()

      if (sessionData && !isTwoFactorEnabled) {
        toast({
          variant: "success",
          message: t("TWO_FACTOR_ENABLED"),
        })
      }
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
        {twoFactor?.includes("totp") && totpURI && method === "totp" && (
          <div className="space-y-3">
            <Label className={classNames?.label}>
              {t("TWO_FACTOR_TOTP_LABEL")}
            </Label>

            <QRCode
              className={cn("border shadow-xs", classNames?.qrCode)}
              value={totpURI}
            />
          </div>
        )}

        {method !== null && (
          <>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className={classNames?.label}>
                      {t("ONE_TIME_PASSWORD")}
                    </FormLabel>

                    <Link
                      className={cn(
                        "text-sm hover:underline",
                        classNames?.forgotPasswordLink,
                      )}
                      href={buildAuthUrl(
                        basePath,
                        viewPaths.RECOVER_ACCOUNT,
                        isHydrated,
                      )}
                    >
                      {t("FORGOT_AUTHENTICATOR")}
                    </Link>
                  </div>

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

            <FormField
              control={form.control}
              name="trustDevice"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className={classNames?.checkbox}
                    />
                  </FormControl>

                  <FormLabel className={classNames?.label}>
                    {t("TRUST_DEVICE")}
                  </FormLabel>
                </FormItem>
              )}
            />
          </>
        )}

        <div className="grid gap-4">
          {method !== null && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(classNames?.button, classNames?.primaryButton)}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {t("TWO_FACTOR_ACTION")}
            </Button>
          )}

          {method === "otp" && twoFactor?.includes("otp") && (
            <Button
              type="button"
              variant="outline"
              onClick={sendOtp}
              disabled={cooldownSeconds > 0 || isSendingOtp || isSubmitting}
              className={cn(classNames?.button, classNames?.outlineButton)}
            >
              {isSendingOtp ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className={classNames?.icon} />
              )}

              {t("RESEND_CODE")}
              {cooldownSeconds > 0 && ` (${cooldownSeconds})`}
            </Button>
          )}

          {method !== "otp" && twoFactor?.includes("otp") && (
            <Button
              type="button"
              variant="secondary"
              className={cn(classNames?.button, classNames?.secondaryButton)}
              onClick={() => setMethod("otp")}
              disabled={isSubmitting}
            >
              <Send className={classNames?.icon} />
              {t("SEND_VERIFICATION_CODE")}
            </Button>
          )}

          {method !== "totp" && twoFactor?.includes("totp") && (
            <Button
              type="button"
              variant="secondary"
              className={cn(classNames?.button, classNames?.secondaryButton)}
              onClick={() => setMethod("totp")}
              disabled={isSubmitting}
            >
              <QrCode className={classNames?.icon} />
              {t("CONTINUE_WITH_AUTHENTICATOR")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
