import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const createClient = <TSchema extends Record<string, unknown>>({
  databaseUrl,
  schema,
}: {
  databaseUrl: string;
  schema: TSchema;
}) => {
  const client = postgres(databaseUrl, {
    prepare: true,
    keep_alive: 1000,
    debug: true,
  });
  return drizzle(client, {
    schema,
    casing: "snake_case",
    logger: true,
  });
};
