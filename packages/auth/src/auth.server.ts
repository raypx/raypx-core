import { db, nanoid, schemas, uuidv7 } from "@raypx/db"
import {
  ResetPasswordEmail,
  SendMagicLinkEmail,
  SendVerificationOTP,
  sendEmail,
  VerifyEmail,
  WelcomeEmail,
} from "@raypx/email"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import {
  admin,
  apiKey,
  emailOTP,
  magicLink,
  mcp,
  oneTap,
  organization,
  username,
} from "better-auth/plugins"
import { socialProviders } from "./core/lib/providers/shared-providers"
import { envs } from "./envs"
import { authFeatures } from "./features"
import {
  ac,
  admin as adminRole,
  superadmin as superAdminRole,
  user as userRole,
} from "./permissions"

// Build plugins array based on enabled features
const buildServerPlugins = () => {
  const plugins = []

  // Always include basic plugins
  plugins.push(
    username(),
    mcp({
      loginPage: "/signin",
    }),
  )

  // Add feature-specific plugins
  if (authFeatures.apiKey) {
    plugins.push(apiKey())
  }

  // Magic Link
  if (authFeatures.magicLink) {
    plugins.push(
      magicLink({
        sendMagicLink: async ({ email, token, url }) => {
          await sendEmail({
            subject: "Magic Link",
            template: SendMagicLinkEmail({
              username: email,
              url,
              token,
            }),
            to: email,
          })
        },
      }),
    )
  }

  // One Tap
  if (authFeatures.oneTap) {
    plugins.push(oneTap())
  }

  // Organization
  if (authFeatures.organization) {
    plugins.push(
      admin({
        defaultRole: "user",
        adminRoles: ["admin", "superadmin"],
        ac,
        roles: {
          user: userRole,
          admin: adminRole,
          superadmin: superAdminRole,
        },
      }),
      organization(),
    )
  }

  // Email OTP
  if (authFeatures.emailOTP) {
    plugins.push(
      emailOTP({
        sendVerificationOTP: async (data, _request) => {
          const { email, otp } = data
          sendEmail({
            to: email,
            subject: "Verify your email",
            template: SendVerificationOTP({
              otp,
            }),
          })
        },
      }),
    )
  }

  return plugins
}

const createConfig = (): BetterAuthOptions => {
  const env = envs()

  return {
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          template: ResetPasswordEmail({
            resetLink: url,
            username: user.name || user.email,
          }),
        })
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ url, user }) => {
        await sendEmail({
          subject: "Verify your email",
          template: VerifyEmail({
            url,
            username: user.email,
          }),
          to: user.email,
        })
      },
    },
    baseURL: env.NEXT_PUBLIC_AUTH_URL,
    socialProviders,
    trustedOrigins: (req) =>
      [
        req.headers.get("origin") ?? "",
        req.headers.get("referer") ?? "",
      ].filter(Boolean) as string[],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schemas,
    }),
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
      crossSubDomainCookies: {
        enabled: !!env.AUTH_DOMAIN,
        domain: env.AUTH_DOMAIN,
      },
      cookiePrefix: "auth",
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const name =
              user.name?.trim() || user.email?.split("@")[0] || nanoid()
            const image =
              user.image || `https://ui-avatars.com/api/?name=${name}`

            return {
              data: {
                name,
                image,
              },
            }
          },
          after: async (user) => {
            await sendEmail({
              subject: "Welcome to Raypx",
              template: WelcomeEmail({
                username: user.name || user.email,
              }),
              to: user.email,
            })
          },
        },
      },
    },
    logger: {
      disabled: false,
      level: "debug",
    },
    plugins: buildServerPlugins(),
  }
}

const config: BetterAuthOptions = createConfig()

export const auth = betterAuth(config)

export type Auth = typeof auth
