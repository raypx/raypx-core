import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { uuidv7 } from "../utils"
import { pgTable } from "./_table"

export const user = pgTable(
  "user",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .$onUpdateFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    username: text("username").unique(),
    displayUsername: text("display_username"),
    role: text("role"),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
  },
  (table) => ({
    emailIdx: index("idx_user_email").on(table.email),
    usernameIdx: index("idx_user_username").on(table.username),
  }),
)

export const passkey = pgTable("passkey", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_id").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
  aaguid: text("aaguid"),
})

export const session = pgTable(
  "session",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdateFn(() => /* @__PURE__ */ new Date()),
    lastActive: timestamp("last_active")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => ({
    tokenIdx: index("idx_session_token").on(table.token),
    userIdIdx: index("idx_session_user_id").on(table.userId),
    expiresAtIdx: index("idx_session_expires_at").on(table.expiresAt),
  }),
)

export const account = pgTable("account", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
})

export const verification = pgTable("verification", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
})

export const apikey = pgTable(
  "apikey",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name"),
    start: text("start"),
    prefix: text("prefix"),
    key: text("key").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at"),
    enabled: boolean("enabled").default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true),
    rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
    rateLimitMax: integer("rate_limit_max").default(10),
    requestCount: integer("request_count"),
    remaining: integer("remaining"),
    lastRequest: timestamp("last_request"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdateFn(() => /* @__PURE__ */ new Date()),
    permissions: text("permissions"),
    metadata: text("metadata"),
  },
  (table) => ({
    userIdIdx: index("idx_apikey_user_id").on(table.userId),
    keyIdx: index("idx_apikey_key").on(table.key),
  }),
)

export const organization = pgTable("organization", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
  metadata: text("metadata"),
})

export const member = pgTable("member", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
})

export const invitation = pgTable("invitation", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: uuid("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const oauthApplication = pgTable("oauth_application", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name"),
  icon: text("icon"),
  metadata: text("metadata"),
  clientId: text("client_id").unique(),
  clientSecret: text("client_secret"),
  redirectURLs: text("redirect_u_r_ls"),
  type: text("type"),
  disabled: boolean("disabled"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
})

export const oauthAccessToken = pgTable("oauth_access_token", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  accessToken: text("access_token").unique(),
  refreshToken: text("refresh_token").unique(),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  clientId: text("client_id"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
})

export const oauthConsent = pgTable("oauth_consent", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  clientId: text("client_id"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => /* @__PURE__ */ new Date()),
  consentGiven: boolean("consent_given"),
})
