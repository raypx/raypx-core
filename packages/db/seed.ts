import { reset, seed } from "drizzle-seed"
import { db } from "./src"
import * as schemas from "./src/schemas"

async function main() {
  await reset(db, schemas)
  await seed(db, schemas, {
    count: 100,
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
