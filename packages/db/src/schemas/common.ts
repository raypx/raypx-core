import { text, uuid } from "drizzle-orm/pg-core"
import { pgTable } from "./_table"

export type {
  PgColumn,
  PgTableWithColumns,
} from "drizzle-orm/pg-core"

export const page = pgTable("Page", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
})
