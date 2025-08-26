import { Button } from "@raypx/ui/components/button"
import { cn } from "@raypx/ui/lib/utils"
import type { SocialProvider } from "better-auth/social-providers"
import { useCallback } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import type { Provider } from "../../core/lib/providers/social-providers"
import { getLocalizedError, getSearchParam } from "../../core/lib/utils"
import type { AuthViewClassNames } from "./auth-view"

interface ProviderButtonProps {
  className?: string
  classNames?: AuthViewClassNames
  callbackURL?: string
  isSubmitting: boolean
  other?: boolean
  provider: Provider
  redirectTo?: string
  socialLayout: "auto" | "horizontal" | "grid" | "vertical"
  setIsSubmitting: (isSubmitting: boolean) => void
}

export function ProviderButton({
  className,
  classNames,
  callbackURL: callbackURLProp,
  isSubmitting,
  other,
  provider,
  redirectTo: redirectToProp,
  socialLayout,
  setIsSubmitting,
}: ProviderButtonProps) {
  const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    redirectTo: contextRedirectTo,
    viewPaths,
    social,
    genericOAuth,
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

  const doSignInSocial = async () => {
    setIsSubmitting(true)

    try {
      if (other) {
        const oauth2Params = {
          providerId: provider.provider,
          callbackURL: getCallbackURL(),
          fetchOptions: { throw: true },
        }

        if (genericOAuth?.signIn) {
          await genericOAuth.signIn(oauth2Params)

          setTimeout(() => {
            setIsSubmitting(false)
          }, 10000)
        } else {
          await authClient.signIn.oauth2(oauth2Params)
        }
      } else {
        const socialParams = {
          provider: provider.provider as SocialProvider,
          callbackURL: getCallbackURL(),
          fetchOptions: { throw: true },
        }

        if (social?.signIn) {
          await social.signIn(socialParams)

          setTimeout(() => {
            setIsSubmitting(false)
          }, 10000)
        } else {
          await authClient.signIn.social(socialParams)
        }
      }
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      setIsSubmitting(false)
    }
  }

  return (
    <Button
      className={cn(
        socialLayout === "vertical" ? "w-full" : "grow",
        className,
        classNames?.form?.button,
        classNames?.form?.outlineButton,
        classNames?.form?.providerButton,
      )}
      disabled={isSubmitting}
      variant="outline"
      onClick={doSignInSocial}
    >
      {provider.icon && <provider.icon className={classNames?.form?.icon} />}

      {socialLayout === "grid" && provider.name}
      {socialLayout === "vertical" && `${t("SIGN_IN_WITH")} ${provider.name}`}
    </Button>
  )
}
