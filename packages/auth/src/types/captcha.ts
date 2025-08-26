export type CaptchaProvider =
  | "cloudflare-turnstile"
  | "google-recaptcha-v2-checkbox"
  | "google-recaptcha-v2-invisible"
  | "google-recaptcha-v3"
  | "hcaptcha"

export type CaptchaOptions = {
  siteKey: string
  provider: CaptchaProvider
  hideBadge?: boolean
  recaptchaNet?: boolean
  enterprise?: boolean
  endpoints?: string[]
}
