"use client"

import { Button } from "@raypx/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
import { ArrowLeft } from "@raypx/ui/components/icons"
import { Link } from "@raypx/ui/components/link"
import { Separator } from "@raypx/ui/components/separator"
import { cn } from "@raypx/ui/lib/utils"
import { type ReactNode, useEffect, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useIsHydrated } from "../../core/hooks/use-hydrated"
import { socialProviders } from "../../core/lib/providers/social-providers"
import { buildAuthUrl } from "../../core/lib/url-utils"
import { getViewByPath } from "../../core/lib/utils"
import type { AuthViewPaths } from "../../core/lib/view-paths"
import { SignOut } from "../account/sign-out"
import { ProviderButton } from "../core/provider-button"
import { AcceptInvitationCard } from "../organization/accept-invitation-card"
import { AuthCallback } from "./auth-callback"
import { AuthForm, type AuthFormClassNames } from "./auth-form"
import { EmailOTPButton } from "./email-otp-button"
import { MagicLinkButton } from "./magic-link-button"
import { OneTap } from "./one-tap"
import { PasskeyButton } from "./passkey-button"

export type AuthViewClassNames = {
  base?: string
  content?: string
  description?: string
  footer?: string
  footerLink?: string
  continueWith?: string
  form?: AuthFormClassNames
  header?: string
  separator?: string
  title?: string
}

