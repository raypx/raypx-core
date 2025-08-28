import { db, emailEvents, emails, generateId } from "@raypx/db"
import { render } from "@react-email/render"
import { eq } from "drizzle-orm"
import * as nodemailer from "nodemailer"
import type { ReactElement } from "react"
import { Resend } from "resend"
import { envs } from "./envs"
import type { EmailEventData, SendEmailOptions, SendEmailResult } from "./types"

const env = envs()

export const resend = new Resend(env.RESEND_TOKEN)

export const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASSWORD,
  },
})

const defaultFrom = env.RESEND_FROM || "Raypx <hello@raypx.com>"

export const sendEmail = async (
  options: SendEmailOptions,
): Promise<SendEmailResult> => {
  const {
    to,
    subject,
    template,
    provider = "nodemailer",
    templateName,
    userId,
    tags = [],
    metadata = {},
    trackingEnabled = true,
  } = options

  const emailId = generateId()
  const messageId = `${emailId}@raypx.com`
  const toAddress = Array.isArray(to) ? to[0] : to // For now, handle single recipient

  try {
    const html = await render(template)

    // Create email record in database
    if (trackingEnabled) {
      await db.insert(emails).values({
        id: emailId,
        messageId,
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

    let providerId: string | undefined
    let result: any

    if (provider === "resend") {
      result = await resend.emails.send({
        from: defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        headers: trackingEnabled
          ? {
              "X-Entity-Ref-ID": emailId,
            }
          : undefined,
      })
      providerId = result.data?.id
    } else {
      result = await transporter.sendMail({
        from: defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        messageId,
      })
      providerId = result.messageId
    }

    // Update email record with provider ID and sent status
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

      // Log sent event
      await trackEmailEvent({
        emailId,
        eventType: "sent",
        providerEventId: providerId,
        providerData: result,
      })
    }

    return {
      success: true,
      emailId: trackingEnabled ? emailId : undefined,
      providerId,
      messageId,
    }
  } catch (error) {
    console.error("Failed to send email:", error)

    // Log failed status if tracking enabled
    if (trackingEnabled) {
      try {
        await db
          .update(emails)
          .set({
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            updatedAt: new Date(),
          })
          .where(eq(emails.id, emailId))

        await trackEmailEvent({
          emailId,
          eventType: "failed",
          providerData: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })
      } catch (dbError) {
        console.error("Failed to update email status:", dbError)
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      emailId: trackingEnabled ? emailId : undefined,
    }
  }
}

export { render } from "@react-email/render"

export const trackEmailEvent = async (
  eventData: EmailEventData,
): Promise<void> => {
  try {
    await db.insert(emailEvents).values({
      emailId: eventData.emailId,
      eventType: eventData.eventType,
      timestamp: eventData.timestamp || new Date(),
      userAgent: eventData.userAgent,
      ipAddress: eventData.ipAddress,
      location: eventData.location,
      clickedUrl: eventData.clickedUrl,
      providerEventId: eventData.providerEventId,
      providerData: eventData.providerData,
    })

    // Update email status based on event type
    const statusMap: Record<string, string> = {
      delivered: "delivered",
      opened: "opened",
      clicked: "clicked",
      bounced: "bounced",
      complained: "complained",
      unsubscribed: "unsubscribed",
    }

    const newStatus = statusMap[eventData.eventType]
    if (newStatus) {
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date(),
      }

      // Update specific timestamp fields
      switch (eventData.eventType) {
        case "delivered":
          updateData.deliveredAt = eventData.timestamp || new Date()
          break
        case "opened":
          updateData.openedAt = eventData.timestamp || new Date()
          updateData.openCount = String(
            parseInt(updateData.openCount || "0") + 1,
          )
          break
        case "clicked":
          updateData.firstClickedAt = eventData.timestamp || new Date()
          updateData.clickCount = String(
            parseInt(updateData.clickCount || "0") + 1,
          )
          break
        case "bounced":
          updateData.bouncedAt = eventData.timestamp || new Date()
          break
        case "complained":
          updateData.complainedAt = eventData.timestamp || new Date()
          break
        case "unsubscribed":
          updateData.unsubscribedAt = eventData.timestamp || new Date()
          break
      }

      await db
        .update(emails)
        .set(updateData)
        .where(eq(emails.id, eventData.emailId))
    }
  } catch (error) {
    console.error("Failed to track email event:", error)
  }
}
