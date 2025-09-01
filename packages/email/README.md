# @raypx/email

Email service package for Raypx with support for multiple providers, analytics, and webhooks.

## Features

- Multiple email providers (Resend, Nodemailer)
- Email tracking and analytics
- Webhook handling for delivery events
- React email templates
- Type-safe API with TypeScript enums
- Optimized and compressed codebase

## Installation

```bash
pnpm add @raypx/email
```

## Usage

### Basic Email Sending

```typescript
import { sendEmail, EmailProvider } from '@raypx/email'
import { WelcomeEmail } from '@raypx/email/templates'

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform!',
  template: <WelcomeEmail username="John" />,
  provider: EmailProvider.RESEND,
  templateName: 'welcome',
  trackingEnabled: true,
})
```

### Working with Enums and Utilities

```typescript
import { 
  EmailStatus, 
  EmailProvider, 
  EmailEventType,
  getStatusValue,
  getProviderValue,
  STATUS_MAP,
  PROVIDER_MAP,
} from '@raypx/email'

// Get string values for database operations
const statusValue = getStatusValue(EmailStatus.DELIVERED) // "delivered"
const providerValue = getProviderValue(EmailProvider.RESEND) // "resend"

// Use mapping objects directly
const allStatuses = Object.values(STATUS_MAP)
const allProviders = Object.values(PROVIDER_MAP)

// Type-safe comparisons
if (status === EmailStatus.DELIVERED) {
  console.log('Email was delivered')
}
```

### Email Analytics

```typescript
import { EmailAnalytics, EmailStatus } from '@raypx/email'

const stats = await EmailAnalytics.getDeliveryStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  status: [EmailStatus.DELIVERED, EmailStatus.OPENED],
})
```

### Webhook Handling

```typescript
import { EmailWebhookHandler, ResendWebhookEventType } from '@raypx/email'

const webhookEvent = {
  type: ResendWebhookEventType.EMAIL_OPENED,
  data: {
    email_id: 'email_123',
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Email',
    created_at: '2024-01-01T00:00:00Z',
  },
}

await EmailWebhookHandler.handleResendWebhook(webhookEvent)
```

## API Reference

### Core Enums

- `EmailStatus`: Email delivery statuses
- `EmailProvider`: Supported email providers
- `EmailEventType`: Email event types
- `ResendWebhookEventType`: Resend webhook event types

### Core Functions

- `sendEmail()`: Send emails with tracking
- `trackEmailEvent()`: Track email events
- `getEmailById()`: Get email by ID
- `getEmailEvents()`: Get email events

### Classes

- `EmailAnalytics`: Email analytics and reporting
- `EmailWebhookHandler`: Webhook event processing

### Utility Functions

#### Type Conversion
- `getStatusValue()`: Convert enum to string value
- `getProviderValue()`: Convert enum to string value
- `getEventTypeValue()`: Convert enum to string value

#### Validation
- `isValidStatus()`: Validate email status
- `isValidProvider()`: Validate email provider
- `isValidEventType()`: Validate email event type

#### Display Names
- `getEmailStatusDisplayName()`: Get human-readable status names
- `getEmailProviderDisplayName()`: Get human-readable provider names

#### Constants
- `STATUS_MAP`: Status enum to string mapping
- `PROVIDER_MAP`: Provider enum to string mapping
- `EVENT_TYPE_MAP`: Event type enum to string mapping

## Code Optimization Features

### 1. **Compressed Types**
- Base interfaces for common properties
- Merged similar interfaces to reduce duplication
- Simplified type definitions

### 2. **Optimized Logic**
- Provider handlers pattern for email sending
- Status update mapping for event tracking
- Simplified database queries

### 3. **Utility Functions**
- Centralized mapping objects
- Type-safe conversion functions
- Validation helpers

### 4. **Reduced Bundle Size**
- Removed verbose JSDoc comments
- Consolidated similar functions
- Optimized import/export structure

## Environment Variables

```env
# Resend Configuration
RESEND_FROM=your-email@domain.com
RESEND_TOKEN=re_your_token_here
RESEND_WEBHOOK_SECRET=your_webhook_secret

# SMTP Configuration (optional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_username
MAIL_PASSWORD=your_password

# Feature Flags
EMAIL_TRACKING_ENABLED=true
```

## Templates

Pre-built email templates:

- `WelcomeEmail`: Welcome message for new users
- `VerifyEmail`: Email verification
- `ResetPasswordEmail`: Password reset
- `OrganizationInviteEmail`: Organization invitations
- `SecurityAlertEmail`: Security notifications
- `ApiKeyCreatedEmail`: API key creation confirmations

## Performance Improvements

- **Reduced memory usage**: Optimized data structures
- **Faster execution**: Simplified logic paths
- **Smaller bundle**: Compressed type definitions
- **Better tree-shaking**: Optimized exports

## Contributing

When adding new email statuses or event types:

1. Update the corresponding enums in `src/types.ts`
2. Add mappings to `src/utils.ts`
3. Update all related code to use the new enum values
4. Ensure database schema compatibility

## Migration Guide

### From Previous Version

```typescript
// Old way
import { isValidEmailStatus } from '@raypx/email'

// New way
import { isValidStatus } from '@raypx/email'

// Old way
const status = "delivered"

// New way
const status = EmailStatus.DELIVERED
const statusValue = getStatusValue(status) // "delivered"
```
