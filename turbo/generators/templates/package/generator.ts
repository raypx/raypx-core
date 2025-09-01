import { execSync } from "node:child_process"
import type { PlopTypes } from "@turbo/gen"

const PREFIX = "@raypx/"
const NPM_REGISTRY_URL = "https://registry.npmjs.org"
const LOCATIONS = ["packages", "packages/auth", "packages/features"] as const

interface PackageAnswers {
  name: string
  location: (typeof LOCATIONS)[number]
  deps: string
}

interface NpmPackageInfo {
  latest: string
  [key: string]: string
}

/**
 * Sanitizes the package name by removing the prefix if present
 */
function sanitizePackageName(name: string): string {
  return name.startsWith(PREFIX) ? name.replace(PREFIX, "") : name
}

/**
 * Fetches the latest version of a package from npm registry with timeout
 */
async function fetchPackageVersion(packageName: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

  try {
    const response = await fetch(
      `${NPM_REGISTRY_URL}/-/package/${encodeURIComponent(packageName)}/dist-tags`,
      { signal: controller.signal },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Package "${packageName}" not found on npm registry`)
        return "*"
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = (await response.json()) as NpmPackageInfo
    return data.latest || "*"
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn(`Timeout fetching version for "${packageName}", using "*"`)
      } else {
        console.warn(
          `Failed to fetch version for "${packageName}": ${error.message}`,
        )
      }
    }
    return "*"
  }
}

/**
 * Processes dependencies and adds them to package.json
 */
async function processDependencies(
  content: string,
  deps: string,
): Promise<string> {
  const pkg = JSON.parse(content)
  pkg.dependencies ??= {}

  const dependencies = deps
    .split(" ")
    .map((dep) => dep.trim())
    .filter(Boolean)

  if (dependencies.length === 0) {
    return JSON.stringify(pkg, null, 2)
  }

  const dependencyPromises = dependencies.map(async (dep) => {
    const version = await fetchPackageVersion(dep)
    return { name: dep, version }
  })

  const resolvedDeps = await Promise.all(dependencyPromises)

  for (const { name, version } of resolvedDeps) {
    pkg.dependencies[name] = `^${version}`
  }

  return JSON.stringify(pkg, null, 2)
}

/**
 * Runs shell commands with proper error handling
 */
function runCommand(command: string, description: string): void {
  try {
    console.log(`Running: ${command}`)
    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
      timeout: 300000, // 5 minute timeout
    })
    console.log(`✓ Successfully completed: ${description}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`✗ Failed to ${description}`)
    console.error(`Command: ${command}`)
    console.error(`Error: ${errorMessage}`)
    throw new Error(`Failed to ${description}: ${errorMessage}`)
  }
}

export function createPackageGenerator(plop: PlopTypes.NodePlopAPI) {
  plop.setGenerator("package", {
    description: "Generate a new package for the Monorepo",
    prompts: [
      {
        type: "list",
        name: "location",
        message: "Where would you like to create the package?",
        choices: LOCATIONS.map((location) => ({
          name: location,
          value: location,
        })),
        default: LOCATIONS[0],
      },
      {
        type: "input",
        name: "name",
        message: `What is the name of the package? (You can skip the \`${PREFIX}\` prefix)`,
        validate: (input: string) => {
          const trimmed = input.trim()
          if (!trimmed) {
            return "Package name is required"
          }

          const sanitized = trimmed.replace(PREFIX, "")
          if (!/^[a-z0-9-]+$/.test(sanitized)) {
            return "Package name must contain only lowercase letters, numbers, and hyphens"
          }

          if (sanitized.length < 2) {
            return "Package name must be at least 2 characters long"
          }

          if (sanitized.startsWith("-") || sanitized.endsWith("-")) {
            return "Package name cannot start or end with a hyphen"
          }

          return true
        },
      },
      {
        type: "input",
        name: "deps",
        message: "Enter dependencies to install (space-separated, optional):",
        default: "",
        validate: (input: string) => {
          if (!input.trim()) return true

          const deps = input
            .split(" ")
            .map((d) => d.trim())
            .filter(Boolean)
          const invalidDeps = deps.filter(
            (dep) => !/^[@a-z0-9\-_./]+$/.test(dep),
          )

          if (invalidDeps.length > 0) {
            return `Invalid dependency names: ${invalidDeps.join(", ")}`
          }

          return true
        },
      },
    ],
    actions: [
      // Sanitize package name
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          answers.name = sanitizePackageName(answers.name)
        }
        return "Package name sanitized"
      },
      // Create package.json
      {
        type: "add",
        path: "{{ location }}/{{ name }}/package.json",
        templateFile: "templates/package/package.json.hbs",
      },
      // Create tsconfig.json
      {
        type: "add",
        path: "{{ location }}/{{ name }}/tsconfig.json",
        templateFile: "templates/package/tsconfig.json.hbs",
      },
      // Create src/index.ts
      {
        type: "add",
        path: "{{ location }}/{{ name }}/src/index.ts",
        templateFile: "templates/package/index.ts.hbs",
      },
      // Create envs.ts
      {
        type: "add",
        path: "{{ location }}/{{ name }}/src/envs.ts",
        templateFile: "templates/package/envs.ts.hbs",
      },
      // Create server.ts
      {
        type: "add",
        path: "{{ location }}/{{ name }}/src/server.ts",
        templateFile: "templates/package/server.ts.hbs",
      },
      // Process dependencies
      {
        type: "modify",
        path: "{{ location }}/{{ name }}/package.json",
        async transform(content: string, answers: PackageAnswers) {
          const deps =
            "deps" in answers && typeof answers.deps === "string"
              ? answers.deps
              : ""
          return await processDependencies(content, deps)
        },
      },
      // Install dependencies and format
      async (answers) => {
        try {
          const packageName =
            "name" in answers && typeof answers.name === "string"
              ? answers.name
              : "unknown"
          const location =
            "location" in answers && typeof answers.location === "string"
              ? answers.location
              : "packages"
          console.log(`\n🚀 Finalizing package setup for "${packageName}"...\n`)

          runCommand("pnpm install", "install dependencies")
          runCommand("pnpm run format", "format code")

          console.log(`\n✨ Package "${packageName}" scaffolded successfully!`)
          console.log(`📁 Location: ${location}/${packageName}`)

          return `Package "${packageName}" created successfully`
        } catch (error) {
          console.error("\n❌ Failed to complete package setup:", error)
          throw error
        }
      },
    ],
  })
}
