import { createEnv, z } from "@raypx/shared";

export const envs = () =>
  createEnv({
    server: {
      REDIS_URL: z.url().min(1),
    },
    runtimeEnv: {
      REDIS_URL: process.env.REDIS_URL,
    },
  });
