import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeBaseById,
  getKnowledgeBaseChunks,
  getKnowledgeBasesByUserId,
  type schemas,
  updateKnowledgeBase,
} from "@raypx/db"
import type { InferSelectModel } from "drizzle-orm"

export type Knowledge = InferSelectModel<typeof schemas.knowledges>

export interface CreateKnowledgeBaseData {
  name: string
  description?: string
  settings?: any
}

export interface UpdateKnowledgeBaseData {
  name?: string
  description?: string
  status?: "active" | "inactive" | "archived"
  settings?: any
}

export interface KnowledgeBaseListOptions {
  limit?: number
  offset?: number
  search?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

export class KnowledgeService {
  /**
   * Get knowledges list for a user with pagination and search
   */
  async getKnowledgeBases(userId: string, options?: KnowledgeBaseListOptions) {
    return await getKnowledgeBasesByUserId(userId, options)
  }

  /**
   * Get knowledge base by ID (with ownership check)
   */
  async getKnowledgeBase(id: string, userId: string) {
    const knowledgeBase = await getKnowledgeBaseById(id, userId)
    if (!knowledgeBase) {
      throw new Error("Knowledge base not found")
    }
    return knowledgeBase
  }

  /**
   * Create new knowledge base
   */
  async createKnowledgeBase(userId: string, data: CreateKnowledgeBaseData) {
    return await createKnowledgeBase({
      ...data,
      userId,
    })
  }

  /**
   * Update existing knowledge base (with ownership check)
   */
  async updateKnowledgeBase(
    id: string,
    userId: string,
    data: UpdateKnowledgeBaseData,
  ) {
    const updated = await updateKnowledgeBase(id, userId, data)
    if (!updated) {
      throw new Error("Knowledge base not found or access denied")
    }
    return updated
  }

  /**
   * Delete knowledge base (with ownership check)
   */
  async deleteKnowledgeBase(id: string, userId: string) {
    const deleted = await deleteKnowledgeBase(id, userId)
    if (!deleted) {
      throw new Error("Knowledge base not found or access denied")
    }
    return deleted
  }

  /**
   * Get chunks for a knowledge base
   */
  async getKnowledgeBaseChunks(
    knowledgeBaseId: string,
    userId: string,
    options?: {
      limit?: number
      offset?: number
    },
  ) {
    // First verify the user owns this knowledge base
    await this.getKnowledgeBase(knowledgeBaseId, userId)

    return await getKnowledgeBaseChunks(knowledgeBaseId, userId, options)
  }
}
