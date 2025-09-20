import assert from "node:assert/strict";
import type { Config } from "drizzle-kit";
import { envs } from "./src/envs";

const env = envs();

assert(env.DATABASE_URL, "Missing DATABASE_URL");

const config: Config = {
  schema: "./src/schemas/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
};

export default config;
