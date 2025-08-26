"use client"

import { toast } from "@raypx/ui/components/toast"
import { createContext, type ReactNode, useMemo } from "react"
import { useAuthData } from "../../core/hooks/use-auth-data"
import {
  type AuthTranslations,
  useAuthTranslations,
} from "../../core/hooks/use-auth-translations"
import { processSocialConfig } from "../../core/lib/social-providers"
import type { AuthViewPaths } from "../../core/lib/utils/view-paths"
import {
  accountViewPaths,
  authViewPaths,
  organizationViewPaths,
} from "../../core/lib/utils/view-paths"
import { authFeatures } from "../../features"
import type {
  AccountOptions,
  AccountOptionsContext,
  AdditionalFields,
  AnyAuthClient,
  AuthClient,
  AuthHooks,
  AuthMutators,
  AvatarOptions,
  CaptchaOptions,
  CredentialsOptions,
  DeleteUserOptions,
  GenericOAuthOptions,
  GravatarOptions,
  OrganizationOptions,
  OrganizationOptionsContext,
  RenderToast,
  SignUpOptions,
  SocialOptions,
} from "../../types"
import { OrganizationRefetcher } from "./organization-refetcher"
import { RecaptchaV3 } from "./recaptcha-v3"

const defaultNavigate = (href: string) => {
  window.location.href = href
}

const defaultReplace = (href: string) => {
  window.location.replace(href)
}

const defaultToast: RenderToast = ({ variant = "default", message }) => {
  if (variant === "default") {
    toast(message)
  } else {
    toast[variant](message)
  }
}

// Inline utility functions to simplify boolean/object property handling
const normalizeAvatar = (
  prop: boolean | Partial<AvatarOptions> | undefined,
): AvatarOptions | undefined => {
  if (!prop) return undefined
  if (prop === true) return { extension: "png", size: 128 }
  return {
    upload: prop.upload,
    delete: prop.delete,
    extension: prop.extension || "png",
    size: prop.size || (prop.upload ? 256 : 128),
  }
}

const normalizeDeleteUser = (
  prop: DeleteUserOptions | boolean | undefined,
): DeleteUserOptions | undefined => {
  if (!prop) return undefined
  return prop === true ? {} : prop
}

const removeTrailingSlash = (path: string): string =>
  path === "/" || !path.endsWith("/") ? path : path.slice(0, -1)

// Factory functions for better performance
const createDefaultMutators = (authClient: AuthClient): AuthMutators =>
  ({
    deleteApiKey: (params) =>
      authClient.apiKey.delete({
        ...params,
        fetchOptions: { throw: true },
      }),
    deletePasskey: (params) =>
      authClient.passkey.deletePasskey({
        ...params,
        fetchOptions: { throw: true },
      }),
    revokeDeviceSession: (params) =>
      authClient.multiSession.revoke({
        ...params,
        fetchOptions: { throw: true },
      }),
    revokeSession: (params) =>
      authClient.revokeSession({
        ...params,
        fetchOptions: { throw: true },
      }),
    setActiveSession: (params) =>
      authClient.multiSession.setActive({
        ...params,
        fetchOptions: { throw: true },
      }),
    updateOrganization: (params) =>
      authClient.organization.update({
        ...params,
        fetchOptions: { throw: true },
      }),
    updateUser: (params) =>
      authClient.updateUser({ ...params, fetchOptions: { throw: true } }),
    unlinkAccount: (params) =>
      authClient.unlinkAccount({
        ...params,
        fetchOptions: { throw: true },
      }),
  }) as AuthMutators

