import { z } from "zod"

type LanguagePriority = "user" | "application"

const FeaturesConfigSchema = z.object({
  enableThemeToggle: z.boolean(),
  enableAccountDeletion: z.boolean(),
  enableTeamDeletion: z.boolean(),
  enableTeamAccounts: z.boolean(),
  enableTeamCreation: z.boolean(),
  enablePersonalAccountBilling: z.boolean(),
  enableTeamAccountBilling: z.boolean(),
  languagePriority: z.enum(["user", "application"]).default("application"),
  enableNotifications: z.boolean(),
  realtimeNotifications: z.boolean(),
  enableVersionUpdater: z.boolean(),
  enableAI: z.boolean(),
  enableAnalytics: z.boolean(),
})

const featuresConfig = FeaturesConfigSchema.parse({
  enableThemeToggle: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_THEME_TOGGLE,
    true,
  ),
  enableAccountDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION,
    false,
  ),
  enableTeamDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION,
    false,
  ),
  enableTeamAccounts: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS,
    true,
  ),
  enableTeamCreation: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION,
    true,
  ),
  enablePersonalAccountBilling: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_BILLING,
    false,
  ),
  enableTeamAccountBilling: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_BILLING,
    false,
  ),
  languagePriority: process.env
    .NEXT_PUBLIC_LANGUAGE_PRIORITY as LanguagePriority,
  enableNotifications: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
    true,
  ),
  realtimeNotifications: getBoolean(
    process.env.NEXT_PUBLIC_REALTIME_NOTIFICATIONS,
    false,
  ),
  enableVersionUpdater: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_VERSION_UPDATER,
    false,
  ),
  enableAI: getBoolean(process.env.NEXT_PUBLIC_ENABLE_AI, true),
  enableAnalytics: getBoolean(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, true),
} satisfies z.infer<typeof FeaturesConfigSchema>)

export default featuresConfig

function getBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === "string") {
    return value === "true"
  }

  return defaultValue
}
