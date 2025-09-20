import type { ListrTask } from "listr2";
import { createSafeTask, createTask, setupClaudeCode } from "./utils";

function createClaudeCodeTask(title: string): ListrTask {
  return createTask(title, async (_, task) => {
    await setupClaudeCode(task);
  });
}

export default function postinstall(): ListrTask[] {
  return [
    createSafeTask(
      "Biome migration",
      "Biome migration completed",
      "Biome migration failed",
      "pnpm biome migrate --write",
    ),
    createSafeTask(
      "Fumadocs MDX processing",
      "MDX processing completed",
      "MDX processing failed",
      "pnpm --filter docs run fumadocs-mdx",
    ),
    createClaudeCodeTask("Claude Code setup"),
  ];
}