const createDefaultHooks = (authClient: AuthClient): AuthHooks =>
  ({
    useSession: authClient.useSession,
    useListAccounts: () =>
      useAuthData({
        queryFn: authClient.listAccounts,
        cacheKey: "listAccounts",
      }),
    useAccountInfo: (params) =>
      useAuthData({
        queryFn: () => authClient.accountInfo(params),
        cacheKey: `accountInfo:${JSON.stringify(params)}`,
      }),
    useListDeviceSessions: () =>
      useAuthData({
        queryFn: authClient.multiSession.listDeviceSessions,
        cacheKey: "listDeviceSessions",
      }),
    useListSessions: () =>
      useAuthData({
        queryFn: authClient.listSessions,
        cacheKey: "listSessions",
      }),
    useListPasskeys: authClient.useListPasskeys,
    useListApiKeys: () =>
      useAuthData({
        queryFn: authClient.apiKey.list,
        cacheKey: "listApiKeys",
      }),
    useActiveOrganization: authClient.useActiveOrganization,
    useListOrganizations: authClient.useListOrganizations,
    useHasPermission: (params) =>
      useAuthData({
        queryFn: () =>
          authClient.$fetch("/organization/has-permission", {
            method: "POST",
            body: params,
          }),
        cacheKey: `hasPermission:${JSON.stringify(params)}`,
      }),
    useInvitation: (params) =>
      useAuthData({
        queryFn: () => authClient.organization.getInvitation(params),
        cacheKey: `invitation:${JSON.stringify(params)}`,
      }),
    useListInvitations: (params) =>
      useAuthData({
        queryFn: () =>
          authClient.$fetch(
            `/organization/list-invitations?organizationId=${params?.query?.organizationId || ""}`,
          ),
        cacheKey: `listInvitations:${JSON.stringify(params)}`,
      }),
    useListUserInvitations: () =>
      useAuthData({
        queryFn: () => authClient.$fetch("/organization/list-user-invitations"),
        cacheKey: "listUserInvitations",
      }),
    useListMembers: (params) =>
      useAuthData({
        queryFn: () =>
          authClient.$fetch(
            `/organization/list-members?organizationId=${params?.query?.organizationId || ""}`,
          ),
        cacheKey: `listMembers:${JSON.stringify(params)}`,
      }),
  }) as AuthHooks

export type AuthContextType = {
  authClient: AuthClient
  /**
   * Additional fields for users
   */
  additionalFields?: AdditionalFields
  /**
   * API Key plugin configuration
   */
  apiKey?:
    | {
        /**
         * Prefix for API Keys
         */
        prefix?: string
        /**
         * Metadata for API Keys
         */
        metadata?: Record<string, unknown>
      }
    | boolean
  /**
   * Avatar configuration
   * @default undefined
   */
  avatar?: AvatarOptions
  /**
   * Base path for the auth views
   * @default "/auth"
   */
  basePath: string
  /**
   * Front end base URL for auth API callbacks
   */
  baseURL?: string
  /**
   * Captcha configuration
   */
  captcha?: CaptchaOptions
  credentials?: CredentialsOptions
  /**
   * Default redirect URL after authenticating
   * @default "/"
   */
  redirectTo: string
  /**
   * Enable or disable user change email support
   * @default true
   */

  changeEmail?: boolean
  /**
   * User Account deletion configuration
   * @default undefined
   */
  deleteUser?: DeleteUserOptions
  /**
   * Show Verify Email card for unverified emails
   */
  emailVerification?: boolean
  /**
   * Freshness age for Session data
   * @default 60 * 60 * 24
   */
  freshAge: number
  /**
   * Generic OAuth provider configuration
   */
  genericOAuth?: GenericOAuthOptions
  /**
   * Gravatar configuration
   */
  gravatar?: boolean | GravatarOptions
  /**
   * Customize the Localization translations
   * @remarks `AuthTranslations["t"]`
   */
  t: AuthTranslations["t"]
  /**
   * ADVANCED: Custom hooks for fetching auth data
   */
  hooks: AuthHooks
  /**
   * Enable or disable Magic Link support
   * @default false
   */
  magicLink?: boolean
  /**
   * Enable or disable Email OTP support
   * @default false
   */
  emailOTP?: boolean
  /**
   * Enable or disable Multi Session support
   * @default false
   */
  multiSession?: boolean
  /**
   * ADVANCED: Custom mutators for updating auth data
   */
  mutators: AuthMutators
  /**
   * Whether the name field should be required
   * @default true
   */
  nameRequired?: boolean
  /**
   * Enable or disable One Tap support
   * @default false
   */
  oneTap?: boolean
  /**
   * Perform some User updates optimistically
   * @default false
   */
  optimistic?: boolean
  /**
   * Organization configuration
   */
  organization?: OrganizationOptionsContext
  /**
   * Enable or disable Passkey support
   * @default false
   */
  passkey?: boolean
  /**
   * Forces better-auth-tanstack to refresh the Session on the auth callback page
   * @default false
   */
  persistClient?: boolean
  /**
   * Account configuration
   */
  account?: AccountOptionsContext
  /**
   * Sign Up configuration
   */
  signUp?: SignUpOptions
  /**
   * Social provider configuration
   */
  social?: SocialOptions
  /**
   * Render custom Toasts
   * @default Sonner
   */
  toast: RenderToast
  /**
   * Enable or disable two-factor authentication support
   * @default undefined
   */
  twoFactor?: ("otp" | "totp")[]
  /**
   * Customize the paths for the auth views
   * @default authViewPaths
   * @remarks `AuthViewPaths`
   */
  viewPaths: AuthViewPaths
  /**
   * Navigate to a new URL
   * @default window.location.href
   */
  navigate: (href: string) => void
  /**
   * Called whenever the Session changes
   */
  onSessionChange?: () => void | Promise<void>
  /**
   * Replace the current URL
   * @default navigate
   */
  replace: (href: string) => void
}

