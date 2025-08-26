import { compress } from "hono/compress"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { requestId } from "hono/request-id"

/**
 * Default middleware configuration for Hono application
 */
export const defaultMiddleware = [
  logger(),
  cors(),
  compress(),
  requestId(),
  contextStorage(),
  prettyJSON(),
] as const
