#!/usr/bin/env node

import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const [name, ...args] = process.argv.slice(2)
const scriptsPath = join(__dirname, `../${name}.ts`)

if (!name || !existsSync(scriptsPath) || name.startsWith(".")) {
  console.error(`Script '${name}' does not exist`)
  process.exit(1)
}

try {
  execSync(
    `pnpm exec tsx "${scriptsPath}" ${args.map((arg) => `"${arg}"`).join(" ")}`,
    {
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      stdio: "inherit",
    },
  )
} catch (error) {
  process.exit(error.status || 1)
}
