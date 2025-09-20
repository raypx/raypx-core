import { cn } from "@raypx/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useAuth } from "../../core/hooks/use-auth";
import { useIsHydrated } from "../../core/hooks/use-hydrated";

export interface RecaptchaBadgeProps {
  className?: string;
}

export function RecaptchaBadge({ className }: RecaptchaBadgeProps) {
  const isHydrated = useIsHydrated();
  const { captcha } = useAuth();
  const t = useTranslations("auth");

  if (!captcha) return null;

  if (!captcha.hideBadge) {
    return isHydrated ? (
      <style>{`
                .grecaptcha-badge { visibility: visible !important; }
            `}</style>
    ) : null;
  }

  return (
    <>
      <style>{`
                .grecaptcha-badge { visibility: hidden; }
            `}</style>

      <p className={cn("text-muted-foreground text-xs", className)}>
        {t("PROTECTED_BY_RECAPTCHA")} {t("BY_CONTINUING_YOU_AGREE")} Google{" "}
        <a
          className="text-foreground hover:underline"
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          {t("PRIVACY_POLICY")}
        </a>{" "}
        &{" "}
        <a
          className="text-foreground hover:underline"
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noreferrer"
        >
          {t("TERMS_OF_SERVICE")}
        </a>
        .
      </p>
    </>
  );
}
