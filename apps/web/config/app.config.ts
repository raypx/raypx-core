import { appConfig } from "@raypx/config"
import { z } from "zod"

// Extended app config schema for web app specific needs
const ExtendedAppSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  url: z.string().min(1),
  year: z.number().min(1).max(new Date().getFullYear()),
  title: z.string().min(1),
  locale: z.string().min(1),
  theme: z.enum(["light", "dark", "system"]),
  production: z.boolean(),
  version: z.string().optional(),
})

// Merge base config with web-specific config
const webAppConfig = ExtendedAppSchema.parse({
  // From base config
  name: appConfig.name,
  title: appConfig.title,
  description: appConfig.description,
  url: appConfig.url,
  locale: appConfig.locale,
  theme: appConfig.theme,
  production: appConfig.production,
  version: appConfig.version,
  // Web-specific
  keywords: ["Raypx", "AI", "Platform", "Framework", "Next.js", "TypeScript"],
  year: 2025,
} satisfies z.infer<typeof ExtendedAppSchema>)

export default webAppConfig
