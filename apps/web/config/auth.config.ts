import type { AuthViewPaths } from "@raypx/auth";

export const authPages: Partial<AuthViewPaths> = {
  CALLBACK: "callback",
  EMAIL_OTP: "email-otp",
  FORGOT_PASSWORD: "forgot-password",
  MAGIC_LINK: "magic-link",
  RECOVER_ACCOUNT: "recover-account",
  RESET_PASSWORD: "reset-password",
  SIGN_IN: "sign-in",
  SIGN_OUT: "sign-out",
  SIGN_UP: "sign-up",
  TWO_FACTOR: "two-factor",
  ACCEPT_INVITATION: "accept-invitation",
};
