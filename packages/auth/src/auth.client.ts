import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  emailOTPClient,
  genericOAuthClient,
  lastLoginMethodClient,
  magicLinkClient,
  oneTapClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { Get } from "type-fest"
import { envs } from "./envs"
import { authFeatures } from "./features"
import {
  ac,
  admin as adminRole,
  superadmin as superAdminRole,
  user as userRole,
} from "./permissions"

// Environment variables
const env = envs()

// Build plugins array based on enabled features
const buildClientPlugins = () => {
  const plugins = []

  // Always include basic plugins
  plugins.push(anonymousClient(), usernameClient(), lastLoginMethodClient())

  // Add feature-specific plugins
  if (authFeatures.apiKey) {
    plugins.push(apiKeyClient())
  }

  // Organization
  if (authFeatures.organization) {
    plugins.push(
      // Organization
      organizationClient(),
      // Admin
      adminClient({
        ac,
        roles: {
          user: userRole,
          admin: adminRole,
          superadmin: superAdminRole,
        },
      }),
    )
  }

  // Email OTP
  if (authFeatures.emailOTP) {
    plugins.push(emailOTPClient())
  }

  // Two Factor
  if (authFeatures.twoFactor) {
    plugins.push(twoFactorClient())
  }

  // Social
  if (authFeatures.social) {
    plugins.push(genericOAuthClient())
  }

  // Magic Link
  if (authFeatures.magicLink) {
    plugins.push(magicLinkClient())
  }

  // One Tap
  if (authFeatures.oneTap && env.NEXT_PUBLIC_AUTH_GOOGLE_ID) {
    plugins.push(
      oneTapClient({
        clientId: env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
      }),
    )
  }

  return plugins
}

// Create the client
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
  plugins: buildClientPlugins(),
})

// Export the client
export const {
  signIn,
  signUp,
  useSession,
  signOut,
  forgetPassword,
  resetPassword,
  changePassword,
  listAccounts,
  unlinkAccount,
  linkSocial,
  deleteUser,
  accountInfo,
  sendVerificationEmail,
  listSessions,
  revokeSession,
  updateUser,
  $store,
  admin,
  organization,
} = authClient

// Export the types
export type AuthClient = typeof authClient

export type UseSession = ReturnType<typeof useSession>

export type Session = Get<AuthClient, "$Infer.Session.session">
export type User = Get<AuthClient, "$Infer.Session.user">

export { authClient as client }
