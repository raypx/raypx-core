import { execSync } from "node:child_process"

execSync("pnpm biome migrate --write")
