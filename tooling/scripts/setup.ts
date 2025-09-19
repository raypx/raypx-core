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

export default async function setup() {
  console.log("🚀 Setting up development environment...")

  const tasks = new Listr(
    [
      {
        title: "Environment configuration",
        task: async (_, task) => {
          if (
            !(await fs.pathExists(".env")) &&
            (await fs.pathExists(".env.example"))
          ) {
            await fs.copy(".env.example", ".env")
            task.title = "✅ Created .env from template"
          } else {
            task.skip(".env already exists")
          }
        },
      },
      {
        title: "Git hooks installation",
        task: (_, task) => {
          try {
            execSync("pnpm exec husky", {
              stdio: ["ignore", "ignore", "inherit"],
            })
            task.title = "✅ Git hooks installed"
          } catch {
            task.skip("Husky installation failed")
          }
        },
      },
      {
        title: "Claude Code configuration",
        task: async (_, task) => {
          const settingsPath = join(CLAUDE_DIR, SETTINGS_FILE)
          const localSettingsPath = join(CLAUDE_DIR, LOCAL_SETTINGS_FILE)

          if (!(await fs.pathExists(settingsPath))) {
            task.skip("No Claude settings template found")
            return
          }

          const baseSettings = await fs.readJson(settingsPath)

          if (!(await fs.pathExists(localSettingsPath))) {
            await fs.writeJson(localSettingsPath, baseSettings, { spaces: 2 })
            task.title = "✅ Created Claude Code settings"
          } else {
            const localSettings = await fs.readJson(localSettingsPath)
            const merged = deepmerge(baseSettings, localSettings, mergeOptions)
            await fs.writeJson(localSettingsPath, merged, { spaces: 2 })
            task.title = "✅ Updated Claude Code settings"
          }
        },
      },
      {
        title: "Dependencies verification",
        task: (_, task) => {
          try {
            execSync("pnpm install --frozen-lockfile", {
              stdio: ["ignore", "ignore", "inherit"],
            })
            task.title = "✅ Dependencies verified"
          } catch {
            task.skip("Dependencies check failed")
          }
        },
      },
    ],
    {
      concurrent: false,
      exitOnError: false,
      renderer: "default",
    },
  )

  try {
    await tasks.run()
    console.log("\n🎉 Development environment setup complete!")
    console.log("💡 Run 'pnpm dev' to start development")
  } catch (error) {
    console.error("\n❌ Setup failed:", error)
    process.exit(1)
  }
}
