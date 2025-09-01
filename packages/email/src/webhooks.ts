import crypto from "node:crypto"
import { db, emails } from "@raypx/db"
import { eq } from "drizzle-orm"
import { trackEmailEvent } from "./server"
import type { ResendWebhookEvent, WebhookEvent } from "./types"
import { EmailEventType, ResendWebhookEventType } from "./types"

// Event type mapping
const EVENT_TYPE_MAP: Record<ResendWebhookEventType, EmailEventType> = {
  [ResendWebhookEventType.EMAIL_SENT]: EmailEventType.SENT,
  [ResendWebhookEventType.EMAIL_DELIVERED]: EmailEventType.DELIVERED,
  [ResendWebhookEventType.EMAIL_DELIVERY_DELAYED]:
    EmailEventType.DELIVERY_DELAYED,
  [ResendWebhookEventType.EMAIL_COMPLAINED]: EmailEventType.COMPLAINED,
  [ResendWebhookEventType.EMAIL_BOUNCED]: EmailEventType.BOUNCED,
  [ResendWebhookEventType.EMAIL_OPENED]: EmailEventType.OPENED,
  [ResendWebhookEventType.EMAIL_CLICKED]: EmailEventType.CLICKED,
}

export class EmailWebhookHandler {
  static verifyResendSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      const hmac = crypto.createHmac("sha256", secret)
      hmac.update(payload, "utf8")
      const expectedSignature = `sha256=${hmac.digest("hex")}`
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      )
    } catch (error) {
      console.error("Error verifying webhook signature:", error)
      return false
    }
  }

  static async handleResendWebhook(event: ResendWebhookEvent): Promise<void> {
    try {
      const { type, data } = event
      const internalEventType = EVENT_TYPE_MAP[type]

      if (!internalEventType) {
        console.warn(`Unknown event type: ${type}`)
        return
      }

      // Find email by provider ID
      const [emailRecord] = await db
        .select()
        .from(emails)
        .where(eq(emails.providerId, data.email_id))
        .limit(1)

      if (!emailRecord) {
        console.warn(`Email not found for provider ID: ${data.email_id}`)
        return
      }

      // Extract additional data
      const additionalData: Record<string, unknown> = {}
      if (type === ResendWebhookEventType.EMAIL_CLICKED && data.clicked_link) {
        additionalData.clickedUrl = data.clicked_link.url
      }

      // Track the event
      await trackEmailEvent({
        emailId: emailRecord.id,
        eventType: internalEventType,
        timestamp: new Date(data.created_at),
        userAgent: data.user_agent,
        ipAddress: data.ip,
        providerEventId: data.email_id,
        providerData: data,
        ...additionalData,
      })

      console.log(`Processed ${type} event for email ${emailRecord.id}`)
    } catch (error) {
      console.error("Error processing Resend webhook:", error)
      throw error
    }
  }

  static async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      console.log(`Processing generic webhook event: ${event.type}`)
      // Handle generic webhook events here - can be extended for other providers
    } catch (error) {
      console.error("Error processing generic webhook:", error)
      throw error
    }
  }

  static async processWebhookWithVerification(
    payload: string,
    signature: string,
    secret: string,
    event: ResendWebhookEvent,
  ): Promise<void> {
    if (
      !EmailWebhookHandler.verifyResendSignature(payload, signature, secret)
    ) {
      throw new Error("Invalid webhook signature")
    }
    await EmailWebhookHandler.handleResendWebhook(event)
  }
}

// Utility functions
export const handleTrackingPixel = async (
  emailId: string,
  userAgent?: string,
  ip?: string,
) => {
  try {
    await trackEmailEvent({
      emailId,
      eventType: EmailEventType.OPENED,
      userAgent,
      ipAddress: ip,
    })
  } catch (error) {
    console.error("Error tracking email open:", error)
  }
}

export const handleClickTracking = async (
  emailId: string,
  url: string,
  userAgent?: string,
  ip?: string,
) => {
  try {
    await trackEmailEvent({
      emailId,
      eventType: EmailEventType.CLICKED,
      clickedUrl: url,
      userAgent,
      ipAddress: ip,
    })
  } catch (error) {
    console.error("Error tracking email click:", error)
  }
}
