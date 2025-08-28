import { db, emailEvents, emails } from "@raypx/db"
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm"
import type {
  EmailAnalyticsFilter,
  EmailDashboardData,
  EmailDeliveryStats,
} from "./types"

export class EmailAnalytics {
  /**
   * Get email delivery statistics
   */
  static async getDeliveryStats(
    filter: EmailAnalyticsFilter = {},
  ): Promise<EmailDeliveryStats> {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)

      // Get counts for each status
      const statusCounts = await db
        .select({
          status: emails.status,
          count: count(),
        })
        .from(emails)
        .where(conditions)
        .groupBy(emails.status)

      // Convert to object for easier access
      const counts: Record<string, number> = {}
      let total = 0

      for (const { status, count: statusCount } of statusCounts) {
        counts[status] = statusCount
        total += statusCount
      }

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
      const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
      const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0
      const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0
      const complaintRate = sent > 0 ? (complained / sent) * 100 : 0
      const unsubscribeRate =
        delivered > 0 ? (unsubscribed / delivered) * 100 : 0

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
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        bounceRate: Math.round(bounceRate * 100) / 100,
        complaintRate: Math.round(complaintRate * 100) / 100,
        unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
      }
    } catch (error) {
      console.error("Error getting delivery stats:", error)
      throw error
    }
  }

  /**
   * Get recent emails for dashboard
   */
  static async getRecentEmails(
    limit: number = 10,
    filter: EmailAnalyticsFilter = {},
  ) {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)

      const results = await db
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

      return results.map((email) => ({
        ...email,
        openedAt: email.openedAt || undefined,
        deliveredAt: email.deliveredAt || undefined,
      }))
    } catch (error) {
      console.error("Error getting recent emails:", error)
      throw error
    }
  }

  /**
   * Get top performing email templates
   */
  static async getTopTemplates(
    limit: number = 5,
    filter: EmailAnalyticsFilter = {},
  ) {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)

      const templateStats = await db
        .select({
          templateName: emails.templateName,
          total: count(),
          delivered: sql<number>`COUNT(CASE WHEN ${emails.status} IN ('delivered', 'opened', 'clicked') THEN 1 END)`,
          opened: sql<number>`COUNT(CASE WHEN ${emails.status} IN ('opened', 'clicked') THEN 1 END)`,
        })
        .from(emails)
        .where(and(conditions, sql`${emails.templateName} IS NOT NULL`))
        .groupBy(emails.templateName)
        .orderBy(desc(count()))
        .limit(limit)

      return templateStats.map((stat) => ({
        templateName: stat.templateName!,
        count: stat.total,
        deliveryRate:
          stat.total > 0
            ? Math.round((stat.delivered / stat.total) * 10000) / 100
            : 0,
        openRate:
          stat.delivered > 0
            ? Math.round((stat.opened / stat.delivered) * 10000) / 100
            : 0,
      }))
    } catch (error) {
      console.error("Error getting top templates:", error)
      throw error
    }
  }

  /**
   * Get hourly email statistics for charts
   */
  static async getHourlyStats(filter: EmailAnalyticsFilter = {}) {
    try {
      const conditions = EmailAnalytics.buildWhereConditions(filter)

      const hourlyStats = await db
        .select({
          hour: sql<string>`DATE_TRUNC('hour', ${emails.createdAt}) as hour`,
          sent: count(),
          delivered: sql<number>`COUNT(CASE WHEN ${emails.status} IN ('delivered', 'opened', 'clicked') THEN 1 END)`,
          opened: sql<number>`COUNT(CASE WHEN ${emails.status} IN ('opened', 'clicked') THEN 1 END)`,
        })
        .from(emails)
        .where(conditions)
        .groupBy(sql`DATE_TRUNC('hour', ${emails.createdAt})`)
        .orderBy(sql`DATE_TRUNC('hour', ${emails.createdAt}) DESC`)
        .limit(24) // Last 24 hours

      return hourlyStats.map((stat) => ({
        hour: stat.hour,
        sent: stat.sent,
        delivered: stat.delivered,
        opened: stat.opened,
      }))
    } catch (error) {
      console.error("Error getting hourly stats:", error)
      throw error
    }
  }

  /**
   * Get complete dashboard data
   */
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
        recentEmails,
        topTemplates,
        hourlyStats,
      }
    } catch (error) {
      console.error("Error getting dashboard data:", error)
      throw error
    }
  }

  /**
   * Get email events for a specific email
   */
  static async getEmailEvents(emailId: string) {
    try {
      return await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.emailId, emailId))
        .orderBy(desc(emailEvents.timestamp))
    } catch (error) {
      console.error("Error getting email events:", error)
      throw error
    }
  }

  /**
   * Get email performance comparison by template
   */
  static async getTemplateComparison(
    templateNames: string[],
    filter: EmailAnalyticsFilter = {},
  ) {
    try {
      const conditions = and(
        EmailAnalytics.buildWhereConditions(filter),
        sql`${emails.templateName} = ANY(${templateNames})`,
      )

      const comparison = await db
        .select({
          templateName: emails.templateName,
          total: count(),
          sent: sql<number>`COUNT(CASE WHEN ${emails.status} != 'queued' AND ${emails.status} != 'failed' THEN 1 END)`,
          delivered: sql<number>`COUNT(CASE WHEN ${emails.status} IN ('delivered', 'opened', 'clicked') THEN 1 END)`,
          opened: sql<number>`COUNT(CASE WHEN ${emails.status} IN ('opened', 'clicked') THEN 1 END)`,
          clicked: sql<number>`COUNT(CASE WHEN ${emails.status} = 'clicked' THEN 1 END)`,
          bounced: sql<number>`COUNT(CASE WHEN ${emails.status} = 'bounced' THEN 1 END)`,
        })
        .from(emails)
        .where(conditions)
        .groupBy(emails.templateName)

      return comparison.map((item) => ({
        templateName: item.templateName!,
        total: item.total,
        sent: item.sent,
        delivered: item.delivered,
        opened: item.opened,
        clicked: item.clicked,
        bounced: item.bounced,
        deliveryRate:
          item.sent > 0
            ? Math.round((item.delivered / item.sent) * 10000) / 100
            : 0,
        openRate:
          item.delivered > 0
            ? Math.round((item.opened / item.delivered) * 10000) / 100
            : 0,
        clickRate:
          item.delivered > 0
            ? Math.round((item.clicked / item.delivered) * 10000) / 100
            : 0,
        bounceRate:
          item.sent > 0
            ? Math.round((item.bounced / item.sent) * 10000) / 100
            : 0,
      }))
    } catch (error) {
      console.error("Error getting template comparison:", error)
      throw error
    }
  }

  /**
   * Build WHERE conditions from filter
   */
  private static buildWhereConditions(filter: EmailAnalyticsFilter) {
    const conditions = []

    if (filter.startDate) {
      conditions.push(gte(emails.createdAt, filter.startDate))
    }

    if (filter.endDate) {
      conditions.push(lte(emails.createdAt, filter.endDate))
    }

    if (filter.provider) {
      conditions.push(eq(emails.provider, filter.provider as any))
    }

    if (filter.templateName) {
      conditions.push(eq(emails.templateName, filter.templateName))
    }

    if (filter.userId) {
      conditions.push(eq(emails.userId, filter.userId))
    }

    if (filter.status && filter.status.length > 0) {
      conditions.push(sql`${emails.status} = ANY(${filter.status})`)
    }

    if (filter.tags && filter.tags.length > 0) {
      conditions.push(sql`${emails.tags} && ${filter.tags}`)
    }

    return conditions.length > 0 ? and(...conditions) : undefined
  }
}
