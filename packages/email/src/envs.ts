import { createEnv, z } from "@raypx/shared"

export const envs = () =>
  createEnv({
    server: {
      RESEND_FROM: z.string().min(1),
      RESEND_TOKEN: z.string().min(1).startsWith("re_"),
      MAIL_HOST: z.string().min(1).optional(),
      MAIL_PORT: z.number().min(1).optional(),
      MAIL_SECURE: z.boolean().optional(),
      MAIL_USER: z.string().min(1).optional(),
      MAIL_PASSWORD: z.string().min(1).optional(),
    },
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM,
      RESEND_TOKEN: process.env.RESEND_TOKEN || process.env.AUTH_RESEND_KEY,
      MAIL_HOST: process.env.MAIL_HOST,
      MAIL_PORT: process.env.MAIL_PORT
        ? parseInt(process.env.MAIL_PORT, 10)
        : undefined,
      MAIL_SECURE: process.env.MAIL_SECURE === "true",
      MAIL_USER: process.env.MAIL_USER,
      MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    },
  })
