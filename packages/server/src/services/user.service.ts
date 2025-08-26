import {
  getUserStats,
  getUsersList,
  type schemas,
  updateUserStatus,
} from "@raypx/db"
import type { InferSelectModel } from "drizzle-orm"

export type User = InferSelectModel<typeof schemas.user>

export interface UserListOptions {
  limit?: number
  offset?: number
  search?: string
  sortBy?: "name" | "email" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
  role?: string
  status?: "active" | "banned"
}

export interface UpdateUserData {
  banned?: boolean
  banReason?: string
  banExpires?: Date
  role?: string
}

export class UserService {
  /**
   * Get users list with pagination, search, and filters
   */
  async getUsers(options?: UserListOptions) {
    return await getUsersList(options)
  }

  /**
   * Update user status (ban/unban, role changes)
   */
  async updateUser(id: string, data: UpdateUserData) {
    const updated = await updateUserStatus(id, data)
    if (!updated) {
      throw new Error("User not found")
    }
    return updated
  }

  /**
   * Ban a user with reason and optional expiry
   */
  async banUser(id: string, banReason: string, banExpires?: Date) {
    return await this.updateUser(id, {
      banned: true,
      banReason,
      banExpires,
    })
  }

  /**
   * Unban a user
   */
  async unbanUser(id: string) {
    return await this.updateUser(id, {
      banned: false,
    })
  }

  /**
   * Change user role
   */
  async changeUserRole(id: string, role: string) {
    return await this.updateUser(id, { role })
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStats() {
    return await getUserStats()
  }
}
