import { execSync } from "node:child_process"

execSync("bun biome migrate --write")
