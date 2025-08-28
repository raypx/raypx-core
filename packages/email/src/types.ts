import type { ReactElement } from "react"

export interface EmailDeliveryStats {
  total: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  unsubscribed: number
  failed: number

  // Calculated rates
  deliveryRate: number // delivered / sent
  openRate: number // opened / delivered
  clickRate: number // clicked / delivered
  bounceRate: number // bounced / sent
  complaintRate: number // complained / sent
  unsubscribeRate: number // unsubscribed / delivered
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: ReactElement
  provider?: "resend" | "nodemailer"
  templateName?: string
  userId?: string
  tags?: string[]
  metadata?: Record<string, any>
  trackingEnabled?: boolean
}

export interface SendEmailResult {
  success: boolean
  error?: string
  emailId?: string
  providerId?: string
  messageId?: string
}

export interface EmailAnalyticsFilter {
  startDate?: Date
  endDate?: Date
  provider?: string
  templateName?: string
  userId?: string
  tags?: string[]
  status?: string[]
}

export interface EmailEventData {
  emailId: string
  eventType: string
  timestamp?: Date
  userAgent?: string
  ipAddress?: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
  clickedUrl?: string
  providerEventId?: string
  providerData?: Record<string, any>
}

export interface WebhookEvent {
  type: string
  data: Record<string, any>
  timestamp: string
  signature?: string
}

export interface ResendWebhookEvent extends WebhookEvent {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened"
    | "email.clicked"
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    // Event-specific fields
    clicked_link?: {
      url: string
    }
    user_agent?: string
    ip?: string
  }
}

export interface EmailDashboardData {
  stats: EmailDeliveryStats
  recentEmails: Array<{
    id: string
    subject: string
    toAddress: string
    status: string
    createdAt: Date
    openedAt?: Date
    deliveredAt?: Date
  }>
  topTemplates: Array<{
    templateName: string
    count: number
    deliveryRate: number
    openRate: number
  }>
  hourlyStats: Array<{
    hour: string
    sent: number
    delivered: number
    opened: number
  }>
}
