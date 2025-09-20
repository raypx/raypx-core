/**
 * Email templates exports
 */

// Template types
export type { EmailTemplateProps } from "../types";
export { ApiKeyCreatedEmail } from "./api-key-created-email";
// Layout components
export { EmailLayout } from "./layout-email";
// Organization templates
export { OrganizationInviteEmail } from "./organization-invite-email";
export { ResetPasswordEmail } from "./reset-password-email";
// Security templates
export { SecurityAlertEmail } from "./security-alert-email";
export { SendMagicLinkEmail } from "./send-magic-link-email";
export { SendVerificationOTP } from "./send-verification-otp";
export { VerifyEmail } from "./verify-email";
// Authentication templates
export { WelcomeEmail } from "./welcome-email";
