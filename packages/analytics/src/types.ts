// Google Analytics types
export interface GtagConfig {
  page_path?: string
  page_title?: string
  user_id?: string
  custom_map?: Record<string, string>
  [key: string]: unknown
}

export interface GtagEventParams {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: unknown
}

export interface Gtag {
  (command: "config", targetId: string, config?: GtagConfig): void
  (command: "event", eventName: string, eventParams?: GtagEventParams): void
  (command: string, ...args: unknown[]): void
}

// PostHog types
export interface PostHogConfig {
  api_host?: string
  ui_host?: string
  autocapture?: boolean
  capture_pageview?: boolean
  disable_session_recording?: boolean
  [key: string]: unknown
}

export interface PostHogInstance {
  init(apiKey: string, config?: PostHogConfig): void
  capture(eventName: string, properties?: Record<string, unknown>): void
  identify(userId: string, properties?: Record<string, unknown>): void
  reset(): void
  setPersonProperties(properties: Record<string, unknown>): void
  group(
    groupType: string,
    groupKey: string,
    properties?: Record<string, unknown>,
  ): void
  __loaded?: boolean
}

export type PostHogReactHook = () => PostHogInstance | undefined

export interface PostHogProviderProps {
  children: React.ReactNode
  client?: PostHogInstance
}

export type PostHogProvider = (
  props: PostHogProviderProps,
) => React.ReactElement | null

// Window interface extensions
declare global {
  interface Window {
    gtag?: Gtag
    posthog?: PostHogInstance
  }
}

// Analytics tracking types
export interface TrackEventParams {
  event: string
  properties?: Record<string, unknown>
}

export interface IdentifyParams {
  userId: string
  properties?: Record<string, unknown>
}

export interface PageViewParams {
  url?: string
  title?: string
}

export interface GroupParams {
  groupType: string
  groupKey: string
  properties?: Record<string, unknown>
}
