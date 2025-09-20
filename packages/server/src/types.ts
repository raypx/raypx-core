import type { Session, User } from "@raypx/auth/client";
import type { Database } from "@raypx/db";

export interface ServerOptions {
  prefix: string;
}

export type Variables = {
  db: Database;
  session?: Session;
  user?: User;
};
