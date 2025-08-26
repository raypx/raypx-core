"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import { KeyRoundIcon } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useLang } from "../../core/hooks/use-lang"
import type { ApiKey, Refetch } from "../../types"
import { ApiKeyDeleteDialog } from "./api-key-delete-dialog"

export interface ApiKeyCellProps {
  className?: string
  classNames?: SettingsCardClassNames
  apiKey: ApiKey
  refetch?: Refetch
}

export function ApiKeyCell({
  className,
  classNames,
  apiKey,
  refetch,
}: ApiKeyCellProps) {
  const { t } = useAuth()

  const { lang } = useLang()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
    <>
      <Card
        className={cn(
          "flex-row items-center gap-3 truncate px-4 py-3",
          className,
          classNames?.cell,
        )}
      >
        <KeyRoundIcon
          className={cn("size-4 flex-shrink-0", classNames?.icon)}
        />

        <div className="flex flex-col truncate">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-sm">
              {apiKey.name}
            </span>

            <span className="flex-1 truncate text-muted-foreground text-sm">
              {apiKey.start}
              {"******"}
            </span>
          </div>

          <div className="truncate text-muted-foreground text-xs">
            {formatExpiration()}
          </div>
        </div>

        <Button
          className={cn(
            "relative ms-auto",
            classNames?.button,
            classNames?.outlineButton,
          )}
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
        >
          {t("DELETE")}
        </Button>
      </Card>

      <ApiKeyDeleteDialog
        classNames={classNames}
        apiKey={apiKey}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        refetch={refetch}
      />
    </>
  )
}
