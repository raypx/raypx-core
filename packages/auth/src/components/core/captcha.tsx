"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import type { RefObject } from "react";
import type ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../core/hooks/use-auth";
import { useTheme } from "../../core/hooks/use-theme";
import { RecaptchaBadge } from "./recaptcha-badge";
import { RecaptchaV2 } from "./recaptcha-v2";

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = ["/sign-up/email", "/sign-in/email", "/forget-password"] as const;

// Captcha endpoints type
type CaptchaEndpoint = (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number];

// Union type for all possible captcha refs
type CaptchaRef =
  | RefObject<ReCAPTCHA | null>
  | RefObject<TurnstileInstance | null>
  | RefObject<HCaptcha | null>;

interface CaptchaProps {
  /** Ref to the captcha component instance - must match the provider type */
  ref: CaptchaRef;
  /** Optional action to check if it's in the captcha-enabled endpoints list */
  action?: CaptchaEndpoint | string;
}

export function Captcha({ ref, action }: CaptchaProps) {
  const { captcha } = useAuth();
  if (!captcha) return null;

  // If action is provided, check if it's in the list of captcha-enabled endpoints
  if (action) {
    const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS;
    if (!endpoints.includes(action as CaptchaEndpoint)) {
      return null;
    }
  }

  const { resolvedTheme } = useTheme();

  const showRecaptchaV2 =
    captcha.provider === "google-recaptcha-v2-checkbox" ||
    captcha.provider === "google-recaptcha-v2-invisible";

  const showRecaptchaBadge =
    captcha.provider === "google-recaptcha-v3" ||
    captcha.provider === "google-recaptcha-v2-invisible";

  const showTurnstile = captcha.provider === "cloudflare-turnstile";

  const showHCaptcha = captcha.provider === "hcaptcha";

  return (
    <>
      {showRecaptchaV2 && <RecaptchaV2 ref={ref as RefObject<ReCAPTCHA | null>} />}
      {showRecaptchaBadge && <RecaptchaBadge />}
      {showTurnstile && (
        <Turnstile
          className="mx-auto"
          ref={ref as RefObject<TurnstileInstance | null>}
          siteKey={captcha.siteKey}
          options={{
            theme: resolvedTheme,
            size: "flexible",
          }}
        />
      )}
      {showHCaptcha && (
        <div className="mx-auto">
          <HCaptcha
            ref={ref as RefObject<HCaptcha | null>}
            sitekey={captcha.siteKey}
            theme={resolvedTheme}
          />
        </div>
      )}
    </>
  );
}
