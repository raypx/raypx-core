"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { getSearchParam } from "../lib/utils"
import { useAuth } from "./use-auth"

export function useOnSuccessTransition({
  redirectTo: redirectToProp,
}: {
  redirectTo?: string
}) {
  const { redirectTo: contextRedirectTo } = useAuth()

  const getRedirectTo = useCallback(
    () => redirectToProp || getSearchParam("redirectTo") || contextRedirectTo,
    [redirectToProp, contextRedirectTo],
  )

  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const {
    navigate,
    hooks: { useSession },
    onSessionChange,
  } = useAuth()

  const { refetch: refetchSession } = useSession()

  useEffect(() => {
    if (!success || isPending) return

    startTransition(() => {
      navigate(getRedirectTo())
    })
  }, [success, isPending, navigate, getRedirectTo])

  const onSuccess = useCallback(async () => {
    await refetchSession?.()
    setSuccess(true)

    if (onSessionChange) startTransition(onSessionChange)
  }, [refetchSession, onSessionChange])

  return { onSuccess, isPending }
}
