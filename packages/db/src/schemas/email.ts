import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { generateId } from "../utils"

export const emailStatusEnum = pgEnum("email_status", [
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "complained",
  "unsubscribed",
  "failed",
])

export const emailProviderEnum = pgEnum("email_provider", [
  "resend",
  "nodemailer",
  "ses",
  "sendgrid",
])

export const emails = pgTable(
  "emails",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),

    // Email identifiers
    providerId: varchar("provider_id", { length: 255 }), // External provider message ID
    messageId: varchar("message_id", { length: 255 }), // Internal message ID

    // Email content
    fromAddress: varchar("from_address", { length: 255 }).notNull(),
    toAddress: varchar("to_address", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 500 }).notNull(),
    templateName: varchar("template_name", { length: 100 }),

    // Sending details
    provider: emailProviderEnum("provider").notNull().default("nodemailer"),
    status: emailStatusEnum("status").notNull().default("queued"),

    // Tracking data
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    openedAt: timestamp("opened_at"),
    firstClickedAt: timestamp("first_clicked_at"),
    bouncedAt: timestamp("bounced_at"),
    complainedAt: timestamp("complained_at"),
    unsubscribedAt: timestamp("unsubscribed_at"),

    // Metrics
    openCount: varchar("open_count", { length: 10 }).default("0"),
    clickCount: varchar("click_count", { length: 10 }).default("0"),

    // Metadata
    metadata: json("metadata").$type<Record<string, any>>(),
    errorMessage: text("error_message"),
    tags: json("tags").$type<string[]>().default([]),

    // User association
    userId: varchar("user_id", { length: 30 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    providerIdIdx: index("emails_provider_id_idx").on(table.providerId),
    messageIdIdx: index("emails_message_id_idx").on(table.messageId),
    toAddressIdx: index("emails_to_address_idx").on(table.toAddress),
    statusIdx: index("emails_status_idx").on(table.status),
    userIdIdx: index("emails_user_id_idx").on(table.userId),
    createdAtIdx: index("emails_created_at_idx").on(table.createdAt),
  }),
)

export const emailEvents = pgTable(
  "email_events",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),

    emailId: varchar("email_id", { length: 30 })
      .references(() => emails.id, { onDelete: "cascade" })
      .notNull(),

    // Event details
    eventType: varchar("event_type", { length: 50 }).notNull(), // sent, delivered, opened, clicked, bounced, etc.
    timestamp: timestamp("timestamp").defaultNow().notNull(),

    // Additional event data
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 45 }),
    location: json("location").$type<{
      country?: string
      region?: string
      city?: string
    }>(),
    clickedUrl: text("clicked_url"),

    // Provider-specific data
    providerEventId: varchar("provider_event_id", { length: 255 }),
    providerData: json("provider_data").$type<Record<string, any>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdIdx: index("email_events_email_id_idx").on(table.emailId),
    eventTypeIdx: index("email_events_event_type_idx").on(table.eventType),
    timestampIdx: index("email_events_timestamp_idx").on(table.timestamp),
  }),
)

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),

    name: varchar("name", { length: 100 }).notNull().unique(),
    subject: varchar("subject", { length: 500 }).notNull(),

    // Template content
    htmlContent: text("html_content"),
    textContent: text("text_content"),

    // Settings
    isActive: boolean("is_active").default(true),
    tags: json("tags").$type<string[]>().default([]),

    // Metadata
    description: text("description"),
    version: varchar("version", { length: 20 }).default("1.0"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("email_templates_name_idx").on(table.name),
    isActiveIdx: index("email_templates_is_active_idx").on(table.isActive),
  }),
)

// Relations
export const emailsRelations = relations(emails, ({ many }) => ({
  events: many(emailEvents),
}))

export const emailEventsRelations = relations(emailEvents, ({ one }) => ({
  email: one(emails, {
    fields: [emailEvents.emailId],
    references: [emails.id],
  }),
}))

// Types
export type Email = typeof emails.$inferSelect
export type NewEmail = typeof emails.$inferInsert
export type EmailEvent = typeof emailEvents.$inferSelect
export type NewEmailEvent = typeof emailEvents.$inferInsert
export type EmailTemplate = typeof emailTemplates.$inferSelect
export type NewEmailTemplate = typeof emailTemplates.$inferInsert
