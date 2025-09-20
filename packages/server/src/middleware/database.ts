import { db } from "@raypx/db";
import type { Context, Next } from "hono";
import type { Variables } from "../types";

/**
 * Database middleware that injects database instance into context
 */
export const databaseMiddleware = async (c: Context<{ Variables: Variables }>, next: Next) => {
  c.set("db", db);
  await next();
};
