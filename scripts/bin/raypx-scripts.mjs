#!/usr/bin/env node

import assert from "node:assert"
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import chalk from "chalk"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const argv = process.argv.slice(2)
const [name, ...throughArgs] = argv
const scriptsPath = join(__dirname, `../${name}.ts`)

assert(
  existsSync(scriptsPath) && !name.startsWith("."),
  `Executed script '${chalk.red(name)}' does not exist`,
)

console.log(chalk.cyan(`raypx-scripts: ${name}\n`))

const quotedScriptPath = JSON.stringify(scriptsPath)

const command = [
  "bun run",
  quotedScriptPath,
  ...throughArgs.map((arg) => JSON.stringify(arg)),
].join(" ")

try {
  execSync(command, {
    env: {
      ...process.env,
      NODE_NO_WARNINGS: "1",
    },
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
  })
} catch (error) {
  console.error(chalk.red(`raypx-scripts: ${name} execution failed`))
  if (error instanceof Error) {
    // Print error message if available
    if (error.message) {
      console.error(chalk.red(error.message))
    }
    // Print stdout/stderr if available
    if ("stdout" in error && error.stdout) {
      process.stdout.write(error.stdout.toString())
    }
    if ("stderr" in error && error.stderr) {
      process.stderr.write(error.stderr.toString())
    }
  } else {
    // Fallback for unknown error types
    console.error(error)
  }
  process.exit(typeof error?.code === "number" ? error.code : 1)
}
