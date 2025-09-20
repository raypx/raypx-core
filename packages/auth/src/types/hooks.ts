import type { BetterFetchError } from "@better-fetch/fetch";
import type { User } from "better-auth";
import type { Member } from "better-auth/plugins/organization";
import type { AnyAuthClient, ApiKey, AuthClient, Invitation, Refetch } from "./core";

type AnyAuthSession = AnyAuthClient["$Infer"]["Session"];

type AuthHook<T> = {
  isPending: boolean;
  data?: T | null;
  error?: BetterFetchError | null;
  refetch?: Refetch;
};

export type AuthHooks = {
  useSession: () => ReturnType<AnyAuthClient["useSession"]>;
  useListAccounts: () => AuthHook<{ accountId: string; provider: string }[]>;
  useAccountInfo: (params: Parameters<AuthClient["accountInfo"]>[0]) => AuthHook<{ user: User }>;
  useListDeviceSessions: () => AuthHook<AnyAuthClient["$Infer"]["Session"][]>;
  useListSessions: () => AuthHook<AnyAuthSession["session"][]>;
  useListPasskeys: () => Partial<ReturnType<AuthClient["useListPasskeys"]>>;
  useListApiKeys: () => AuthHook<ApiKey[]>;
  useActiveOrganization: () => Partial<ReturnType<AuthClient["useActiveOrganization"]>>;
  useListOrganizations: () => Partial<ReturnType<AuthClient["useListOrganizations"]>>;
  useHasPermission: (
    params: Parameters<AuthClient["organization"]["hasPermission"]>[0],
  ) => AuthHook<{
    error: null;
    success: boolean;
  }>;
  useInvitation: (params: Parameters<AuthClient["organization"]["getInvitation"]>[0]) => AuthHook<
    Invitation & {
      organizationName: string;
      organizationSlug: string;
      organizationLogo?: string;
    }
  >;
  useListInvitations: (
    params: Parameters<AuthClient["organization"]["listInvitations"]>[0],
  ) => AuthHook<Invitation[]>;
  useListUserInvitations: () => AuthHook<Invitation[]>;
  useListMembers: (params: Parameters<AuthClient["organization"]["listMembers"]>[0]) => AuthHook<{
    members: (Member & { user?: Partial<User> | null })[];
    total: number;
  }>;
  useIsRestoring?: () => boolean;
  useLastUsedLoginMethod: () => {
    isLastUsedLoginMethod: (method: string) => boolean;
    clearLastUsedLoginMethod: () => void;
    getLastUsedLoginMethod: () => string | null;
  };
};

type MutateFn<T = Record<string, unknown>> = (params: T) => Promise<unknown> | Promise<void>;

export interface AuthMutators {
  deleteApiKey: MutateFn<{ keyId: string }>;
  deletePasskey: MutateFn<{ id: string }>;
  revokeDeviceSession: MutateFn<{ sessionToken: string }>;
  revokeSession: MutateFn<{ token: string }>;
  setActiveSession: MutateFn<{ sessionToken: string }>;
  updateOrganization: MutateFn<{
    organizationId: string;
    data: Record<string, unknown>;
  }>;
  updateUser: MutateFn;
  unlinkAccount: MutateFn<{ providerId: string; accountId?: string }>;
}
