/**
 * Email package main exports
 */

export { EmailAnalytics } from "./analytics"
// Client utilities
export type { EmailClientOptions, EmailClientResponse } from "./client"
export { DEFAULT_EMAIL_CLIENT_OPTIONS } from "./client"
// Environment configuration
export { envs } from "./envs"
// Core services
export {
  getEmailById,
  getEmailEvents,
  sendEmail,
  trackEmailEvent,
} from "./server"
export * from "./templates"
// Core types
export type {
  EmailAnalyticsFilter,
  EmailDashboardData,
  EmailDeliveryStats,
  EmailEventData,
  EmailTemplateProps,
  ResendWebhookEvent,
  SendEmailOptions,
  SendEmailResult,
  WebhookEvent,
} from "./types"
// Core enums
// Utility functions and constants
export {
  EMAIL_EVENT_TYPES,
  EMAIL_PROVIDERS,
  EMAIL_STATUSES,
  EmailEventType,
  EmailProvider,
  EmailStatus,
  getEmailProviderDisplayName,
  getEmailStatusDisplayName,
  isValidEmailEventType,
  isValidEmailProvider,
  isValidEmailStatus,
  RESEND_WEBHOOK_EVENT_TYPES,
  ResendWebhookEventType,
} from "./types"
// Additional utility functions
export {
  EVENT_TYPE_MAP,
  getEventTypeValue,
  getProviderValue,
  getStatusValue,
  isValidEventType,
  isValidProvider,
  isValidStatus,
  PROVIDER_MAP,
  STATUS_MAP,
} from "./utils"
export { EmailWebhookHandler } from "./webhooks"
