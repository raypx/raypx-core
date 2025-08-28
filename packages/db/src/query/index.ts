import {
  and,
  asc,
  count,
  db,
  desc,
  eq,
  gt,
  isNotNull,
  like,
  type SQL,
} from "../index"
import { chunks, documents, knowledges, session, user } from "../schemas"

export const getUser = async (id: string) => {
  const data = await db.query.user.findFirst({
    where: eq(user.id, id),
  })
  return data
}

// User Management Queries
export const getUsersList = async (options?: {
  limit?: number
  offset?: number
  search?: string
  sortBy?: "name" | "email" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
  role?: string
  status?: "active" | "banned"
}) => {
  const {
    limit = 20,
    offset = 0,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    role,
    status,
  } = options ?? {}

  let whereCondition: SQL | undefined

  if (search) {
    whereCondition = whereCondition
      ? and(whereCondition, like(user.name, `%${search}%`))
      : like(user.name, `%${search}%`)
  }

  if (role) {
    whereCondition = whereCondition
      ? and(whereCondition, eq(user.role, role))
      : eq(user.role, role)
  }

  if (status === "banned") {
    whereCondition = whereCondition
      ? and(whereCondition, eq(user.banned, true))
      : eq(user.banned, true)
  } else if (status === "active") {
    whereCondition = whereCondition
      ? and(whereCondition, eq(user.banned, false))
      : eq(user.banned, false)
  }

  const orderByClause =
    sortOrder === "desc" ? desc(user[sortBy]) : asc(user[sortBy])

  const [data, totalCount] = await Promise.all([
    db.query.user.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: orderByClause,
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        username: true,
        displayUsername: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.select({ count: count() }).from(user).where(whereCondition),
  ])

  return {
    data,
    total: totalCount[0]?.count ?? 0,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
  }
}

export const updateUserStatus = async (
  id: string,
  data: {
    banned?: boolean
    banReason?: string
    banExpires?: Date
    role?: string
  },
) => {
  const result = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning()
  return result[0]
}

export const getUserStats = async () => {
  const [totalUsers, bannedUsers, recentUsers] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(user).where(eq(user.banned, true)),
    db
      .select({ count: count() })
      .from(user)
      .where(
        and(
          eq(user.banned, false),
          // Users created in the last 30 days
          gt(user.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        ),
      ),
  ])

  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    bannedUsers: bannedUsers[0]?.count ?? 0,
    activeUsers: (totalUsers[0]?.count ?? 0) - (bannedUsers[0]?.count ?? 0),
    recentUsers: recentUsers[0]?.count ?? 0,
  }
}

// Impersonation Queries
export const createImpersonationSession = async (data: {
  userId: string
  impersonatedBy: string
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}) => {
  const result = await db
    .insert(session)
    .values({
      ...data,
      createdAt: new Date(),
      lastActive: new Date(),
    })
    .returning()
  return result[0]
}

export const getImpersonationSession = async (token: string) => {
  const data = await db.query.session.findFirst({
    where: and(
      eq(session.token, token),
      isNotNull(session.impersonatedBy), // For impersonation sessions
    ),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
        },
      },
    },
  })
  return data
}

export const endImpersonationSession = async (token: string) => {
  const result = await db
    .delete(session)
    .where(
      and(
        eq(session.token, token),
        isNotNull(session.impersonatedBy), // For impersonation sessions
      ),
    )
    .returning()
  return result[0]
}