export type AuthProviderProps = {
  children: ReactNode
  /**
   * Better Auth client returned from createAuthClient
   * @default Required
   * @remarks `AuthClient`
   */
  authClient: AnyAuthClient
  /**
   * Enable account view & account configuration
   * @default { fields: ["image", "name"] }
   */
  account?: boolean | Partial<AccountOptions>
  /**
   * Avatar configuration
   * @default undefined
   */
  avatar?: boolean | Partial<AvatarOptions>
  /**
   * User Account deletion configuration
   * @default undefined
   */
  deleteUser?: DeleteUserOptions | boolean
  /**
   * ADVANCED: Custom hooks for fetching auth data
   */
  hooks?: Partial<AuthHooks>
  /**
   * Customize the paths for the auth views
   * @default authViewPaths
   * @remarks `AuthViewPaths`
   */
  viewPaths?: Partial<AuthViewPaths>
  /**
   * Render custom Toasts
   * @default Sonner
   */
  toast?: RenderToast
  /**
   * Customize the Localization translations
   * @remarks `AuthTranslations["t"]`
   */
  t?: AuthTranslations["t"]
  /**
   * ADVANCED: Custom mutators for updating auth data
   */
  mutators?: Partial<AuthMutators>
  /**
   * Organization plugin configuration
   */
  organization?: OrganizationOptions | boolean
  /**
   * Enable or disable Credentials support
   * @default { forgotPassword: true }
   */
  credentials?: boolean | CredentialsOptions
  /**
   * Enable or disable Sign Up form
   * @default { fields: ["name"] }
   */
  signUp?: SignUpOptions | boolean
} & Partial<
  Omit<
    AuthContextType,
    | "authClient"
    | "viewPaths"
    | "t"
    | "mutators"
    | "toast"
    | "hooks"
    | "avatar"
    | "account"
    | "deleteUser"
    | "credentials"
    | "signUp"
    | "organization"
  >
>

export const AuthContext = createContext<AuthContextType>(
  {} as unknown as AuthContextType,
)

