import { createEnv, z } from "@raypx/shared";

export const envs = () =>
  createEnv({
    client: {},
    shared: {
      NODE_ENV: z.enum(["development", "production"]).default("development"),
    },
    server: {},
    runtimeEnv: {
      NODE_ENV: process.env.NODE_ENV,
    },
  });
