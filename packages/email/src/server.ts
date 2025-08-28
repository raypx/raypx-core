import { db, emailEvents, emails, generateId } from "@raypx/db"
import { render } from "@react-email/render"
import { eq } from "drizzle-orm"
import * as nodemailer from "nodemailer"
import { Resend } from "resend"
import { envs } from "./envs"
import type { EmailEventData, SendEmailOptions, SendEmailResult } from "./types"
import { EmailEventType, EmailProvider } from "./types"

const env = envs()
const resend = new Resend(env.RESEND_TOKEN)
const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  auth: { user: env.MAIL_USER, pass: env.MAIL_PASSWORD },
})
const defaultFrom = env.RESEND_FROM || "Raypx <hello@raypx.com>"

// Email provider handlers
const emailProviders = {
  [EmailProvider.RESEND]: async (options: {
    to: string[]
    subject: string
    html: string
    emailId: string
  }) => {
    const result = await resend.emails.send({
      from: defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      headers: { "X-Entity-Ref-ID": options.emailId },
    })
    return { providerId: result.data?.id, result }
  },
  [EmailProvider.NODEMAILER]: async (options: {
    to: string[]
    subject: string
    html: string
    emailId: string
  }) => {
    const result = await transporter.sendMail({
      from: defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      messageId: `${options.emailId}@raypx.com`,
    })
    return { providerId: result.messageId, result }
  },
}

export const sendEmail = async (
  options: SendEmailOptions,
): Promise<SendEmailResult> => {
  const {
    to,
    subject,
    template,
    provider = EmailProvider.NODEMAILER,
    templateName,
    userId,
    tags = [],
    metadata = {},
    trackingEnabled = true,
  } = options
  const emailId = generateId()
  const toAddress = Array.isArray(to) ? to[0] : to

  try {
    const html = await render(template)

    // Create email record if tracking enabled
    if (trackingEnabled) {
      await db.insert(emails).values({
        id: emailId,
        messageId: `${emailId}@raypx.com`,
        fromAddress: defaultFrom,
        toAddress,
        subject,
        templateName,
        provider,
        status: "queued",
        userId,
        tags,
        metadata,
      })
    }

    // Send email via provider
    const { providerId } = await emailProviders[provider]({
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      emailId,
    })

    // Update status if tracking enabled
    if (trackingEnabled) {
      await db
        .update(emails)
        .set({
          providerId,
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emails.id, emailId))
    }

    return {
      success: true,
      emailId,
      providerId,
      messageId: `${emailId}@raypx.com`,
    }
  } catch (error) {
    console.error("Error sending email:", error)

    // Update failed status if tracking enabled
    if (trackingEnabled) {
      try {
        await db
          .update(emails)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(emails.id, emailId))
      } catch (dbError) {
        console.error("Error updating email status:", dbError)
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      emailId,
    }
  }
}

export const trackEmailEvent = async (
  eventData: EmailEventData,
): Promise<void> => {
  try {
    await db.insert(emailEvents).values({
      id: generateId(),
      emailId: eventData.emailId,
      eventType: eventData.eventType,
      timestamp: eventData.timestamp || new Date(),
      userAgent: eventData.userAgent,
      ipAddress: eventData.ipAddress,
      location: eventData.location,
      clickedUrl: eventData.clickedUrl,
      providerEventId: eventData.providerEventId,
      providerData: eventData.providerData,
      createdAt: new Date(),
    })

    // Update email status
    const statusMap: Record<EmailEventType, string> = {
      [EmailEventType.SENT]: "sent",
      [EmailEventType.DELIVERED]: "delivered",
      [EmailEventType.OPENED]: "opened",
      [EmailEventType.CLICKED]: "clicked",
      [EmailEventType.BOUNCED]: "bounced",
      [EmailEventType.COMPLAINED]: "complained",
      [EmailEventType.UNSUBSCRIBED]: "unsubscribed",
      [EmailEventType.DELIVERY_DELAYED]: "delivery_delayed",
    }

    const newStatus = statusMap[eventData.eventType]
    if (newStatus) {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
      }

      // Add specific timestamp fields based on event type
      if (eventData.eventType === EmailEventType.OPENED) {
        updateData.openedAt = new Date()
      }
      if (eventData.eventType === EmailEventType.DELIVERED) {
        updateData.deliveredAt = new Date()
      }

      await db
        .update(emails)
        .set(updateData)
        .where(eq(emails.id, eventData.emailId))
    }
  } catch (error) {
    console.error("Error tracking email event:", error)
    throw error
  }
}

export const getEmailById = async (emailId: string) => {
  try {
    const results = await db
      .select()
      .from(emails)
      .where(eq(emails.id, emailId))
      .limit(1)
    return results[0] || null
  } catch (error) {
    console.error("Error getting email by ID:", error)
    throw error
  }
}

export const getEmailEvents = async (emailId: string) => {
  try {
    return await db
      .select()
      .from(emailEvents)
      .where(eq(emailEvents.emailId, emailId))
      .orderBy(emailEvents.timestamp)
  } catch (error) {
    console.error("Error getting email events:", error)
    throw error
  }
}
