import { Button } from "@raypx/ui/components/button"
import { LockIcon, MailIcon } from "@raypx/ui/components/icons"
import { cn } from "@raypx/ui/lib/utils"
import { useAuth } from "../../core/hooks/use-auth"
import type { AuthViewPath } from "../../core/lib/view-paths"
import type { AuthViewClassNames } from "./auth-view"

interface EmailOTPButtonProps {
  classNames?: AuthViewClassNames
  isSubmitting?: boolean
  view: AuthViewPath
}

export function EmailOTPButton({
  classNames,
  isSubmitting,
  view,
}: EmailOTPButtonProps) {
  const { viewPaths, navigate, basePath, t } = useAuth()

  return (
    <Button
      className={cn(
        "w-full",
        classNames?.form?.button,
        classNames?.form?.secondaryButton,
      )}
      disabled={isSubmitting}
      type="button"
      variant="secondary"
      onClick={() =>
        navigate(
          `${basePath}/${view === "EMAIL_OTP" ? viewPaths.SIGN_IN : viewPaths.EMAIL_OTP}${window.location.search}`,
        )
      }
    >
      {view === "EMAIL_OTP" ? (
        <LockIcon className={classNames?.form?.icon} />
      ) : (
        <MailIcon className={classNames?.form?.icon} />
      )}
      {t("SIGN_IN_WITH")}{" "}
      {view === "EMAIL_OTP" ? t("PASSWORD") : t("EMAIL_OTP")}
    </Button>
  )
}
