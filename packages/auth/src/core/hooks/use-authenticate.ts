"use client"

import { useEffect } from "react"
import type { AuthViewPath } from "../../server"
import type { AnyAuthClient } from "../../types"
import { useAuth } from "./use-auth"

interface AuthenticateOptions<TAuthClient extends AnyAuthClient> {
  authClient?: TAuthClient
  authView?: AuthViewPath
  enabled?: boolean
}

export function useAuthenticate<TAuthClient extends AnyAuthClient>(
  options?: AuthenticateOptions<TAuthClient>,
) {
  type Session = TAuthClient["$Infer"]["Session"]["session"]
  type User = TAuthClient["$Infer"]["Session"]["user"]

  const { authView = "SIGN_IN", enabled = true } = options ?? {}

  const {
    hooks: { useSession },
    basePath,
    viewPaths,
    replace,
  } = useAuth()

  const { data, isPending, error, refetch } = useSession()
  const sessionData = data as
    | {
        session: Session
        user: User
      }
    | null
    | undefined

  useEffect(() => {
    if (!enabled || isPending || sessionData) return

    replace(
      `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`,
    )
  }, [isPending, sessionData, basePath, viewPaths, replace, authView, enabled])

  return {
    data: sessionData,
    user: sessionData?.user,
    isPending,
    error,
    refetch,
  }
}
