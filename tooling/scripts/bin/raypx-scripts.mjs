#!/usr/bin/env node

import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import "tsx"

const cli = (await import("../cli")).default

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const [name, ...args] = process.argv.slice(2)
const scriptsPath = join(__dirname, `../${name}.ts`)

if (!name || !existsSync(scriptsPath) || name.startsWith(".")) {
  console.error(`Script '${name}' does not exist`)
  process.exit(1)
}

try {
  cli(name, args)
} catch (error) {
  process.exit(error.status || 1)
}