export const getActiveImpersonationSessions = async (adminUserId: string) => {
  const data = await db.query.session.findMany({
    where: eq(session.impersonatedBy, adminUserId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: desc(session.createdAt),
  })
  return data
}

// Knowledge Base Queries
export const getKnowledgeBasesByUserId = async (
  userId: string,
  options?: {
    limit?: number
    offset?: number
    search?: string
    sortBy?: "name" | "createdAt" | "updatedAt"
    sortOrder?: "asc" | "desc"
  },
) => {
  const {
    limit = 10,
    offset = 0,
    search,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = options ?? {}

  let whereCondition: SQL | undefined = eq(knowledges.userId, userId)

  if (search) {
    whereCondition = whereCondition
      ? and(whereCondition, like(knowledges.name, `%${search}%`))
      : like(knowledges.name, `%${search}%`)
  }

  const orderByClause =
    sortOrder === "desc" ? desc(knowledges[sortBy]) : asc(knowledges[sortBy])

  const [data, totalCount] = await Promise.all([
    db.query.knowledges.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: orderByClause,
    }),
    db.select({ count: count() }).from(knowledges).where(whereCondition),
  ])

  return {
    data,
    total: totalCount[0]?.count ?? 0,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
  }
}

export const getKnowledgeBaseById = async (id: string, userId: string) => {
  const data = await db.query.knowledges.findFirst({
    where: and(eq(knowledges.id, id), eq(knowledges.userId, userId)),
  })
  return data
}

export const createKnowledgeBase = async (data: {
  name: string
  description?: string
  userId: string
  settings?: Record<string, unknown>
}) => {
  const result = await db.insert(knowledges).values(data).returning()
  return result[0]
}

export const updateKnowledgeBase = async (
  id: string,
  userId: string,
  data: {
    name?: string
    description?: string
    status?: string
    settings?: Record<string, unknown>
  },
) => {
  const result = await db
    .update(knowledges)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(knowledges.id, id), eq(knowledges.userId, userId)))
    .returning()
  return result[0]
}

export const deleteKnowledgeBase = async (id: string, userId: string) => {
  const result = await db
    .delete(knowledges)
    .where(and(eq(knowledges.id, id), eq(knowledges.userId, userId)))
    .returning()
  return result[0]
}

export const getKnowledgeBaseChunks = async (
  knowledgeBaseId: string,
  userId: string,
  options?: {
    limit?: number
    offset?: number
  },
) => {
  const { limit = 50, offset = 0 } = options ?? {}

  const data = await db.query.chunks.findMany({
    where: and(
      eq(chunks.knowledgeBaseId, knowledgeBaseId),
      eq(chunks.userId, userId),
    ),
    limit,
    offset,
    orderBy: desc(chunks.createdAt),
  })

  return data
}

export const createChunk = async (data: {
  text: string
  abstract?: string
  metadata?: Record<string, unknown>
  index?: number
  type?: string
  clientId?: string
  documentId?: string
  knowledgeBaseId: string
  userId: string
}) => {
  const result = await db.insert(chunks).values(data).returning()
  return result[0]
}

export const createChunks = async (
  chunksData: Array<{
    text: string
    abstract?: string
    metadata?: Record<string, unknown>
    index?: number
    type?: string
    clientId?: string
    documentId?: string
    knowledgeBaseId: string
    userId: string
  }>,
) => {
  const result = await db.insert(chunks).values(chunksData).returning()
  return result
}

// Document Queries
export const createDocument = async (data: {
  name: string
  originalName: string
  mimeType: string
  size: number
  metadata?: Record<string, unknown>
  knowledgeBaseId: string
  userId: string
}) => {
  const result = await db.insert(documents).values(data).returning()
  return result[0]
}

export const getDocumentsByKnowledgeBase = async (
  knowledgeBaseId: string,
  userId: string,
  options?: {
    limit?: number
    offset?: number
  },
) => {
  const { limit = 20, offset = 0 } = options ?? {}

  const data = await db.query.documents.findMany({
    where: and(
      eq(documents.knowledgeBaseId, knowledgeBaseId),
      eq(documents.userId, userId),
    ),
    limit,
    offset,
    orderBy: desc(documents.createdAt),
  })

  return data
}

export const getDocumentById = async (id: string, userId: string) => {
  const data = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.userId, userId)),
  })
  return data
}

export const updateDocumentStatus = async (
  id: string,
  userId: string,
  status: string,
) => {
  const result = await db
    .update(documents)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning()
  return result[0]
}

export const deleteDocument = async (id: string, userId: string) => {
  const result = await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning()
  return result[0]
}
