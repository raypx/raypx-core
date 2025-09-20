import {
  createChunks,
  createDocument,
  createKnowledgeBase,
  deleteDocument,
  deleteKnowledgeBase,
  getDocumentById,
  getDocumentsByKnowledgeBase,
  getKnowledgeBaseById,
  getKnowledgeBaseChunks,
  getKnowledgeBasesByUserId,
  type schemas,
  updateDocumentStatus,
  updateKnowledgeBase,
} from "@raypx/db";
import type { InferSelectModel } from "drizzle-orm";

export type Knowledge = InferSelectModel<typeof schemas.knowledges>;
export type Document = InferSelectModel<typeof schemas.documents>;

export interface CreateKnowledgeBaseData {
  name: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateKnowledgeBaseData {
  name?: string;
  description?: string;
  status?: "active" | "inactive" | "archived";
  settings?: Record<string, unknown>;
}

export interface KnowledgeBaseListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateDocumentData {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessDocumentOptions {
  chunkSize?: number;
}

export class KnowledgeService {
  /**
   * Get knowledges list for a user with pagination and search
   */
  async getKnowledgeBases(userId: string, options?: KnowledgeBaseListOptions) {
    return await getKnowledgeBasesByUserId(userId, options);
  }

  /**
   * Get knowledge base by ID (with ownership check)
   */
  async getKnowledgeBase(id: string, userId: string) {
    const knowledgeBase = await getKnowledgeBaseById(id, userId);
    if (!knowledgeBase) {
      throw new Error("Knowledge base not found");
    }
    return knowledgeBase;
  }

  /**
   * Create new knowledge base
   */
  async createKnowledgeBase(userId: string, data: CreateKnowledgeBaseData) {
    return await createKnowledgeBase({
      ...data,
      userId,
    });
  }

  /**
   * Update existing knowledge base (with ownership check)
   */
  async updateKnowledgeBase(id: string, userId: string, data: UpdateKnowledgeBaseData) {
    const updated = await updateKnowledgeBase(id, userId, data);
    if (!updated) {
      throw new Error("Knowledge base not found or access denied");
    }
    return updated;
  }

  /**
   * Delete knowledge base (with ownership check)
   */
  async deleteKnowledgeBase(id: string, userId: string) {
    const deleted = await deleteKnowledgeBase(id, userId);
    if (!deleted) {
      throw new Error("Knowledge base not found or access denied");
    }
    return deleted;
  }

  /**
   * Get chunks for a knowledge base
   */
  async getKnowledgeBaseChunks(
    knowledgeBaseId: string,
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ) {
    // First verify the user owns this knowledge base
    await this.getKnowledgeBase(knowledgeBaseId, userId);

    return await getKnowledgeBaseChunks(knowledgeBaseId, userId, options);
  }

  /**
   * Create a new document in a knowledge base
   */
  async createDocument(knowledgeBaseId: string, userId: string, data: CreateDocumentData) {
    // First verify the user owns this knowledge base
    await this.getKnowledgeBase(knowledgeBaseId, userId);

    const document = await createDocument({
      ...data,
      knowledgeBaseId,
      userId,
    });

    return document;
  }

  /**
   * Get documents for a knowledge base
   */
  async getDocuments(
    knowledgeBaseId: string,
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ) {
    // First verify the user owns this knowledge base
    await this.getKnowledgeBase(knowledgeBaseId, userId);

    return await getDocumentsByKnowledgeBase(knowledgeBaseId, userId, options);
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string, userId: string) {
    const document = await getDocumentById(id, userId);
    if (!document) {
      throw new Error("Document not found");
    }
    return document;
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string, userId: string) {
    const deleted = await deleteDocument(id, userId);
    if (!deleted) {
      throw new Error("Document not found or access denied");
    }
    return deleted;
  }

  /**
   * Process document content and create chunks
   */
  async processDocument(
    documentId: string,
    userId: string,
    content: string,
    options?: ProcessDocumentOptions,
  ) {
    const { chunkSize = 1000 } = options || {};

    // Get the document to ensure it exists and user has access
    const document = await this.getDocument(documentId, userId);

    // Simple text chunking - split by sentences and group them
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length <= chunkSize) {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(`${currentChunk}.`);
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(`${currentChunk}.`);
    }

    // Create chunks in database
    const chunksData = chunks.map((text, index) => ({
      text,
      index,
      type: "text",
      documentId,
      knowledgeBaseId: document.knowledgeBaseId,
      userId,
    }));

    const createdChunks = await createChunks(chunksData);

    // Update document status to completed
    await updateDocumentStatus(documentId, userId, "completed");

    return createdChunks;
  }
}
