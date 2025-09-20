import { Listr, type ListrTask, PRESET_TIMER } from "listr2";
import { formatDuration } from "./utils";

async function cli(name: string, args: string[]) {
  const scriptModule = await import(`./${name}.ts`);
  const fn = scriptModule?.default;

  if (!fn) {
    console.error(`raypx-scripts ${name} not found`);
    process.exit(1);
  }

  try {
    const startTime = Date.now();

    // Execute script function and get result
    const result = await fn(...args);

    let tasks: ListrTask[];

    // Check if script returns task array (new format)
    if (Array.isArray(result)) {
      // New format: script returns task definition array
      tasks = [
        {
          title: `${name} script`,
          task: (_, parentTask) => {
            return parentTask.newListr(result as ListrTask[], {
              concurrent: false,
              exitOnError: false,
              rendererOptions: {
                collapseSubtasks: false,
                timer: PRESET_TIMER,
                showTimer: true,
              },
            });
          },
        },
      ];
    } else {
      // Legacy format compatibility: script executes directly
      tasks = [
        {
          title: `Executing ${name}`,
          task: () => result,
        },
      ];
    }

    const listr = new Listr(tasks, {
      concurrent: false,
      exitOnError: false,
      renderer: "default",
      rendererOptions: {
        timer: PRESET_TIMER,
        showTimer: true,
      },
    });

    await listr.run();

    const totalTime = Date.now() - startTime;
    console.log(`\nScript completed in ${formatDuration(totalTime)}`);
  } catch (error: any) {
    console.error(`raypx-scripts ${name} error:`, error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    process.exit(1);
  }
}

export default cli;
