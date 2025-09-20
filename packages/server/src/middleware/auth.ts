import { auth } from "@raypx/auth/server";
import type { Context, Next } from "hono";
import type { Variables } from "../types";

/**
 * Authentication middleware that injects session and user into context
 */
export const authMiddleware = async (c: Context<{ Variables: Variables }>, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("session", session.session as Variables["session"]);
    c.set("user", session.user as Variables["user"]);
  }

  return next();
};
