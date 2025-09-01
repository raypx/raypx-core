import { createEnv, z } from "@raypx/shared"

export const envs = () =>
  createEnv({
    server: {
      RESEND_FROM: z.string().min(1),
      RESEND_TOKEN: z
        .string()
        .min(1)
        .startsWith("re_", "Resend token must start with 're_'"),
      RESEND_WEBHOOK_SECRET: z.string().min(1).optional(),
      MAIL_HOST: z.string().min(1).optional(),
      MAIL_PORT: z.number().int().min(1).max(65535).optional(),
      MAIL_SECURE: z.boolean().optional(),
      MAIL_USER: z.string().min(1).optional(),
      MAIL_PASSWORD: z.string().min(1).optional(),
      EMAIL_TRACKING_ENABLED: z.boolean().optional(),
    },
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM,
      RESEND_TOKEN: process.env.RESEND_TOKEN || process.env.AUTH_RESEND_KEY,
      RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
      MAIL_HOST: process.env.MAIL_HOST,
      MAIL_PORT: process.env.MAIL_PORT
        ? parseInt(process.env.MAIL_PORT, 10)
        : undefined,
      MAIL_SECURE: process.env.MAIL_SECURE === "true",
      MAIL_USER: process.env.MAIL_USER,
      MAIL_PASSWORD: process.env.MAIL_PASSWORD,
      EMAIL_TRACKING_ENABLED: process.env.EMAIL_TRACKING_ENABLED === "true",
    },
  })
