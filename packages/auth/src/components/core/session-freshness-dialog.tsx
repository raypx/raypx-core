import { Button } from "@raypx/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import type { ComponentProps } from "react";
import { useAuth } from "../../core/hooks/use-auth";

export interface SessionFreshnessDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  title?: string;
  description?: string;
}

export function SessionFreshnessDialog({
  classNames,
  title,
  description,
  onOpenChange,
  ...props
}: SessionFreshnessDialogProps) {
  const { basePath, t, viewPaths, navigate } = useAuth();

  const handleSignOut = () => {
    navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
    onOpenChange?.(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {title || t("SESSION_EXPIRED") || "Session Expired"}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {description || t("SESSION_NOT_FRESH")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="secondary"
            className={cn(classNames?.button, classNames?.secondaryButton)}
            onClick={() => onOpenChange?.(false)}
          >
            {t("CANCEL")}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.primaryButton)}
            variant="default"
            onClick={handleSignOut}
          >
            {t("SIGN_OUT")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
