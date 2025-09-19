import { execSync } from "node:child_process"
import { join } from "node:path"

import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const root = join(__dirname, "..")

export default function format() {
  execSync("pnpm exec biome check --write", { cwd: root })
}
