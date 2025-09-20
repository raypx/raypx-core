export { default as appConfig } from "./app.config";
export { default as authConfig } from "./auth.config";
export {
  BillingProviderSchema,
  default as billingConfig,
} from "./billing.config";
export { default as featuresConfig } from "./features.config";
export { default as pathsConfig } from "./paths.config";

// Re-export commonly used types
export type AppConfig = typeof import("./app.config").default;
export type FeaturesConfig = typeof import("./features.config").default;
export type PathsConfig = typeof import("./paths.config").default;
export type AuthConfig = typeof import("./auth.config").default;
export type BillingConfig = typeof import("./billing.config").default;
