"use client";

import { Button } from "@raypx/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog";
import { CheckIcon, CopyIcon } from "@raypx/ui/components/icons";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { type ComponentProps, useState } from "react";
import { useAuth } from "../../core/hooks/use-auth";

interface BackupCodesDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  backupCodes: string[];
}

export function BackupCodesDialog({
  classNames,
  backupCodes,
  onOpenChange,
  ...props
}: BackupCodesDialogProps) {
  const { t } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codeText = backupCodes.join("\n");
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={classNames?.dialog?.content}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("BACKUP_CODES")}
          </DialogTitle>
          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {t("BACKUP_CODES_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="rounded-md bg-muted p-2 text-center font-mono text-sm">
              {code}
            </div>
          ))}
        </div>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={copied}
            className={cn(classNames?.button, classNames?.outlineButton)}
          >
            {copied ? (
              <>
                <CheckIcon className={classNames?.icon} />
                {t("COPIED_TO_CLIPBOARD")}
              </>
            ) : (
              <>
                <CopyIcon className={classNames?.icon} />
                {t("COPY_ALL_CODES")}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={() => onOpenChange?.(false)}
            className={cn(classNames?.button, classNames?.primaryButton)}
          >
            {t("CONTINUE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
