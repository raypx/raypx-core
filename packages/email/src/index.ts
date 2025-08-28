export { sendEmail } from "./server"
export {
  ApiKeyCreatedEmail,
  EmailLayout,
  OrganizationInviteEmail,
  ResetPasswordEmail,
  SecurityAlertEmail,
  SendMagicLinkEmail,
  SendVerificationOTP,
  VerifyEmail,
  WelcomeEmail,
} from "./templates"
export type {
  EmailDashboardData,
  EmailDeliveryStats,
  SendEmailOptions,
  SendEmailResult,
} from "./types"
