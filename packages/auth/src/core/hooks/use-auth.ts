import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../../components/core/auth-provider";

/**
 * Hook to access the authentication context
 *
 * @returns {AuthContextType} The authentication context containing:
 * - authClient: Better Auth client instance
 * - hooks: Authentication-related hooks (useSession, useListAccounts, etc.)
 * - mutators: Functions for updating auth data
 * - toast: Toast notification function
 * - localization: Localized strings for auth UI
 * - viewPaths: Configured paths for auth views
 * - navigate/replace: Navigation functions
 * - Various configuration options (avatar, organization, etc.)
 *
 * @example
 * ```tsx
 * const { authClient, hooks, toast } = useAuth()
 * const { data: session } = hooks.useSession()
 *
 * const handleSignOut = () => {
 *   authClient.signOut()
 *   toast({ message: "Signed out successfully" })
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const auth = useContext(AuthContext);
  return auth;
}
