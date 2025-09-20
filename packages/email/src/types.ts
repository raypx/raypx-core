import type { ReactElement } from "react";

// Core enums
export enum EmailStatus {
  QUEUED = "queued",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced",
  COMPLAINED = "complained",
  UNSUBSCRIBED = "unsubscribed",
  FAILED = "failed",
  DELIVERY_DELAYED = "delivery_delayed",
}

export enum EmailProvider {
  RESEND = "resend",
  NODEMAILER = "nodemailer",
}

export enum EmailEventType {
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced",
  COMPLAINED = "complained",
  UNSUBSCRIBED = "unsubscribed",
  DELIVERY_DELAYED = "delivery_delayed",
}

export enum ResendWebhookEventType {
  EMAIL_SENT = "email.sent",
  EMAIL_DELIVERED = "email.delivered",
  EMAIL_DELIVERY_DELAYED = "email.delivery_delayed",
  EMAIL_COMPLAINED = "email.complained",
  EMAIL_BOUNCED = "email.bounced",
  EMAIL_OPENED = "email.opened",
  EMAIL_CLICKED = "email.clicked",
}

// Base interfaces
interface BaseEmailData {
  id: string;
  subject: string;
  toAddress: string;
  createdAt: Date;
}

interface BaseEmailStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  failed: number;
}

// Main interfaces
export interface EmailDeliveryStats extends BaseEmailStats {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: ReactElement;
  provider?: EmailProvider;
  templateName?: string;
  userId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  trackingEnabled?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  emailId?: string;
  providerId?: string;
  messageId?: string;
}

export interface EmailAnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  provider?: EmailProvider;
  templateName?: string;
  userId?: string;
  tags?: string[];
  status?: EmailStatus[];
}

export interface EmailEventData {
  emailId: string;
  eventType: EmailEventType;
  timestamp?: Date;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  clickedUrl?: string;
  providerEventId?: string;
  providerData?: Record<string, unknown>;
}

export interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature?: string;
}

export interface ResendWebhookEvent extends WebhookEvent {
  type: ResendWebhookEventType;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    clicked_link?: { url: string };
    user_agent?: string;
    ip?: string;
  };
}

export interface EmailDashboardData {
  stats: EmailDeliveryStats;
  recentEmails: Array<
    BaseEmailData & {
      status: EmailStatus;
      openedAt?: Date;
      deliveredAt?: Date;
    }
  >;
  topTemplates: Array<{
    templateName: string;
    count: number;
    deliveryRate: number;
    openRate: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    sent: number;
    delivered: number;
    opened: number;
  }>;
}

export interface EmailTemplateProps {
  username?: string;
  email?: string;
  actionUrl?: string;
  otp?: string;
  organizationName?: string;
  inviterName?: string;
  apiKeyName?: string;
  securityDetails?: {
    type: string;
    description: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

// Utility constants and functions
export const EMAIL_STATUSES = Object.values(EmailStatus);
export const EMAIL_PROVIDERS = Object.values(EmailProvider);
export const EMAIL_EVENT_TYPES = Object.values(EmailEventType);
export const RESEND_WEBHOOK_EVENT_TYPES = Object.values(ResendWebhookEventType);

// Type guards
export const isValidEmailStatus = (status: string): status is EmailStatus =>
  EMAIL_STATUSES.includes(status as EmailStatus);

export const isValidEmailProvider = (provider: string): provider is EmailProvider =>
  EMAIL_PROVIDERS.includes(provider as EmailProvider);

export const isValidEmailEventType = (eventType: string): eventType is EmailEventType =>
  EMAIL_EVENT_TYPES.includes(eventType as EmailEventType);

// Display name mappings
const STATUS_DISPLAY_NAMES: Record<EmailStatus, string> = {
  [EmailStatus.QUEUED]: "Queued",
  [EmailStatus.SENT]: "Sent",
  [EmailStatus.DELIVERED]: "Delivered",
  [EmailStatus.OPENED]: "Opened",
  [EmailStatus.CLICKED]: "Clicked",
  [EmailStatus.BOUNCED]: "Bounced",
  [EmailStatus.COMPLAINED]: "Complained",
  [EmailStatus.UNSUBSCRIBED]: "Unsubscribed",
  [EmailStatus.FAILED]: "Failed",
  [EmailStatus.DELIVERY_DELAYED]: "Delivery Delayed",
};

const PROVIDER_DISPLAY_NAMES: Record<EmailProvider, string> = {
  [EmailProvider.RESEND]: "Resend",
  [EmailProvider.NODEMAILER]: "Nodemailer",
};

export const getEmailStatusDisplayName = (status: EmailStatus): string =>
  STATUS_DISPLAY_NAMES[status];

export const getEmailProviderDisplayName = (provider: EmailProvider): string =>
  PROVIDER_DISPLAY_NAMES[provider];
