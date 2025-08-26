import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

export const createClient = <TSchema extends Record<string, unknown>>({
  databaseUrl,
  schema,
}: {
  databaseUrl: string
  schema: TSchema
}) => {
  const sql = neon(databaseUrl)
  return drizzle({
    client: sql,
    schema,
    casing: "snake_case",
    logger: true,
  })
}
