"use client";

import type { ReactNode } from "react";
import { useAuth } from "../../core/hooks/use-auth";

/**
 * Conditionally renders content for unauthenticated users only
 *
 * Renders its children only when no user is authenticated and the authentication
 * state is not pending. If a session exists or is being loaded, nothing is rendered.
 * Useful for displaying sign-in prompts or content exclusive to guests.
 */
export function SignedOut({ children }: { children: ReactNode }) {
  const {
    hooks: { useSession },
  } = useAuth();
  const { data, isPending } = useSession();

  return !data && !isPending ? children : null;
}
