import { Hono } from "hono"
import { defaultMiddleware } from "./config"
import { authMiddleware, databaseMiddleware } from "./middleware"
import { authRoutes, knowledgeRoutes, userRoutes } from "./routes"
import type { ServerOptions, Variables } from "./types"

/**
 * Create and configure the Hono application with all middleware and routes
 */
export const createApp = (options: ServerOptions) => {
  const app = new Hono<{ Variables: Variables }>().basePath(options.prefix)

  // Apply default middleware
  for (const middleware of defaultMiddleware) {
    app.use(middleware)
  }

  // Apply custom middleware
  app.use("*", databaseMiddleware)
  app.use("*", authMiddleware)

  // Health endpoints
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
    })
  })

  app.get("/info", async (c) => {
    const session = c.get("session")
    const user = c.get("user")

    return c.json({
      status: "ok",
      session,
      user,
    })
  })

  // Mount routes
  app.route("/auth", authRoutes)
  app.route("/knowledges", knowledgeRoutes)
  app.route("/users", userRoutes)

  // Error handling
  app.notFound((c) => {
    console.log("Not Found", c.req.path)
    return c.json(
      {
        message: "Not Found",
      },
      404,
    )
  })

  app.onError((err, c) => {
    console.error(err)
    return c.json(
      {
        message: "Internal Server Error",
      },
      500,
    )
  })

  return app
}
