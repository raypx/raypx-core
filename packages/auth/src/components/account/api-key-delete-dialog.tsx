"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog"
import { KeyRoundIcon, Loader2 } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { type ComponentProps, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useLang } from "../../core/hooks/use-lang"
import { getLocalizedError } from "../../core/lib/utils"
import type { ApiKey, Refetch } from "../../types"

interface ApiKeyDeleteDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames
  apiKey: ApiKey
  refetch?: Refetch
}

export function ApiKeyDeleteDialog({
  classNames,
  apiKey,
  refetch,
  onOpenChange,
  ...props
}: ApiKeyDeleteDialogProps) {
  const {
    t,
    mutators: { deleteApiKey },
    toast,
  } = useAuth()

  const { lang } = useLang()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      await deleteApiKey({ keyId: apiKey.id })
      await refetch?.()
      onOpenChange?.(false)
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setIsLoading(false)
  }

  // Format expiration date or show "Never expires"
  const formatExpiration = () => {
    if (!apiKey.expiresAt) return t("NEVER_EXPIRES")

    const expiresDate = new Date(apiKey.expiresAt)
    return `${t("EXPIRES")} ${expiresDate.toLocaleDateString(lang ?? "en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={classNames?.dialog?.content}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("DELETE")} {t("API_KEY")}
          </DialogTitle>

          <DialogDescription
            className={cn("text-xs md:text-sm", classNames?.description)}
          >
            {t("DELETE_API_KEY_CONFIRM")}
          </DialogDescription>
        </DialogHeader>

        <Card
          className={cn(
            "my-2 flex-row items-center gap-3 px-4 py-3",
            classNames?.cell,
          )}
        >
          <KeyRoundIcon className={cn("size-4", classNames?.icon)} />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{apiKey.name}</span>

              <span className="text-muted-foreground text-sm">
                {apiKey.start}
                {"******"}
              </span>
            </div>

            <div className="text-muted-foreground text-xs">
              {formatExpiration()}
            </div>
          </div>
        </Card>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
            className={cn(classNames?.button, classNames?.secondaryButton)}
          >
            {t("CANCEL")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className={cn(classNames?.button, classNames?.destructiveButton)}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {t("DELETE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
