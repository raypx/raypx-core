#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

const SRC_LOCALES_DIR = path.join(process.cwd(), "src-locales")
const OUTPUT_DIR = path.join(process.cwd(), "locales")

interface LocaleData {
  [key: string]: any
}

/**
 * Merge locale files from src-locales into single locale files
 */
async function buildLocales() {
  console.log("🌐 Building locale files...")

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Get all locale directories (en, zh, etc.)
  const localeDirectories = fs
    .readdirSync(SRC_LOCALES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  console.log(`📁 Found locales: ${localeDirectories.join(", ")}`)

  for (const locale of localeDirectories) {
    const localeDir = path.join(SRC_LOCALES_DIR, locale)
    const mergedData: LocaleData = {}

    // Get all JSON files in the locale directory
    const jsonFiles = fs
      .readdirSync(localeDir)
      .filter((file) => file.endsWith(".json"))
      .sort() // Ensure consistent order

    console.log(`📄 Processing ${locale}: ${jsonFiles.join(", ")}`)

    for (const jsonFile of jsonFiles) {
      const filePath = path.join(localeDir, jsonFile)
      const namespace = path.basename(jsonFile, ".json")

      try {
        const fileContent = fs.readFileSync(filePath, "utf-8")
        const parsedContent = JSON.parse(fileContent)

        // Merge content under namespace key
        mergedData[namespace] = parsedContent

        console.log(
          `  ✅ Merged ${namespace} (${Object.keys(parsedContent).length} keys)`,
        )
      } catch (error) {
        console.error(`  ❌ Error processing ${jsonFile}:`, error)
        process.exit(1)
      }
    }

    // Write merged locale file
    const outputFile = path.join(OUTPUT_DIR, `${locale}.json`)
    fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2), "utf-8")

    const totalKeys = Object.keys(mergedData).reduce(
      (acc, ns) => acc + Object.keys(mergedData[ns]).length,
      0,
    )
    console.log(
      `📝 Generated ${locale}.json (${Object.keys(mergedData).length} namespaces, ${totalKeys} total keys)`,
    )
  }

  console.log("✨ Locale files built successfully!")
}

/**
 * Watch mode for development
 */
function watchLocales() {
  console.log("👀 Watching locale files for changes...")

  fs.watch(SRC_LOCALES_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".json")) {
      console.log(`📝 File changed: ${filename}, rebuilding...`)
      buildLocales().catch(console.error)
    }
  })
}

// CLI interface
const args = process.argv.slice(2)
const isWatchMode = args.includes("--watch") || args.includes("-w")

if (isWatchMode) {
  buildLocales()
    .then(() => watchLocales())
    .catch(console.error)
} else {
  buildLocales().catch(console.error)
}
