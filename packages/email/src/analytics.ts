import { db, emails } from "@raypx/db"
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm"
import type {
  EmailAnalyticsFilter,
  EmailDashboardData,
  EmailDeliveryStats,
  EmailStatus,
} from "./types"

export class EmailAnalytics {
  static async getDeliveryStats(
    filter: EmailAnalyticsFilter = {},
  ): Promise<EmailDeliveryStats> {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)
      const statusCounts = await db
        .select({ status: emails.status, count: count() })
        .from(emails)
        .where(conditions)
        .groupBy(emails.status)

      // Aggregate counts
      const counts: Record<string, number> = {}
      let total = 0
      for (const { status, count: statusCount } of statusCounts) {
        counts[status] = statusCount
        total += statusCount
      }

      // Calculate metrics
      const sent =
        (counts.sent || 0) +
        (counts.delivered || 0) +
        (counts.opened || 0) +
        (counts.clicked || 0) +
        (counts.bounced || 0) +
        (counts.complained || 0)
      const delivered =
        (counts.delivered || 0) + (counts.opened || 0) + (counts.clicked || 0)
      const opened = (counts.opened || 0) + (counts.clicked || 0)
      const clicked = counts.clicked || 0
      const bounced = counts.bounced || 0
      const complained = counts.complained || 0
      const unsubscribed = counts.unsubscribed || 0
      const failed = counts.failed || 0

      // Calculate rates
      const calculateRate = (numerator: number, denominator: number) =>
        denominator > 0
          ? Math.round((numerator / denominator) * 10000) / 100
          : 0

      return {
        total,
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        complained,
        unsubscribed,
        failed,
        deliveryRate: calculateRate(delivered, sent),
        openRate: calculateRate(opened, delivered),
        clickRate: calculateRate(clicked, delivered),
        bounceRate: calculateRate(bounced, sent),
        complaintRate: calculateRate(complained, sent),
        unsubscribeRate: calculateRate(unsubscribed, delivered),
      }
    } catch (error) {
      console.error("Error getting delivery stats:", error)
      throw error
    }
  }

  static async getRecentEmails(
    limit: number = 10,
    filter: EmailAnalyticsFilter = {},
  ) {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)
      return await db
        .select({
          id: emails.id,
          subject: emails.subject,
          toAddress: emails.toAddress,
          status: emails.status,
          createdAt: emails.createdAt,
          openedAt: emails.openedAt,
          deliveredAt: emails.deliveredAt,
        })
        .from(emails)
        .where(conditions)
        .orderBy(desc(emails.createdAt))
        .limit(limit)
    } catch (error) {
      console.error("Error getting recent emails:", error)
      throw error
    }
  }

  static async getTopTemplates(
    limit: number = 5,
    filter: EmailAnalyticsFilter = {},
  ) {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)
      const results = await db
        .select({
          templateName: emails.templateName,
          count: count(),
          delivered: sql<number>`COUNT(CASE WHEN ${emails.status} = 'delivered' THEN 1 END)`,
          opened: sql<number>`COUNT(CASE WHEN ${emails.status} = 'opened' THEN 1 END)`,
        })
        .from(emails)
        .where(and(conditions, sql`${emails.templateName} IS NOT NULL`))
        .groupBy(emails.templateName)
        .orderBy(desc(count()))
        .limit(limit)

      return results.map((result) => ({
        templateName: result.templateName || "",
        count: Number(result.count),
        deliveryRate:
          result.count > 0
            ? (Number(result.delivered) / Number(result.count)) * 100
            : 0,
        openRate:
          Number(result.delivered) > 0
            ? (Number(result.opened) / Number(result.delivered)) * 100
            : 0,
      }))
    } catch (error) {
      console.error("Error getting top templates:", error)
      throw error
    }
  }

  static async getHourlyStats(filter: EmailAnalyticsFilter = {}) {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)
      const results = await db
        .select({
          hour: sql<string>`EXTRACT(hour FROM ${emails.createdAt})::text`,
          sent: count(),
          delivered: sql<number>`COUNT(CASE WHEN ${emails.status} = 'delivered' THEN 1 END)`,
          opened: sql<number>`COUNT(CASE WHEN ${emails.status} = 'opened' THEN 1 END)`,
        })
        .from(emails)
        .where(conditions)
        .groupBy(sql`EXTRACT(hour FROM ${emails.createdAt})`)
        .orderBy(sql`EXTRACT(hour FROM ${emails.createdAt})`)

      return results.map((result) => ({
        hour: result.hour,
        sent: Number(result.sent),
        delivered: Number(result.delivered),
        opened: Number(result.opened),
      }))
    } catch (error) {
      console.error("Error getting hourly stats:", error)
      throw error
    }
  }

  static async getDashboardData(
    filter: EmailAnalyticsFilter = {},
  ): Promise<EmailDashboardData> {
    try {
      const [stats, recentEmails, topTemplates, hourlyStats] =
        await Promise.all([
          EmailAnalytics.getDeliveryStats(filter),
          EmailAnalytics.getRecentEmails(10, filter),
          EmailAnalytics.getTopTemplates(5, filter),
          EmailAnalytics.getHourlyStats(filter),
        ])

      return {
        stats,
        recentEmails: recentEmails.map((email) => ({
          id: email.id,
          subject: email.subject,
          toAddress: email.toAddress,
          status: email.status as EmailStatus,
          createdAt: email.createdAt,
          openedAt: email.openedAt || undefined,
          deliveredAt: email.deliveredAt || undefined,
        })),
        topTemplates,
        hourlyStats,
      }
    } catch (error) {
      console.error("Error getting dashboard data:", error)
      throw error
    }
  }

  private static buildWhereConditions(filter: EmailAnalyticsFilter) {
    const conditions = []

    if (filter.startDate)
      conditions.push(gte(emails.createdAt, filter.startDate))
    if (filter.endDate) conditions.push(lte(emails.createdAt, filter.endDate))
    if (filter.provider) conditions.push(eq(emails.provider, filter.provider))
    if (filter.templateName)
      conditions.push(eq(emails.templateName, filter.templateName))
    if (filter.userId) conditions.push(eq(emails.userId, filter.userId))
    if (filter.tags?.length)
      conditions.push(sql`${emails.tags} && ${filter.tags}`)
    if (filter.status?.length)
      conditions.push(sql`${emails.status} = ANY(${filter.status})`)

    return conditions.length > 0 ? and(...conditions) : undefined
  }
}
