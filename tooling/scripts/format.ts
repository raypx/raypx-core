import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ListrTask } from "listr2";
import { createTask, SILENT_EXEC_OPTIONS, safeExec } from "./utils";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

function createFormatTask(): ListrTask {
  return createTask("Code formatting", (_, task) => {
    const options = { ...SILENT_EXEC_OPTIONS, cwd: root };
    const success = safeExec("pnpm exec biome check --write", options);

    if (success) {
      task.title = "Formatted code with Biome";
    } else {
      task.title = "Code formatting failed";
      throw new Error("Biome formatting failed");
    }
  });
}

export default function format(): ListrTask[] {
  return [createFormatTask()];
}
