export { alias } from "drizzle-orm/pg-core"
export * from "drizzle-orm/sql"

import { createClient } from "./adapters/postgres"
import { envs } from "./envs"
import * as schemas from "./schemas"

export * from "./query"
export * from "./utils"

const env = envs()

export const db = createClient<typeof schemas>({
  databaseUrl: env.DATABASE_URL,
  schema: schemas,
})

export type Database = typeof db

export { schemas }
export type {
  AnyColumn,
  SQL,
} from "drizzle-orm"
export type {
  PgColumn,
  PgTable,
  PgTableWithColumns,
  TableConfig,
  TableLikeHasEmptySelection,
} from "drizzle-orm/pg-core"
