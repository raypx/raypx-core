import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { UserService } from "../services"
import type { Variables } from "../types"

const userService = new UserService()

export const userRoutes = new Hono<{ Variables: Variables }>()

// Validation schemas
const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z
    .enum(["name", "email", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  role: z.string().optional(),
  status: z.enum(["active", "banned"]).optional(),
})

const updateUserSchema = z.object({
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string().datetime().optional(),
  role: z.string().optional(),
})

const banUserSchema = z.object({
  banReason: z.string().min(1, "Ban reason is required"),
  banExpires: z.string().datetime().optional(),
})

// Middleware to ensure user is authenticated and has admin role
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  // Check if user has admin role
  if (user.role !== "admin" && user.role !== "superadmin") {
    return c.json({ error: "Forbidden - Admin access required" }, 403)
  }

  await next()
}

// Apply admin middleware to all routes
userRoutes.use("*", adminMiddleware)

// GET /users - List users with pagination, search, and filters
userRoutes.get("/", zValidator("query", listQuerySchema), async (c) => {
  try {
    const options = c.req.valid("query")

    const result = await userService.getUsers(options)

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
    console.error("Error fetching users:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

// GET /users/stats - Get user statistics
userRoutes.get("/stats", async (c) => {
  try {
    const stats = await userService.getUserStats()

    return c.json({
      status: "ok",
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

// PATCH /users/:id - Update user (ban/unban, role changes)
userRoutes.patch("/:id", zValidator("json", updateUserSchema), async (c) => {
  try {
    const id = c.req.param("id")
    const data = c.req.valid("json")

    // Convert banExpires string to Date if provided
    const updateData = {
      ...data,
      banExpires: data.banExpires ? new Date(data.banExpires) : undefined,
    }

    const updatedUser = await userService.updateUser(id, updateData)

    return c.json({
      status: "ok",
      data: updatedUser,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    console.error("Error updating user:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

// POST /users/:id/ban - Ban a user
userRoutes.post("/:id/ban", zValidator("json", banUserSchema), async (c) => {
  try {
    const id = c.req.param("id")
    const { banReason, banExpires } = c.req.valid("json")

    const updatedUser = await userService.banUser(
      id,
      banReason,
      banExpires ? new Date(banExpires) : undefined,
    )

    return c.json({
      status: "ok",
      data: updatedUser,
      message: "User banned successfully",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    console.error("Error banning user:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

// POST /users/:id/unban - Unban a user
userRoutes.post("/:id/unban", async (c) => {
  try {
    const id = c.req.param("id")

    const updatedUser = await userService.unbanUser(id)

    return c.json({
      status: "ok",
      data: updatedUser,
      message: "User unbanned successfully",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return c.json({ error: "User not found" }, 404)
    }
    console.error("Error unbanning user:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

// PUT /users/:id/role - Change user role
userRoutes.put(
  "/:id/role",
  zValidator(
    "json",
    z.object({
      role: z.string().min(1, "Role is required"),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id")
      const { role } = c.req.valid("json")

      const updatedUser = await userService.changeUserRole(id, role)

      return c.json({
        status: "ok",
        data: updatedUser,
        message: "User role updated successfully",
      })
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        return c.json({ error: "User not found" }, 404)
      }
      console.error("Error changing user role:", error)
      return c.json({ error: "Internal server error" }, 500)
    }
  },
)
