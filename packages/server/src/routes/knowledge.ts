import { Hono, type MiddlewareHandler } from "hono"
import { KnowledgeService } from "../services"
import type { Variables } from "../types"

const knowledgeService = new KnowledgeService()

export const knowledgeRoutes = new Hono<{ Variables: Variables }>()

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
knowledgeRoutes.get("/", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const options = c.req.query()

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
knowledgeRoutes.post("/", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const data = await c.req.json()

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
})

// PATCH /knowledges/:id - Update knowledge base
knowledgeRoutes.patch("/:id", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const id = c.req.param("id")
    const data = await c.req.json()

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
})

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
knowledgeRoutes.get("/:id/chunks", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const id = c.req.param("id")
    const options = c.req.query()

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
})

// GET /knowledges/:id/documents - Get documents for knowledge base
knowledgeRoutes.get("/:id/documents", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const id = c.req.param("id")
    const options = c.req.query()

    const documents = await knowledgeService.getDocuments(id, user.id, options)

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
})

// POST /knowledges/:id/documents - Upload document to knowledge base
knowledgeRoutes.post("/:id/documents", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const knowledgeBaseId = c.req.param("id")
    const { name, content } = await c.req.json()

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
})

// GET /knowledges/:id/documents/:documentId - Get specific document
knowledgeRoutes.get("/:id/documents/:documentId", async (c) => {
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
})

// DELETE /knowledges/:id/documents/:documentId - Delete document
knowledgeRoutes.delete("/:id/documents/:documentId", async (c) => {
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
})
