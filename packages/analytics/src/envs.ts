import { createEnv, z } from "@raypx/shared"

export const envs = createEnv({
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith("phc_").optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.url().optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
})
