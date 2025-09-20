import { z } from "zod";

const providers = z.enum([
  "apple",
  "azure",
  "bitbucket",
  "discord",
  "facebook",
  "figma",
  "github",
  "gitlab",
  "google",
  "kakao",
  "keycloak",
  "linkedin",
  "linkedin_oidc",
  "notion",
  "slack",
  "spotify",
  "twitch",
  "twitter",
  "workos",
  "zoom",
  "fly",
]);

const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z.string().optional(),
  displayTermsCheckbox: z.boolean().optional(),
  enableIdentityLinking: z.boolean().optional().default(false),
  providers: z.object({
    password: z.boolean(),
    magicLink: z.boolean(),
    otp: z.boolean(),
    oAuth: providers.array(),
  }),
  enableMFA: z.boolean(),
  enablePasskeys: z.boolean(),
});

const authConfig = AuthConfigSchema.parse({
  // NB: This is a public key, so it's safe to expose.
  captchaTokenSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // whether to display the terms checkbox during sign-up
  displayTermsCheckbox: process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === "true",

  // whether to enable identity linking
  enableIdentityLinking: process.env.NEXT_PUBLIC_AUTH_IDENTITY_LINKING === "true",

  // Auth providers configuration
  providers: {
    password: process.env.NEXT_PUBLIC_AUTH_PASSWORD !== "false",
    magicLink: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK === "true",
    otp: process.env.NEXT_PUBLIC_AUTH_OTP === "true",
    oAuth: (process.env.NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS?.split(",") ?? [
      "google",
      "github",
    ]) as z.infer<typeof providers>[],
  },

  enableMFA: process.env.NEXT_PUBLIC_ENABLE_MFA === "true",
  enablePasskeys: process.env.NEXT_PUBLIC_ENABLE_PASSKEYS === "true",
} satisfies z.infer<typeof AuthConfigSchema>);

export default authConfig;
