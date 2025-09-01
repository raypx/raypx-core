# @raypx/config

A centralized configuration system for Raypx applications, inspired by the MakerKit configuration architecture.

## Features

- 🔧 Type-safe configuration with Zod validation
- 🎛️ Feature flags system for controlling application features
- 🛡️ Environment-based validation (strict HTTPS in production)
- 🎨 Theme and appearance configuration
- 🔐 Authentication provider configuration
- 💳 Billing system configuration
- 📱 Path and routing configuration

## Installation

```bash
pnpm add @raypx/config
```

## Usage

### Basic Configuration

```typescript
import { appConfig, featuresConfig, pathsConfig } from '@raypx/config'

// Get app information
console.log(appConfig.name) // "Raypx"
console.log(appConfig.url)  // "http://localhost:3000"

// Check feature flags
if (featuresConfig.enableAI) {
  // Enable AI features
}

// Use path configuration
const dashboardPath = pathsConfig.app.dashboard
```

### Feature Flags

```typescript
import { featuresConfig } from '@raypx/config'

// Control theme toggle
if (featuresConfig.enableThemeToggle) {
  // Show theme toggle component
}

// Control team features
if (featuresConfig.enableTeamAccounts) {
  // Show team creation UI
}

// Control AI features
if (featuresConfig.enableAI) {
  // Load AI components
}
```

### Authentication Configuration

```typescript
import { authConfig } from '@raypx/config'

// Check enabled providers
if (authConfig.providers.password) {
  // Show email/password form
}

if (authConfig.providers.oAuth.includes('google')) {
  // Show Google OAuth button
}

// Check MFA settings
if (authConfig.enableMFA) {
  // Enable MFA flow
}
```

### Billing Configuration

```typescript
import { billingConfig } from '@raypx/config'

// Get available products
const products = billingConfig.products

// Find featured product
const featuredProduct = products.find(p => p.highlighted)
```

## Environment Variables

Set these environment variables to configure your application:

### App Configuration
```bash
NEXT_PUBLIC_PRODUCT_NAME="Raypx"
NEXT_PUBLIC_SITE_TITLE="Raypx - AI-Powered Platform"
NEXT_PUBLIC_SITE_DESCRIPTION="A modern AI-powered platform"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="en"
NEXT_PUBLIC_DEFAULT_THEME_MODE="system"
NEXT_PUBLIC_THEME_COLOR="#3b82f6"
NEXT_PUBLIC_THEME_COLOR_DARK="#1e40af"
```

### Feature Flags
```bash
NEXT_PUBLIC_ENABLE_THEME_TOGGLE="true"
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS="true"
NEXT_PUBLIC_ENABLE_AI="true"
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
# ... see .env.example for full list
```

### Authentication
```bash
NEXT_PUBLIC_AUTH_PASSWORD="true"
NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS="google,github"
NEXT_PUBLIC_ENABLE_MFA="false"
```

### Billing
```bash
NEXT_PUBLIC_BILLING_PROVIDER="stripe"
```

## Configuration Files

- `app.config.ts` - Basic application settings
- `features.config.ts` - Feature flags and toggles
- `paths.config.ts` - Route and path definitions
- `auth.config.ts` - Authentication configuration
- `billing.config.ts` - Billing and pricing configuration

## Type Safety

All configurations are validated with Zod schemas and provide full TypeScript support:

```typescript
import type { AppConfig, FeaturesConfig } from '@raypx/config'

// These types are automatically inferred from the schemas
const config: AppConfig = appConfig
const features: FeaturesConfig = featuresConfig
```

## Development vs Production

The configuration system automatically adjusts validation based on environment:

- **Development**: Allows HTTP URLs, more lenient validation
- **Production**: Enforces HTTPS URLs, strict validation
- **CI/Build**: Flexible validation for build processes

## Extending Configuration

You can extend the base configuration in your applications:

```typescript
// apps/web/config/app.config.ts
import { appConfig } from '@raypx/config'
import { z } from 'zod'

const ExtendedAppSchema = z.object({
  // Include base config
  ...appConfig,
  // Add app-specific config
  customFeature: z.boolean(),
})

const webAppConfig = ExtendedAppSchema.parse({
  ...appConfig,
  customFeature: process.env.NEXT_PUBLIC_CUSTOM_FEATURE === 'true',
})

export default webAppConfig
```