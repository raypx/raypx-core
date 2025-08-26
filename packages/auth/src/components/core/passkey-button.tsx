import { Button } from "@raypx/ui/components/button"
import { FingerprintIcon } from "@raypx/ui/components/icons"
import { cn } from "@raypx/ui/lib/utils"
import { useAuth } from "../../core/hooks/use-auth"
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition"
import { getLocalizedError } from "../../core/lib/utils"
import type { AuthViewClassNames } from "./auth-view"

interface PasskeyButtonProps {
  classNames?: AuthViewClassNames
  isSubmitting?: boolean
  redirectTo?: string
  setIsSubmitting?: (isSubmitting: boolean) => void
}

export function PasskeyButton({
  classNames,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
}: PasskeyButtonProps) {
  const { authClient, t, toast } = useAuth()

  const { onSuccess } = useOnSuccessTransition({ redirectTo })

  const signInPassKey = async () => {
    setIsSubmitting?.(true)

    try {
      const response = await authClient.signIn.passkey({
        fetchOptions: { throw: true },
      })

      if (response?.error) {
        toast({
          variant: "error",
          message: getLocalizedError({
            error: response.error,
            t,
          }),
        })

        setIsSubmitting?.(false)
      } else {
        onSuccess()
      }
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      setIsSubmitting?.(false)
    }
  }

  return (
    <Button
      className={cn(
        "w-full",
        classNames?.form?.button,
        classNames?.form?.secondaryButton,
      )}
      disabled={isSubmitting}
      formNoValidate
      name="passkey"
      value="true"
      variant="secondary"
      onClick={signInPassKey}
    >
      <FingerprintIcon />
      {t("SIGN_IN_WITH")} {t("PASSKEY")}
    </Button>
  )
}
