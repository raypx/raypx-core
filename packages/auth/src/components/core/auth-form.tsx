"use client"

import { useEffect } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { buildAuthUrl } from "../../core/lib/url-utils"
import { getViewByPath } from "../../core/lib/utils"
import type { AuthViewPath } from "../../core/lib/view-paths"
import { SignOut } from "../account/sign-out"
import { AuthCallback } from "./auth-callback"
import { EmailOTPForm } from "./email-otp-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { MagicLinkForm } from "./magic-link-form"
import { RecoverAccountForm } from "./recover-account-form"
import { ResetPasswordForm } from "./reset-password-form"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"
import { TwoFactorForm } from "./two-factor-form"

export type AuthFormClassNames = {
  base?: string
  button?: string
  checkbox?: string
  description?: string
  error?: string
  forgotPasswordLink?: string
  icon?: string
  input?: string
  label?: string
  otpInput?: string
  otpInputContainer?: string
  outlineButton?: string
  primaryButton?: string
  providerButton?: string
  qrCode?: string
  secondaryButton?: string
}

export interface AuthFormProps {
  className?: string
  classNames?: AuthFormClassNames
  callbackURL?: string
  isSubmitting?: boolean
  pathname?: string
  redirectTo?: string
  view?: AuthViewPath
  otpSeparators?: 0 | 1 | 2
  setIsSubmitting?: (isSubmitting: boolean) => void
}

export function AuthForm({
  className,
  classNames,
  callbackURL,
  isSubmitting,
  pathname,
  redirectTo,
  view,
  otpSeparators = 0,
  setIsSubmitting,
}: AuthFormProps) {
  const {
    basePath,
    credentials,
    magicLink,
    emailOTP,
    signUp,
    twoFactor: twoFactorEnabled,
    viewPaths,
    replace,
  } = useAuth()

  const signUpEnabled = !!signUp

  useEffect(() => {
    if (pathname && !getViewByPath(viewPaths, pathname)) {
      console.error(`Invalid auth view: ${pathname}`)
      replace(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`)
    }
  }, [pathname, viewPaths, basePath, replace])

  view =
    view || (getViewByPath(viewPaths, pathname) as AuthViewPath) || "SIGN_IN"

  // Redirect to appropriate view based on enabled features
  useEffect(() => {
    let isInvalidView = false

    if (view === "MAGIC_LINK" && (!magicLink || (!credentials && !emailOTP))) {
      isInvalidView = true
    }

    if (view === "EMAIL_OTP" && (!emailOTP || (!credentials && !magicLink))) {
      isInvalidView = true
    }

    if (view === "SIGN_UP" && !signUpEnabled) {
      isInvalidView = true
    }

    if (
      !credentials &&
      view &&
      [
        "SIGN_UP",
        "FORGOT_PASSWORD",
        "RESET_PASSWORD",
        "TWO_FACTOR",
        "RECOVER_ACCOUNT",
      ].includes(view)
    ) {
      isInvalidView = true
    }

    if (
      view &&
      ["TWO_FACTOR", "RECOVER_ACCOUNT"].includes(view) &&
      !twoFactorEnabled
    ) {
      isInvalidView = true
    }

    if (isInvalidView) {
      replace(buildAuthUrl(basePath, viewPaths.SIGN_IN, true))
    }
  }, [
    basePath,
    view,
    viewPaths,
    credentials,
    replace,
    emailOTP,
    signUpEnabled,
    magicLink,
    twoFactorEnabled,
  ])

  if (view === "SIGN_OUT") return <SignOut />
  if (view === "CALLBACK") return <AuthCallback redirectTo={redirectTo} />

  if (view === "SIGN_IN") {
    return credentials ? (
      <SignInForm
        className={className}
        classNames={classNames}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    ) : magicLink ? (
      <MagicLinkForm
        className={className}
        classNames={classNames}
        callbackURL={callbackURL}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    ) : emailOTP ? (
      <EmailOTPForm
        className={className}
        classNames={classNames}
        callbackURL={callbackURL}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    ) : null
  }

  if (view === "TWO_FACTOR") {
    return (
      <TwoFactorForm
        className={className}
        classNames={classNames}
        otpSeparators={otpSeparators}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    )
  }

  if (view === "RECOVER_ACCOUNT") {
    return (
      <RecoverAccountForm
        className={className}
        classNames={classNames}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    )
  }

  if (view === "MAGIC_LINK") {
    return (
      <MagicLinkForm
        className={className}
        classNames={classNames}
        callbackURL={callbackURL}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    )
  }

  if (view === "EMAIL_OTP") {
    return (
      <EmailOTPForm
        className={className}
        classNames={classNames}
        callbackURL={callbackURL}
        redirectTo={redirectTo}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    )
  }

  if (view === "FORGOT_PASSWORD") {
    return (
      <ForgotPasswordForm
        className={className}
        classNames={classNames}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    )
  }

  if (view === "RESET_PASSWORD") {
    return <ResetPasswordForm className={className} classNames={classNames} />
  }

  if (view === "SIGN_UP") {
    return (
      signUpEnabled && (
        <SignUpForm
          className={className}
          classNames={classNames}
          callbackURL={callbackURL}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      )
    )
  }
}
