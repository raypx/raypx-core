import { type ExecSyncOptions, execSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import deepmerge from "deepmerge";
import fs from "fs-extra";
import type { ListrTask } from "listr2";

// Path utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = resolve(__dirname, "../../../");

// Timing utilities
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function createTask(title: string, taskFn: ListrTask["task"]): ListrTask {
  return {
    title,
    task: taskFn,
  };
}

// Execution utilities
export const SILENT_EXEC_OPTIONS: ExecSyncOptions = {
  stdio: ["ignore", "ignore", "inherit"],
};

export function safeExec(command: string, options: ExecSyncOptions = SILENT_EXEC_OPTIONS): boolean {
  try {
    execSync(command, { cwd: PROJECT_ROOT, ...options });
    return true;
  } catch {
    return false;
  }
}

export function createSafeTask(
  title: string,
  successTitle: string,
  failureMessage: string,
  command: string,
  options: ExecSyncOptions = SILENT_EXEC_OPTIONS,
): ListrTask {
  return createTask(title, (_, task) => {
    if (safeExec(command, options)) {
      task.title = successTitle;
    } else {
      task.skip(failureMessage);
    }
  });
}

// Claude Code utilities
export const CLAUDE_DIR = ".claude";
export const SETTINGS_FILE = "settings.json";
export const LOCAL_SETTINGS_FILE = "settings.local.json";

export const mergeOptions = {
  arrayMerge: (target: unknown[], source: unknown[]) => [...new Set([...target, ...source])],
};

export async function setupClaudeCode(task: TaskInstance): Promise<void> {
  const settingsPath = join(CLAUDE_DIR, SETTINGS_FILE);
  const localSettingsPath = join(CLAUDE_DIR, LOCAL_SETTINGS_FILE);

  if (!(await fs.pathExists(settingsPath))) {
    task.skip("No Claude settings template found");
    return;
  }

  const baseSettings = await fs.readJson(settingsPath);

  if (!(await fs.pathExists(localSettingsPath))) {
    await fs.writeJson(localSettingsPath, baseSettings, { spaces: 2 });
    task.title = "Created local settings file";
  } else {
    const localSettings = await fs.readJson(localSettingsPath);
    const merged = deepmerge(baseSettings, localSettings, mergeOptions);
    await fs.writeJson(localSettingsPath, merged, { spaces: 2 });
    task.title = "Merged settings with local configuration";
  }
}
