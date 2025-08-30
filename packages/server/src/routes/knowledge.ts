import { chunks, documents, knowledges } from "@raypx/db/schemas"
import { createSelectSchema } from "drizzle-zod"
import { Hono, type MiddlewareHandler } from "hono"
import { describeRoute } from "hono-openapi"
import { resolver, validator as zValidator } from "hono-openapi/zod"
import { z } from "zod"
import { KnowledgeService } from "../services"
import type { Variables } from "../types"

const knowledgeService = new KnowledgeService()

const tags = ["Knowledge"]

export const knowledgeRoutes = new Hono<{ Variables: Variables }>()

// Validation schemas
const createKnowledgeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  settings: z.any().optional(),
})

const updateKnowledgeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  settings: z.any().optional(),
})

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

const chunksQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

const documentsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

const uploadDocumentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
})

// Middleware to ensure user is authenticated
const authMiddleware: MiddlewareHandler<{ Variables: Variables }> = async (
  c,
  next,
) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  await next()
}

// Apply auth middleware to all routes
knowledgeRoutes.use("*", authMiddleware)

// GET /knowledges - List knowledges with pagination and search
knowledgeRoutes.get(
  "/",
  describeRoute({
    description: "List knowledges with pagination and search",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(knowledges)),
          },
        },
      },
    },
  }),
  zValidator("query", listQuerySchema),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const options = c.req.valid("query")

      const result = await knowledgeService.getKnowledgeBases(user.id, options)

      return c.json({
        status: "ok",
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: options.limit,
          offset: options.offset,
        },
      })
    } catch (error) {
      console.error("Error fetching knowledges:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// GET /knowledges/:id - Get specific knowledge base
knowledgeRoutes.get(
  "/:id",
  describeRoute({
    description: "Get specific knowledge base by id",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(knowledges)),
          },
        },
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string().describe("The unique identifier for the knowledge base"),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const id = c.req.param("id")

      const knowledgeBase = await knowledgeService.getKnowledgeBase(id, user.id)

      return c.json({
        status: "ok",
        data: knowledgeBase,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Knowledge base not found"
      ) {
        return c.json({ error: "Knowledge base not found" }, 404)
      }
      console.error("Error fetching knowledge base:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// POST /knowledges - Create new knowledge base
knowledgeRoutes.post(
  "/",
  describeRoute({
    description: "Create new knowledge base",
    tags,
    responses: {
      201: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(knowledges)),
          },
        },
      },
    },
  }),
  zValidator("json", createKnowledgeSchema),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const data = c.req.valid("json")

      const knowledgeBase = await knowledgeService.createKnowledgeBase(
        user.id,
        data,
      )

      return c.json(
        {
          status: "ok",
          data: knowledgeBase,
        },
        201,
      )
    } catch (error) {
      console.error("Error creating knowledge base:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// PATCH /knowledges/:id - Update knowledge base
knowledgeRoutes.patch(
  "/:id",
  describeRoute({
    description: "Update knowledge base",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(knowledges)),
          },
        },
      },
    },
  }),
  zValidator("json", updateKnowledgeSchema),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const id = c.req.param("id")
      const data = c.req.valid("json")

      const knowledgeBase = await knowledgeService.updateKnowledgeBase(
        id,
        user.id,
        data,
      )

      return c.json({
        status: "ok",
        data: knowledgeBase,
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ error: "Knowledge base not found" }, 404)
      }
      console.error("Error updating knowledge base:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// DELETE /knowledges/:id - Delete knowledge base
knowledgeRoutes.delete(
  "/:id",
  describeRoute({
    description: "Delete knowledge by id",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                status: z.literal("ok"),
                message: z.string().describe("The message of the response"),
              }),
            ),
          },
        },
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string().describe("The unique identifier for the knowledge base"),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const id = c.req.param("id")

      await knowledgeService.deleteKnowledgeBase(id, user.id)

      return c.json({
        status: "ok",
        message: "Knowledge base deleted successfully",
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ error: "Knowledge base not found" }, 404)
      }
      console.error("Error deleting knowledge base:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// GET /knowledges/:id/chunks - Get chunks for knowledge base
knowledgeRoutes.get(
  "/:id/chunks",
  describeRoute({
    description: "Get chunks for knowledge base",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(chunks)),
          },
        },
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string().describe("The unique identifier for the knowledge base"),
    }),
  ),
  zValidator("query", chunksQuerySchema),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const id = c.req.param("id")
      const options = c.req.valid("query")

      const chunks = await knowledgeService.getKnowledgeBaseChunks(
        id,
        user.id,
        options,
      )

      return c.json({
        status: "ok",
        data: chunks,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Knowledge base not found"
      ) {
        return c.json({ error: "Knowledge base not found" }, 404)
      }
      console.error("Error fetching knowledge base chunks:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// GET /knowledges/:id/documents - Get documents for knowledge base
knowledgeRoutes.get(
  "/:id/documents",
  describeRoute({
    description: "Get documents for knowledge base",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(documents)),
          },
        },
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string().describe("The unique identifier for the knowledge base"),
    }),
  ),
  zValidator("query", documentsQuerySchema),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const id = c.req.param("id")
      const options = c.req.valid("query")

      const documents = await knowledgeService.getDocuments(
        id,
        user.id,
        options,
      )

      return c.json({
        status: "ok",
        data: documents,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Knowledge base not found"
      ) {
        return c.json({ error: "Knowledge base not found" }, 404)
      }
      console.error("Error fetching knowledge base documents:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// POST /knowledges/:id/documents - Upload document to knowledge base
knowledgeRoutes.post(
  "/:id/documents",
  describeRoute({
    description: "Upload document to knowledge base",
    tags,
    responses: {
      201: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                status: z.literal("ok"),
                data: z.object({
                  document: createSelectSchema(documents),
                  chunks: z.number().describe("The number of chunks created"),
                }),
              }),
            ),
          },
        },
      },
    },
  }),
  zValidator("json", uploadDocumentSchema),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const knowledgeBaseId = c.req.param("id")
      const { name, content } = c.req.valid("json")

      // Create document record
      const document = await knowledgeService.createDocument(
        knowledgeBaseId,
        user.id,
        {
          name,
          originalName: name,
          mimeType: "text/plain",
          size: content.length,
          metadata: {
            source: "text_input",
          },
        },
      )

      // Process document and create chunks
      const chunks = await knowledgeService.processDocument(
        document.id,
        user.id,
        content,
      )

      return c.json(
        {
          status: "ok",
          data: {
            document,
            chunks: chunks.length,
          },
        },
        201,
      )
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Knowledge base not found"
      ) {
        return c.json({ error: "Knowledge base not found" }, 404)
      }
      console.error("Error uploading document:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// GET /knowledges/:id/documents/:documentId - Get specific document
knowledgeRoutes.get(
  "/:id/documents/:documentId",
  describeRoute({
    description: "Get specific document",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createSelectSchema(documents)),
          },
        },
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string().describe("The unique identifier for the knowledge base"),
      documentId: z.string().describe("The unique identifier for the document"),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const documentId = c.req.param("documentId")

      const document = await knowledgeService.getDocument(documentId, user.id)

      return c.json({
        status: "ok",
        data: document,
      })
    } catch (error) {
      if (error instanceof Error && error.message === "Document not found") {
        return c.json({ error: "Document not found" }, 404)
      }
      console.error("Error fetching document:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)

// DELETE /knowledges/:id/documents/:documentId - Delete document
knowledgeRoutes.delete(
  "/:id/documents/:documentId",
  describeRoute({
    description: "Delete document",
    tags,
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                status: z.literal("ok"),
                message: z.string().describe("The message of the response"),
              }),
            ),
          },
        },
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string().describe("The unique identifier for the knowledge base"),
      documentId: z.string().describe("The unique identifier for the document"),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const documentId = c.req.param("documentId")

      await knowledgeService.deleteDocument(documentId, user.id)

      return c.json({
        status: "ok",
        message: "Document deleted successfully",
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ error: "Document not found" }, 404)
      }
      console.error("Error deleting document:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)
