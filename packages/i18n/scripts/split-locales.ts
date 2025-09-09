#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

const LOCALES_DIR = path.join(process.cwd(), "locales")
const SRC_LOCALES_DIR = path.join(process.cwd(), "src-locales")

interface LocaleData {
  [namespace: string]: any
}

/**
 * Split existing merged locale files back into namespace files
 * Useful for migrating existing locale files to the new structure
 */
async function splitLocales() {
  console.log("🔄 Splitting locale files into namespaces...")

  // Ensure src-locales directory exists
  if (!fs.existsSync(SRC_LOCALES_DIR)) {
    fs.mkdirSync(SRC_LOCALES_DIR, { recursive: true })
  }

  // Get all locale files (en.json, zh.json, etc.)
  const localeFiles = fs
    .readdirSync(LOCALES_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()

  console.log(`📁 Found locale files: ${localeFiles.join(", ")}`)

  for (const localeFile of localeFiles) {
    const locale = path.basename(localeFile, ".json")
    const localeFilePath = path.join(LOCALES_DIR, localeFile)
    const outputDir = path.join(SRC_LOCALES_DIR, locale)

    // Create locale directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    try {
      const fileContent = fs.readFileSync(localeFilePath, "utf-8")
      const localeData: LocaleData = JSON.parse(fileContent)

      console.log(`📄 Processing ${locale}...`)

      // Split each namespace into separate files
      for (const [namespace, namespaceData] of Object.entries(localeData)) {
        const namespacePath = path.join(outputDir, `${namespace}.json`)
        fs.writeFileSync(
          namespacePath,
          JSON.stringify(namespaceData, null, 2),
          "utf-8",
        )

        const keyCount =
          typeof namespaceData === "object"
            ? Object.keys(namespaceData).length
            : 1
        console.log(`  ✅ Created ${namespace}.json (${keyCount} keys)`)
      }

      console.log(
        `📝 Split ${locale} into ${Object.keys(localeData).length} namespace files`,
      )
    } catch (error) {
      console.error(`❌ Error processing ${localeFile}:`, error)
      process.exit(1)
    }
  }

  console.log("✨ Locale files split successfully!")
  console.log(
    `💡 You can now edit files in src-locales/ and run 'pnpm build:locales' to rebuild`,
  )
}

splitLocales().catch(console.error)
