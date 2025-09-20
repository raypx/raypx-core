import { pgTableCreator } from "drizzle-orm/pg-core";

const prefix = process.env.DATABASE_PREFIX || "";

export const pgTable = pgTableCreator((name) => `${prefix}${name}`);
