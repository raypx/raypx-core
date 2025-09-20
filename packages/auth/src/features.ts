/**
 * Centralized feature configuration for auth package
 * Simple const properties to control auth features
 */
export const authFeatures = {
  /** API Key functionality */
  apiKey: false,

  /** Authentication methods */
  magicLink: true,
  emailOTP: true,
  passkey: true,
  oneTap: false,
  changeEmail: true,
  /** Advanced features */
  multiSession: true,
  twoFactor: true,
  emailVerification: true,
  deleteUser: true,
  organization: true,

  credentials: {
    username: true,
    rememberMe: true,
  },

  /** UI features */
  avatar: true,
  gravatar: true,
  captcha: false,

  /** Social authentication providers */
  social: {
    github: true,
    google: true,
    discord: false,
    apple: false,
    microsoft: false,
    twitter: false,
    facebook: false,
    linkedin: false,
  },
} as const;