export const AuthProvider = ({
  children,
  authClient: authClientProp,
  account: accountProp,
  avatar: avatarProp,
  deleteUser: deleteUserProp,
  social: socialProp,
  genericOAuth: genericOAuthProp,
  basePath = "/auth",
  baseURL = "",
  captcha,
  redirectTo = "/",
  credentials: credentialsProp,
  changeEmail = true,
  freshAge = 60 * 60 * 24,
  hooks: hooksProp,
  mutators: mutatorsProp,
  nameRequired = true,
  organization: organizationProp,
  signUp: signUpProp = true,
  toast = defaultToast,
  viewPaths: viewPathsProp,
  navigate,
  replace,
  multiSession,
  magicLink,
  oneTap,
  ...props
}: AuthProviderProps) => {
  const authClient = authClientProp as AuthClient

  const avatar = useMemo(() => normalizeAvatar(avatarProp), [avatarProp])
  const { t } = useAuthTranslations()

  const account = useMemo<AccountOptionsContext | undefined>(() => {
    if (accountProp === false) return undefined
    if (accountProp === true || accountProp === undefined) {
      return {
        basePath: "/account",
        fields: ["image", "name"],
        viewPaths: accountViewPaths,
      }
    }
    const basePath = removeTrailingSlash(accountProp.basePath || "/account")
    return {
      basePath,
      fields: accountProp.fields || ["image", "name"],
      viewPaths: { ...accountViewPaths, ...accountProp.viewPaths },
    }
  }, [accountProp])

  const deleteUser = useMemo(
    () => normalizeDeleteUser(deleteUserProp),
    [deleteUserProp],
  )

  const credentials = useMemo<CredentialsOptions | undefined>(() => {
    if (credentialsProp === false) return undefined
    if (credentialsProp === true) return { forgotPassword: true }
    return {
      ...credentialsProp,
      forgotPassword: credentialsProp?.forgotPassword ?? true,
    }
  }, [credentialsProp])

  const signUp = useMemo<SignUpOptions | undefined>(() => {
    if (signUpProp === false) return undefined
    if (signUpProp === true || signUpProp === undefined)
      return { fields: ["name"] }
    return { fields: signUpProp.fields || ["name"] }
  }, [signUpProp])

  const organization = useMemo<OrganizationOptionsContext | undefined>(() => {
    if (!organizationProp) return undefined
    if (organizationProp === true) {
      return {
        basePath: "/organization",
        viewPaths: organizationViewPaths,
        customRoles: [],
      }
    }

    let logo: OrganizationOptionsContext["logo"] | undefined
    if (organizationProp.logo === true) {
      logo = { extension: "png", size: 128 }
    } else if (organizationProp.logo) {
      logo = {
        upload: organizationProp.logo.upload,
        delete: organizationProp.logo.delete,
        extension: organizationProp.logo.extension || "png",
        size:
          organizationProp.logo.size ||
          (organizationProp.logo.upload ? 256 : 128),
      }
    }

    return {
      ...organizationProp,
      logo,
      basePath: removeTrailingSlash(
        organizationProp.basePath || "/organization",
      ),
      customRoles: organizationProp.customRoles || [],
      viewPaths: { ...organizationViewPaths, ...organizationProp.viewPaths },
      apiKey: (authFeatures.apiKey ?? true) && organizationProp.apiKey,
    }
  }, [organizationProp])

  const defaultMutators = useMemo(
    () => createDefaultMutators(authClient),
    [authClient],
  )

  const defaultHooks = useMemo(
    () => createDefaultHooks(authClient),
    [authClient],
  )

  const viewPaths = useMemo(() => {
    return { ...authViewPaths, ...viewPathsProp }
  }, [viewPathsProp])

  const hooks = useMemo(() => {
    return { ...defaultHooks, ...hooksProp }
  }, [defaultHooks, hooksProp])

  const mutators = useMemo(() => {
    return { ...defaultMutators, ...mutatorsProp }
  }, [defaultMutators, mutatorsProp])

  const normalizedBaseURL = removeTrailingSlash(baseURL)
  const normalizedBasePath = removeTrailingSlash(basePath)

  const social = useMemo(() => {
    return processSocialConfig(socialProp)
  }, [socialProp])

  const { data: sessionData } = hooks.useSession()

  const hasSocialProviders = useMemo(
    () => Object.values(authFeatures.social).some((enabled) => enabled),
    [],
  )

  const featureConfig = useMemo(
    () => ({
      captcha: authFeatures.captcha ? captcha : undefined,
      changeEmail: authFeatures.changeEmail ? changeEmail : undefined,
      deleteUser: authFeatures.deleteUser ? deleteUser : undefined,
      oneTap: authFeatures.oneTap ? oneTap : undefined,
      genericOAuth: hasSocialProviders ? genericOAuthProp : undefined,
      organization: authFeatures.organization ? organization : undefined,
      multiSession: authFeatures.multiSession ? multiSession : undefined,
      magicLink: authFeatures.magicLink ? magicLink : undefined,
      credentials: authFeatures.credentials ? credentials : undefined,
    }),
    [
      captcha,
      changeEmail,
      deleteUser,
      oneTap,
      genericOAuthProp,
      organization,
      multiSession,
      magicLink,
      hasSocialProviders,
    ],
  )

  return (
    <AuthContext.Provider
      value={{
        authClient,
        avatar,
        basePath: normalizedBasePath === "/" ? "" : normalizedBasePath,
        baseURL: normalizedBaseURL,
        redirectTo,
        freshAge,
        hooks,
        mutators,
        t,
        nameRequired,
        account,
        signUp,
        social,
        toast,
        navigate: navigate || defaultNavigate,
        replace: replace || navigate || defaultReplace,
        viewPaths,
        ...featureConfig,
        ...props,
      }}
    >
      {sessionData && organization && <OrganizationRefetcher />}

      {captcha?.provider === "google-recaptcha-v3" ? (
        <RecaptchaV3>{children}</RecaptchaV3>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
