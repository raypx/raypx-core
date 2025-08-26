import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { KnowledgeService } from "../services"
import type { Variables } from "../types"

const knowledgeService = new KnowledgeService()

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

// Middleware to ensure user is authenticated
const authMiddleware = async (c: any, next: any) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  await next()
}

// Apply auth middleware to all routes
knowledgeRoutes.use("*", authMiddleware)

// GET /knowledges - List knowledges with pagination and search
knowledgeRoutes.get("/", zValidator("query", listQuerySchema), async (c) => {
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
})

// GET /knowledges/:id - Get specific knowledge base
knowledgeRoutes.get("/:id", async (c) => {
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
})

// POST /knowledges - Create new knowledge base
knowledgeRoutes.post(
  "/",
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
knowledgeRoutes.delete("/:id", async (c) => {
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
})

// GET /knowledges/:id/chunks - Get chunks for knowledge base
knowledgeRoutes.get(
  "/:id/chunks",
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
