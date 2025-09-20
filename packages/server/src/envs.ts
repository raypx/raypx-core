import { envs as db } from "@raypx/db/envs";
import { createEnv } from "@raypx/shared";

export const envs = () =>
  createEnv({
    extends: [db()],
    client: {},
    shared: {},
    server: {},
    runtimeEnv: {},
  });
