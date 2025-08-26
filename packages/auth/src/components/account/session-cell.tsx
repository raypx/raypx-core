"use client"

import { UAParser } from "@raypx/shared"
import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import { LaptopIcon, Loader2, SmartphoneIcon } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Session } from "better-auth"
import { useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import type { Refetch } from "../../types"

export interface SessionCellProps {
  className?: string
  classNames?: SettingsCardClassNames
  session: Session
  refetch?: Refetch
}

export function SessionCell({
  className,
  classNames,
  session,
  refetch,
}: SessionCellProps) {
  const {
    basePath,
    hooks: { useSession },
    t,
    mutators: { revokeSession },
    viewPaths,
    navigate,
    toast,
  } = useAuth()

  const { data: sessionData } = useSession()
  const isCurrentSession = session.id === sessionData?.session?.id

  const [isLoading, setIsLoading] = useState(false)

  const handleRevoke = async () => {
    setIsLoading(true)

    if (isCurrentSession) {
      navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
      return
    }

    try {
      await revokeSession({ token: session.token })
      refetch?.()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      setIsLoading(false)
    }
  }

  const parser = UAParser(session.userAgent as string)
  const isMobile = parser.device.type === "mobile"

  return (
    <Card
      className={cn(
        "flex-row items-center gap-3 px-4 py-3",
        className,
        classNames?.cell,
      )}
    >
      {isMobile ? (
        <SmartphoneIcon className={cn("size-4", classNames?.icon)} />
      ) : (
        <LaptopIcon className={cn("size-4", classNames?.icon)} />
      )}

      <div className="flex flex-col">
        <span className="font-semibold text-sm">
          {isCurrentSession ? t("CURRENT_SESSION") : session?.ipAddress}
        </span>

        <span className="text-muted-foreground text-xs">
          {parser.os.name}, {parser.browser.name}
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
        onClick={handleRevoke}
      >
        {isLoading && <Loader2 className="animate-spin" />}
        {isCurrentSession ? t("SIGN_OUT") : t("REVOKE")}
      </Button>
    </Card>
  )
}
