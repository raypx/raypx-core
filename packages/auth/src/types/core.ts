import {
  anonymousClient,
  apiKeyClient,
  emailOTPClient,
  genericOAuthClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"
import type { createAuthClient as createAuthClientType } from "better-auth/react"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  plugins: [
    apiKeyClient(),
    multiSessionClient(),
    passkeyClient(),
    oneTapClient({
      clientId: "",
    }),
    genericOAuthClient(),
    anonymousClient(),
    usernameClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    organizationClient(),
    lastLoginMethodClient(),
  ],
})

export type AuthClient = typeof authClient

export type Session = AuthClient["$Infer"]["Session"]["session"]
export type User = AuthClient["$Infer"]["Session"]["user"]

export type AnyAuthClient = Omit<
  ReturnType<typeof createAuthClientType>,
  "signUp" | "getSession"
>

export type ApiKey = {
  id: string
  name?: string | null
  start?: string | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown> | null
}

export type Invitation = {
  id: string
  organizationId: string
  email: string
  role: string
  status: string
  inviterId: string
  expiresAt: Date
  teamId?: string | undefined
}

export type Profile = {
  id?: string | number
  email?: string | null
  name?: string | null
  displayUsername?: string | null
  username?: string | null
  displayName?: string | null
  firstName?: string | null
  fullName?: string | null
  isAnonymous?: boolean | null
  emailVerified?: boolean | null
  image?: string | null
  avatar?: string | null
  avatarUrl?: string | null
}

export type Refetch = () => Promise<unknown> | unknown

export type FetchError = {
  code?: string | undefined
  message?: string | undefined
  status?: number
  statusText?: string
}
