import type { BetterAuthOptions } from "better-auth";
import type { Get } from "type-fest";
import { envs } from "../../../envs";

const env = envs();

type SocialProviders = NonNullable<Get<BetterAuthOptions, "socialProviders">>;

export const socialProviders: SocialProviders = {
  github: {
    enabled: !!(
      env.AUTH_GITHUB_ID &&
      env.AUTH_GITHUB_SECRET &&
      env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true"
    ),
    clientId: env.AUTH_GITHUB_ID ?? "",
    clientSecret: env.AUTH_GITHUB_SECRET ?? "",
  },
  google: {
    enabled: !!(
      env.AUTH_GOOGLE_ID &&
      env.AUTH_GOOGLE_SECRET &&
      env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true"
    ),
    clientId: env.AUTH_GOOGLE_ID ?? "",
    clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
  },
};

export const supportedSocials = Object.entries(socialProviders)
  .filter(([_, provider]) => provider.enabled)
  .map(([key]) => key);
