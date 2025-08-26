import { auth } from "@raypx/auth/server"
import { UAParser } from "@raypx/shared"
import { format } from "date-fns"
import type { Variables } from "../types"

export interface SessionData {
  id: string
  deviceType: string
  current: boolean
  os: string
  browser: string
  location: string
  lastActive: string
  deviceName: string
  userAgent?: string | null
  ipAddress?: string | null
  updatedAt: Date
  token: string
  createdAt: Date
  userId: string
  expiresAt: Date
}

export class AuthService {
  /**
   * Get formatted sessions list for a user
   */
  async getSessions(
    headers: Headers,
    currentSessionId?: string,
  ): Promise<SessionData[]> {
    const sessions = await auth.api.listSessions({ headers })

    return sessions.map((session) => {
      const ua = UAParser(session.userAgent || "")

      return {
        ...session,
        deviceType: ua.device.type || "desktop",
        current: session.id === currentSessionId,
        os: ua.os.name || "",
        browser: ua.browser.name || "",
        location: session.ipAddress || "",
        lastActive: format(session.updatedAt, "yyyy-MM-dd HH:mm:ss"),
        deviceName: `${ua.os.name || ""} ${ua.browser.name || ""}`,
      }
    })
  }

  /**
   * Revoke a session and optionally sign out current user if revoking own session
   */
  async revokeSession(
    headers: Headers,
    token: string,
    currentSession?: Variables["session"],
  ) {
    const result = await auth.api.revokeSession({
      headers,
      body: { token },
    })

    // If revoking current session, sign out the user
    if (currentSession?.token === token) {
      await auth.api.signOut({ headers })
    }

    return result
  }
}
