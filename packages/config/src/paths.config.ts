import { z } from "zod";

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    dashboard: z.string().min(1),
    personalAccountSettings: z.string().min(1),
    personalAccountBilling: z.string().min(1),
    personalAccountBillingReturn: z.string().min(1),
    accountHome: z.string().min(1),
    accountSettings: z.string().min(1),
    accountBilling: z.string().min(1),
    accountMembers: z.string().min(1),
    accountBillingReturn: z.string().min(1),
    joinTeam: z.string().min(1),
    knowledge: z.string().min(1),
    analytics: z.string().min(1),
  }),
  marketing: z.object({
    home: z.string().min(1),
    pricing: z.string().min(1),
    about: z.string().min(1),
    contact: z.string().min(1),
    terms: z.string().min(1),
    privacy: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    verifyMfa: "/auth/verify-mfa",
    callback: "/auth/callback",
    passwordReset: "/auth/password-reset",
    passwordUpdate: "/auth/update-password",
  },
  app: {
    home: "/dashboard",
    dashboard: "/dashboard",
    personalAccountSettings: "/account/settings",
    personalAccountBilling: "/account/billing",
    personalAccountBillingReturn: "/account/billing/return",
    accountHome: "/orgs/[slug]",
    accountSettings: `/orgs/[slug]/settings`,
    accountBilling: `/orgs/[slug]/billing`,
    accountMembers: `/orgs/[slug]/members`,
    accountBillingReturn: `/orgs/[slug]/billing/return`,
    joinTeam: "/join",
    knowledge: "/dashboard/knowledge",
    analytics: "/dashboard/analytics",
  },
  marketing: {
    home: "/",
    pricing: "/pricing",
    about: "/about",
    contact: "/contact",
    terms: "/terms",
    privacy: "/privacy",
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
