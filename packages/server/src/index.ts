// Export Vercel handler
export { handle as vercel } from "hono/vercel"

// Export main app factory
export { createApp } from "./app"

// Export routes for standalone API server
export { authRoutes, knowledgeRoutes, userRoutes } from "./routes"

// Export services for external use
export { AuthService } from "./services"

// Export types
export type { ServerOptions, Variables } from "./types"
