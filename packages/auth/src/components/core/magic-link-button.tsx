import { Button } from "@raypx/ui/components/button";
import { LockIcon, MailIcon } from "@raypx/ui/components/icons";
import { cn } from "@raypx/ui/lib/utils";
import { useAuth } from "../../core/hooks/use-auth";
import type { AuthViewPath } from "../../core/lib/view-paths";
import type { AuthViewClassNames } from "./auth-view";

interface MagicLinkButtonProps {
  classNames?: AuthViewClassNames;
  isSubmitting?: boolean;
  view: AuthViewPath;
}

export function MagicLinkButton({ classNames, isSubmitting, view }: MagicLinkButtonProps) {
  const { viewPaths, navigate, basePath, credentials, t } = useAuth();

  return (
    <Button
      className={cn("w-full", classNames?.form?.button, classNames?.form?.secondaryButton)}
      disabled={isSubmitting}
      type="button"
      variant="secondary"
      onClick={() =>
        navigate(
          `${basePath}/${view === "MAGIC_LINK" || !credentials ? viewPaths.SIGN_IN : viewPaths.MAGIC_LINK}${window.location.search}`,
        )
      }
    >
      {view === "MAGIC_LINK" ? (
        <LockIcon className={classNames?.form?.icon} />
      ) : (
        <MailIcon className={classNames?.form?.icon} />
      )}
      {t("SIGN_IN_WITH")} {view === "MAGIC_LINK" ? t("PASSWORD") : t("MAGIC_LINK")}
    </Button>
  );
}
