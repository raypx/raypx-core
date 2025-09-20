/**
 * Email utility functions
 */

import { EmailEventType, EmailProvider, EmailStatus } from "./types";

// Status mappings
export const STATUS_MAP = {
  [EmailStatus.QUEUED]: "queued",
  [EmailStatus.SENT]: "sent",
  [EmailStatus.DELIVERED]: "delivered",
  [EmailStatus.OPENED]: "opened",
  [EmailStatus.CLICKED]: "clicked",
  [EmailStatus.BOUNCED]: "bounced",
  [EmailStatus.COMPLAINED]: "complained",
  [EmailStatus.UNSUBSCRIBED]: "unsubscribed",
  [EmailStatus.FAILED]: "failed",
  [EmailStatus.DELIVERY_DELAYED]: "delivery_delayed",
} as const;

// Provider mappings
export const PROVIDER_MAP = {
  [EmailProvider.RESEND]: "resend",
  [EmailProvider.NODEMAILER]: "nodemailer",
} as const;

// Event type mappings
export const EVENT_TYPE_MAP = {
  [EmailEventType.SENT]: "sent",
  [EmailEventType.DELIVERED]: "delivered",
  [EmailEventType.OPENED]: "opened",
  [EmailEventType.CLICKED]: "clicked",
  [EmailEventType.BOUNCED]: "bounced",
  [EmailEventType.COMPLAINED]: "complained",
  [EmailEventType.UNSUBSCRIBED]: "unsubscribed",
  [EmailEventType.DELIVERY_DELAYED]: "delivery_delayed",
} as const;

// Utility functions
export const getStatusValue = (status: EmailStatus): string => STATUS_MAP[status];
export const getProviderValue = (provider: EmailProvider): string => PROVIDER_MAP[provider];
export const getEventTypeValue = (eventType: EmailEventType): string => EVENT_TYPE_MAP[eventType];

// Validation functions
export const isValidStatus = (status: string): status is keyof typeof STATUS_MAP =>
  Object.values(STATUS_MAP).includes(status as EmailStatus);

export const isValidProvider = (provider: string): provider is keyof typeof PROVIDER_MAP =>
  Object.values(PROVIDER_MAP).includes(provider as EmailProvider);

export const isValidEventType = (eventType: string): eventType is keyof typeof EVENT_TYPE_MAP =>
  Object.values(EVENT_TYPE_MAP).includes(eventType as EmailEventType);
