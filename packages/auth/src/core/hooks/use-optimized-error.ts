/**
 * Optimized error handling hook with maximum performance
 * Uses short-circuit evaluation and minimal lookups for error mapping
 */
import {
  PERMISSION_ERROR_MAPPING,
  VALIDATION_ERROR_MAPPING,
} from "../../localization/error-mapping";
import { useAuth } from "./use-auth";

export function useOptimizedError() {
  const { t } = useAuth();

  /**
   * Get localized error text with optimized mapping lookup
   * @param errorCode - Error code to translate
   * @param fallbackText - Optional fallback text
   * @returns Localized error message
   */
  const getErrorText = (errorCode: string, fallbackText?: string): string => {
    // Fast permission check: only check mapping if starts with "Y"
    const permissionContext = errorCode[0] === "Y" && PERMISSION_ERROR_MAPPING[errorCode];
    if (permissionContext) {
      return t("PERMISSION_DENIED_ACTION", permissionContext);
    }

    // Check validation error mapping
    const validationContext = VALIDATION_ERROR_MAPPING[errorCode];
    if (validationContext) {
      return t("FIELD_CONSTRAINT_ERROR", validationContext);
    }

    // Fallback chain: custom fallback -> translation -> raw code
    return fallbackText || t(errorCode) || errorCode;
  };

  /**
   * Process multiple error codes in batch
   * @param errorCodes - Array of error codes
   * @returns Array of localized error messages
   */
  const getErrorTexts = (errorCodes: string[], fallbackText?: string): string[] => {
    return errorCodes.map((errorCode) => getErrorText(errorCode, fallbackText));
  };

  /**
   * Extract and format error from API response
   * @param apiResponse - API response object
   * @returns Formatted error message or null
   */
  const extractAndFormatError = (apiResponse: {
    error?: { code?: string; message?: string };
  }): string | null => {
    const errorCode = apiResponse?.error?.code || apiResponse?.error?.message || undefined;
    return typeof errorCode === "string" ? getErrorText(errorCode) : null;
  };

  return {
    getErrorText,
    getErrorTexts,
    extractAndFormatError,
  };
}
