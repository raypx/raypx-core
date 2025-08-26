"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import { FingerprintIcon, Loader2 } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import { SessionFreshnessDialog } from "../core/session-freshness-dialog"

export interface PasskeyCellProps {
  className?: string
  classNames?: SettingsCardClassNames
  passkey: { id: string; createdAt: Date }
}

export function PasskeyCell({
  className,
  classNames,
  passkey,
}: PasskeyCellProps) {
  const {
    freshAge,
    hooks: { useSession, useListPasskeys },
    t,
    mutators: { deletePasskey },
    toast,
  } = useAuth()

  const { refetch } = useListPasskeys()

  const { data: sessionData } = useSession()
  const session = sessionData?.session
  const isFresh = session
    ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000
    : false

  const [showFreshnessDialog, setShowFreshnessDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeletePasskey = async () => {
    // If session isn't fresh, show the freshness dialog
    if (!isFresh) {
      setShowFreshnessDialog(true)
      return
    }

    setIsLoading(true)

    try {
      await deletePasskey({ id: passkey.id })
      refetch?.()
    } catch (error) {
      setIsLoading(false)

      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }
  }

  return (
    <>
      <SessionFreshnessDialog
        open={showFreshnessDialog}
        onOpenChange={setShowFreshnessDialog}
        classNames={classNames}
      />

      <Card
        className={cn("flex-row items-center p-4", className, classNames?.cell)}
      >
        <div className="flex items-center gap-3">
          <FingerprintIcon className={cn("size-4", classNames?.icon)} />
          <span className="text-sm">
            {new Date(passkey.createdAt).toLocaleString()}
          </span>
        </div>

        <Button
          className={cn(
            "relative ms-auto",
            classNames?.button,
            classNames?.outlineButton,
          )}
          disabled={isLoading}
          size="sm"
          variant="outline"
          onClick={handleDeletePasskey}
        >
          {isLoading && <Loader2 className="animate-spin" />}

          {t("DELETE")}
        </Button>
      </Card>
    </>
  )
}
