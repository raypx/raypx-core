import { execSync } from "node:child_process"
import { join } from "node:path"

const root = join(__dirname, "..")

execSync("bun biome check --write", { cwd: root })