export function AuthView({
  className,
  classNames,
  callbackURL,
  cardHeader,
  pathname,
  redirectTo,
  socialLayout: socialLayoutProp = "auto",
  view: viewProp,
  otpSeparators = 0,
  path: pathProp,
}: {
  className?: string
  classNames?: AuthViewClassNames
  callbackURL?: string
  cardHeader?: ReactNode
  pathname?: string
  redirectTo?: string
  socialLayout?: "auto" | "horizontal" | "grid" | "vertical"
  view?: keyof AuthViewPaths
  path?: string
  otpSeparators?: 0 | 1 | 2
}) {
  const isHydrated = useIsHydrated()
  const {
    basePath,
    credentials,
    t,
    magicLink,
    emailOTP,
    oneTap,
    passkey,
    signUp,
    social,
    genericOAuth,
    viewPaths,
  } = useAuth()

  let socialLayout = socialLayoutProp
  if (socialLayout === "auto") {
    socialLayout = !credentials
      ? "vertical"
      : social?.providers && social.providers.length > 2
        ? "horizontal"
        : "vertical"
  }

  const path = pathProp ?? pathname?.split("/").pop()

  const view = viewProp || getViewByPath(viewPaths, path) || "SIGN_IN"

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handlePageHide = () => setIsSubmitting(false)
    window.addEventListener("pagehide", handlePageHide)
    return () => {
      setIsSubmitting(false)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [])

  if (view === "CALLBACK") return <AuthCallback redirectTo={redirectTo} />
  if (view === "SIGN_OUT") return <SignOut />
  if (view === "ACCEPT_INVITATION") return <AcceptInvitationCard />

  const description =
    !credentials && !magicLink && !emailOTP
      ? t("DISABLED_CREDENTIALS_DESCRIPTION")
      : t(`${view}_DESCRIPTION`)

  return (
    <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
      <CardHeader className={classNames?.header}>
        {cardHeader ? (
          cardHeader
        ) : (
          <>
            <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
              {t(view)}
            </CardTitle>
            {description && (
              <CardDescription
                className={cn("text-xs md:text-sm", classNames?.description)}
              >
                {description}
              </CardDescription>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className={cn("grid gap-6", classNames?.content)}>
        {oneTap &&
          ["SIGN_IN", "SIGN_UP", "MAGIC_LINK", "EMAIL_OTP"].includes(
            view as string,
          ) && <OneTap redirectTo={redirectTo} />}

        {(credentials || magicLink || emailOTP) && (
          <div className="grid gap-4">
            <AuthForm
              classNames={classNames?.form}
              callbackURL={callbackURL}
              isSubmitting={isSubmitting}
              otpSeparators={otpSeparators}
              redirectTo={redirectTo}
              setIsSubmitting={setIsSubmitting}
              view={view}
            />

            {magicLink &&
              ((credentials &&
                [
                  "FORGOT_PASSWORD",
                  "SIGN_UP",
                  "SIGN_IN",
                  "MAGIC_LINK",
                  "EMAIL_OTP",
                ].includes(view as string)) ||
                (emailOTP && view === "EMAIL_OTP")) && (
                <MagicLinkButton
                  classNames={classNames}
                  view={view}
                  isSubmitting={isSubmitting}
                />
              )}

            {emailOTP &&
              ((credentials &&
                [
                  "FORGOT_PASSWORD",
                  "SIGN_UP",
                  "SIGN_IN",
                  "MAGIC_LINK",
                  "EMAIL_OTP",
                ].includes(view as string)) ||
                (magicLink && ["SIGN_IN", "MAGIC_LINK"].includes(view))) && (
                <EmailOTPButton
                  classNames={classNames}
                  view={view}
                  isSubmitting={isSubmitting}
                />
              )}
          </div>
        )}

        {view !== "RESET_PASSWORD" &&
          (social?.providers?.length ||
            genericOAuth?.providers?.length ||
            (view === "SIGN_IN" && passkey)) && (
            <>
              {(credentials || magicLink || emailOTP) && (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    classNames?.continueWith,
                  )}
                >
                  <Separator
                    className={cn("!w-auto grow", classNames?.separator)}
                  />
                  <span className="flex-shrink-0 text-muted-foreground text-sm">
                    {t("OR_CONTINUE_WITH")}
                  </span>
                  <Separator
                    className={cn("!w-auto grow", classNames?.separator)}
                  />
                </div>
              )}

              <div className="grid gap-4">
                {(social?.providers?.length ||
                  genericOAuth?.providers?.length) && (
                  <div
                    className={cn(
                      "flex w-full items-center justify-between gap-4",
                      socialLayout === "horizontal" && "flex-wrap",
                      socialLayout === "vertical" && "flex-col",
                      socialLayout === "grid" && "grid grid-cols-2",
                    )}
                  >
                    {social?.providers?.map((provider) => {
                      const socialProvider = socialProviders.find(
                        (socialProvider) =>
                          socialProvider.provider === provider,
                      )
                      if (!socialProvider) return null
                      return (
                        <ProviderButton
                          key={provider}
                          classNames={classNames}
                          callbackURL={callbackURL}
                          isSubmitting={isSubmitting}
                          provider={socialProvider}
                          redirectTo={redirectTo}
                          setIsSubmitting={setIsSubmitting}
                          socialLayout={socialLayout}
                        />
                      )
                    })}
                    {genericOAuth?.providers?.map((provider) => (
                      <ProviderButton
                        key={provider.provider}
                        classNames={classNames}
                        callbackURL={callbackURL}
                        isSubmitting={isSubmitting}
                        provider={provider}
                        redirectTo={redirectTo}
                        setIsSubmitting={setIsSubmitting}
                        socialLayout={socialLayout}
                        other
                      />
                    ))}
                  </div>
                )}

                {passkey &&
                  [
                    "SIGN_IN",
                    "MAGIC_LINK",
                    "EMAIL_OTP",
                    "RECOVER_ACCOUNT",
                    "TWO_FACTOR",
                    "FORGOT_PASSWORD",
                  ].includes(view as string) && (
                    <PasskeyButton
                      classNames={classNames}
                      isSubmitting={isSubmitting}
                      redirectTo={redirectTo}
                      setIsSubmitting={setIsSubmitting}
                    />
                  )}
              </div>
            </>
          )}
      </CardContent>

      {credentials && signUp && (
        <CardFooter
          className={cn(
            "justify-center gap-1.5 text-muted-foreground text-sm",
            classNames?.footer,
          )}
        >
          {view === "SIGN_IN" ||
          view === "MAGIC_LINK" ||
          view === "EMAIL_OTP" ? (
            t("DONT_HAVE_AN_ACCOUNT")
          ) : view === "SIGN_UP" ? (
            t("ALREADY_HAVE_AN_ACCOUNT")
          ) : (
            <ArrowLeft className="size-3" />
          )}

          {view === "SIGN_IN" ||
          view === "MAGIC_LINK" ||
          view === "EMAIL_OTP" ||
          view === "SIGN_UP" ? (
            <Link
              className={cn(
                "text-foreground underline",
                classNames?.footerLink,
              )}
              href={buildAuthUrl(
                basePath,
                viewPaths[
                  view === "SIGN_IN" ||
                  view === "MAGIC_LINK" ||
                  view === "EMAIL_OTP"
                    ? "SIGN_UP"
                    : "SIGN_IN"
                ],
                isHydrated,
              )}
            >
              <Button
                variant="link"
                size="sm"
                className={cn(
                  "px-0 text-foreground underline",
                  classNames?.footerLink,
                )}
              >
                {view === "SIGN_IN" ||
                view === "MAGIC_LINK" ||
                view === "EMAIL_OTP"
                  ? t("SIGN_UP")
                  : t("SIGN_IN")}
              </Button>
            </Link>
          ) : (
            <Button
              variant="link"
              size="sm"
              className={cn(
                "px-0 text-foreground underline",
                classNames?.footerLink,
              )}
              onClick={() => window.history.back()}
            >
              {t("GO_BACK")}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
