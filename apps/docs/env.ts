import { envs as auth } from "@raypx/auth/envs"
import { envs as db } from "@raypx/db/envs"
import { envs as redis } from "@raypx/redis/envs"
import { createEnv } from "@raypx/shared"

export const env = createEnv({
  extends: [auth(), db(), redis()],
  runtimeEnv: {},
  server: {},
  client: {},
})
