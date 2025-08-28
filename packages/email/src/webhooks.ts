import { db, emails } from "@raypx/db"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { envs } from "./envs"
import { trackEmailEvent } from "./server"
import type { ResendWebhookEvent, WebhookEvent } from "./types"

const env = envs()

export class EmailWebhookHandler {
  /**
   * Verify webhook signature for Resend
   */
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

  /**
   * Process Resend webhook events
   */
  static async handleResendWebhook(event: ResendWebhookEvent): Promise<void> {
    try {
      const { type, data } = event

      // Find email by provider ID
      const emailRecords = await db
        .select()
        .from(emails)
        .where(eq(emails.providerId, data.email_id))
        .limit(1)

      if (emailRecords.length === 0) {
        console.warn(`Email not found for provider ID: ${data.email_id}`)
        return
      }

      const emailRecord = emailRecords[0]

      // Map Resend event types to our internal event types
      const eventTypeMap: Record<string, string> = {
        "email.sent": "sent",
        "email.delivered": "delivered",
        "email.delivery_delayed": "delivery_delayed",
        "email.complained": "complained",
        "email.bounced": "bounced",
        "email.opened": "opened",
        "email.clicked": "clicked",
      }

      const internalEventType = eventTypeMap[type]
      if (!internalEventType) {
        console.warn(`Unknown event type: ${type}`)
        return
      }

      // Extract additional data based on event type
      const additionalData: any = {}
      if (type === "email.clicked" && data.clicked_link) {
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

  /**
   * Process generic webhook events
   */
  static async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      // Handle different webhook providers
      if (event.type.startsWith("email.")) {
        // Resend webhook
        await EmailWebhookHandler.handleResendWebhook(
          event as ResendWebhookEvent,
        )
      } else {
        console.warn(`Unknown webhook event type: ${event.type}`)
      }
    } catch (error) {
      console.error("Error handling webhook event:", error)
      throw error
    }
  }

  /**
   * Create a Next.js API route handler for webhooks
   */
  static createWebhookHandler() {
    return async (request: Request) => {
      try {
        const body = await request.text()
        const signature = request.headers.get("webhook-signature") || ""

        // Verify signature if webhook secret is configured
        if (env.RESEND_WEBHOOK_SECRET && signature) {
          const isValid = EmailWebhookHandler.verifyResendSignature(
            body,
            signature,
            env.RESEND_WEBHOOK_SECRET,
          )

          if (!isValid) {
            return new Response("Invalid signature", { status: 401 })
          }
        }

        const event: WebhookEvent = JSON.parse(body)

        await EmailWebhookHandler.handleWebhookEvent(event)

        return new Response("OK", { status: 200 })
      } catch (error) {
        console.error("Webhook handler error:", error)
        return new Response("Internal Server Error", { status: 500 })
      }
    }
  }
}

/**
 * Utility function to handle email tracking pixel
 */
export const handleTrackingPixel = async (
  emailId: string,
  userAgent?: string,
  ip?: string,
) => {
  try {
    await trackEmailEvent({
      emailId,
      eventType: "opened",
      userAgent,
      ipAddress: ip,
    })
  } catch (error) {
    console.error("Error tracking email open:", error)
  }
}

/**
 * Utility function to handle click tracking
 */
export const handleClickTracking = async (
  emailId: string,
  url: string,
  userAgent?: string,
  ip?: string,
) => {
  try {
    await trackEmailEvent({
      emailId,
      eventType: "clicked",
      clickedUrl: url,
      userAgent,
      ipAddress: ip,
    })
  } catch (error) {
    console.error("Error tracking email click:", error)
  }
}
