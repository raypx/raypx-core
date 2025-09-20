import type { ListrTask } from "listr2";
import { createSafeTask } from "./utils";

export default function setup(): ListrTask[] {
  return [
    createSafeTask(
      "Database migration",
      "Database migration completed",
      "Database migration failed",
      "pnpm --filter @raypx/db run db:migrate",
    ),
  ];
}
