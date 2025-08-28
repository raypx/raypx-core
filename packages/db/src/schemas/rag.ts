import {
  index,
  integer,
  jsonb,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core"
import { pgTable } from "./_table"
import { user } from "./auth"

export const timestamptz = (name: string) =>
  timestamp(name, {
    withTimezone: true,
  })

export const knowledges = pgTable(
  "knowledges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    settings: jsonb("settings"),
    userId: uuid("user_id")
      .references(() => user.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_knowledges_user_id").on(table.userId),
    index("idx_knowledges_status").on(table.status),
  ],
)

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer("size").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("processing"),
    metadata: jsonb("metadata"),
    knowledgeBaseId: uuid("knowledge_base_id")
      .references(() => knowledges.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: uuid("user_id")
      .references(() => user.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_documents_knowledge_base_id").on(table.knowledgeBaseId),
    index("idx_documents_user_id").on(table.userId),
    index("idx_documents_status").on(table.status),
  ],
)

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    text: text("text"),
    abstract: text("abstract"),
    metadata: jsonb("metadata"),
    index: integer("index"),
    type: varchar("type"),
    clientId: text("client_id"),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "cascade",
    }),
    knowledgeBaseId: uuid("knowledge_base_id").references(() => knowledges.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
    accessedAt: timestamptz("accessed_at").notNull().defaultNow(),
  },
  (t) => [
    unique("chunks_client_id_user_id_unique").on(t.clientId, t.userId),
    index("idx_chunks_document_id").on(t.documentId),
    index("idx_chunks_knowledge_base_id").on(t.knowledgeBaseId),
    index("idx_chunks_user_id").on(t.userId),
    index("idx_chunks_knowledge_base_id_user_id").on(
      t.knowledgeBaseId,
      t.userId,
    ),
  ],
)

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chunkId: uuid("chunk_id")
      .references(() => chunks.id, {
        onDelete: "cascade",
      })
      .unique(),
    embeddings: vector("embeddings", {
      dimensions: 1024,
    }),
    model: text("model"),
    clientId: text("client_id"),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [
    unique("embeddings_client_id_user_id_unique").on(t.clientId, t.userId),
    index("idx_embeddings_chunk_id").on(t.chunkId),
    index("idx_embeddings_user_id").on(t.userId),
  ],
)
