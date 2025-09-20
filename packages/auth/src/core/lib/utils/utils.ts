"use client";

import { BetterFetchError } from "@better-fetch/fetch";
import { z } from "zod/v4";
import {
  PERMISSION_ERROR_MAPPING,
  VALIDATION_ERROR_MAPPING,
} from "../../../localization/error-mapping";
import type { PasswordValidation } from "../../../types";
import type { AuthTranslations } from "../../hooks/use-auth-translations";

export { isValidEmail } from "@raypx/shared/utils";
export { cn } from "@raypx/ui/lib/utils";

/**
 * Converts error codes from SNAKE_CASE to camelCase
 * Example: INVALID_TWO_FACTOR_COOKIE -> invalidTwoFactorCookie
 */
export function errorCodeToCamelCase(errorCode: string): string {
  return errorCode.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function transformError(error: unknown): {
  code?: string;
  message?: string;
  statusText?: string;
} {
  if (error instanceof BetterFetchError) {
    const fetchError = error as BetterFetchError;
    return {
      code: fetchError.error.code,
      message: fetchError.error.message,
      statusText: fetchError.error.statusText || fetchError.statusText,
    };
  } else if (error instanceof Error) {
    const err = error as Error;
    return {
      code: err.name,
      message: err.message,
    };
  }
  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
  };
}

/**
 * Gets a localized error message from an error object with optimized error code mapping
 */
export function getLocalizedError({
  error,
  t,
}: {
  error: unknown;
  t: AuthTranslations["t"];
}): string {
  const e = transformError(error);
  const errorCode = typeof e === "string" ? e : e.code;

  if (errorCode) {
    // Fast permission check with direct mapping access
    const permissionContext = errorCode[0] === "Y" && PERMISSION_ERROR_MAPPING[errorCode];
    if (permissionContext) {
      return t("PERMISSION_DENIED_ACTION", {
        action: permissionContext.action || "",
        resource: permissionContext.resource || "",
      });
    }

    // Fast validation check with direct mapping access
    const validationContext = VALIDATION_ERROR_MAPPING[errorCode];
    if (validationContext) {
      return t("FIELD_CONSTRAINT_ERROR", {
        field: validationContext.field || "",
        constraint: validationContext.constraint || "",
      });
    }

    // Direct translation fallback
    return t(errorCode) || errorCode;
  }

  return e.message || e.code || e.statusText || t("REQUEST_FAILED") || "Request failed";
}

export function getSearchParam(paramName: string) {
  return typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get(paramName)
    : null;
}

export function getViewByPath<T extends object>(viewPaths: T, path?: string) {
  for (const key in viewPaths) {
    if (viewPaths[key] === path) {
      return key;
    }
  }
}

export function getKeyByValue<T extends Record<string, unknown>>(
  object: T,
  value?: T[keyof T],
): keyof T | undefined {
  return (Object.keys(object) as Array<keyof T>).find((key) => object[key] === value);
}

export function getPasswordSchema(
  passwordValidation: PasswordValidation,
  localization: {
    PASSWORD_REQUIRED: string;
    PASSWORD_TOO_SHORT: string;
    PASSWORD_TOO_LONG: string;
    INVALID_PASSWORD: string;
  },
) {
  let schema = z.string().min(1, {
    message: localization.PASSWORD_REQUIRED,
  });
  if (passwordValidation?.minLength) {
    schema = schema.min(passwordValidation.minLength, {
      message: localization.PASSWORD_TOO_SHORT,
    });
  }
  if (passwordValidation?.maxLength) {
    schema = schema.max(passwordValidation.maxLength, {
      message: localization.PASSWORD_TOO_LONG,
    });
  }
  if (passwordValidation?.regex) {
    schema = schema.regex(passwordValidation.regex, {
      message: localization.INVALID_PASSWORD,
    });
  }
  return schema;
}
