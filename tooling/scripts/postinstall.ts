import { execSync } from "node:child_process"
import { join } from "node:path"
import deepmerge from "deepmerge"
import fs from "fs-extra"
import { Listr } from "listr2"

const CLAUDE_DIR = ".claude"
const SETTINGS_FILE = "settings.json"
const LOCAL_SETTINGS_FILE = "settings.local.json"

const mergeOptions = {
  arrayMerge: (target: unknown[], source: unknown[]) => [
    ...new Set([...target, ...source]),
  ],
}

export default async function postinstall() {
  const tasks = new Listr(
    [
      {
        title: "Biome migration",
        task: () => {
          execSync("pnpm biome migrate --write", {
            stdio: ["ignore", "ignore", "inherit"],
          })
        },
      },
      {
        title: "Fumadocs MDX processing",
        task: () => {
          execSync("pnpm --filter docs run fumadocs-mdx", {
            stdio: ["ignore", "ignore", "inherit"],
          })
        },
      },
      {
        title: "Claude Code setup",
        task: async (_, task) => {
          const settingsPath = join(CLAUDE_DIR, SETTINGS_FILE)
          const localSettingsPath = join(CLAUDE_DIR, LOCAL_SETTINGS_FILE)

          if (!(await fs.pathExists(settingsPath))) {
            task.skip("No settings found")
            return
          }

          const baseSettings = await fs.readJson(settingsPath)

          if (!(await fs.pathExists(localSettingsPath))) {
            await fs.writeJson(localSettingsPath, baseSettings, { spaces: 2 })
            task.title = "Created local settings"
          } else {
            const localSettings = await fs.readJson(localSettingsPath)
            const merged = deepmerge(baseSettings, localSettings, mergeOptions)
            await fs.writeJson(localSettingsPath, merged, { spaces: 2 })
            task.title = "Updated local settings"
          }
        },
      },
    ],
    {
      concurrent: true,
      exitOnError: false,
      renderer: "simple",
    },
  )

  try {
    await tasks.run()
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}
