import { createEnv, z } from "@raypx/shared";

export const envs = createEnv({
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith("phc_").optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.url().optional(),
    NEXT_PUBLIC_POSTHOG_INGESTION_URL: z.url().optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
    NEXT_PUBLIC_UMAMI_HOST: z.url().optional(),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_ANALYTICS_DISABLED: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    NEXT_PUBLIC_ANALYTICS_DEBUG: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_INGESTION_URL: process.env.NEXT_PUBLIC_POSTHOG_INGESTION_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_UMAMI_HOST: process.env.NEXT_PUBLIC_UMAMI_HOST,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_ANALYTICS_DISABLED: process.env.NEXT_PUBLIC_ANALYTICS_DISABLED,
    NEXT_PUBLIC_ANALYTICS_DEBUG: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG,
  },
});
