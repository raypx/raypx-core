import type { AuthViewPaths } from "@raypx/auth";

export const authPages: Partial<AuthViewPaths> = {
  CALLBACK: "auth/callback",
  EMAIL_OTP: "auth/email-otp",
  FORGOT_PASSWORD: "auth/forgot-password",
  MAGIC_LINK: "auth/magic-link",
  RECOVER_ACCOUNT: "auth/recover-account",
  RESET_PASSWORD: "auth/reset-password",
  SIGN_IN: "auth/sign-in",
  SIGN_OUT: "auth/sign-out",
  SIGN_UP: "auth/sign-up",
  TWO_FACTOR: "auth/two-factor",
  ACCEPT_INVITATION: "auth/accept-invitation",
};
