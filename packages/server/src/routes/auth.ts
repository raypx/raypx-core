import { Hono } from "hono"
import { AuthService } from "../services"
import type { Variables } from "../types"

const authService = new AuthService()

export const authRoutes = new Hono<{ Variables: Variables }>()

// Get Sessions
authRoutes.get("/sessions", async (c) => {
  const session = c.get("session")
  const sessions = await authService.getSessions(c.req.raw.headers, session?.id)

  return c.json({
    status: "ok",
    data: sessions,
  })
})

// Revoke Session
authRoutes.post("/revoke-session", async (c) => {
  const { token } = await c.req.json()
  const session = c.get("session")

  const result = await authService.revokeSession(
    c.req.raw.headers,
    token,
    session,
  )

  return c.json(result)
})
