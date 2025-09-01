/**
 * Error code mapping and parameterization
 * Maps specific error codes returned from backend to parameterized generic error messages
 */

export type ErrorContext = Record<string, string | number | Date>

/**
 * Permission error mapping table
 * Maps specific error codes to generic error patterns and parameters
 */
export const PERMISSION_ERROR_MAPPING: Record<string, ErrorContext> = {
  // User-related permissions
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: {
    action: "create",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: {
    action: "delete",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: {
    action: "list",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: {
    action: "ban",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: {
    action: "change role of",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: {
    action: "impersonate",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS: {
    action: "revoke sessions of",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: {
    action: "set password for",
    resource: "users",
  },
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS: {
    action: "list sessions of",
    resource: "users",
  },

  // Organization-related permissions
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: {
    action: "create",
    resource: "organizations",
  },
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: {
    action: "update",
    resource: "this organization",
  },
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: {
    action: "delete",
    resource: "this organization",
  },
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: {
    action: "invite users to",
    resource: "this organization",
  },

  // Member-related permissions
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: {
    action: "delete",
    resource: "this member",
  },
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: {
    action: "update",
    resource: "this member",
  },
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: {
    action: "invite user with",
    resource: "this role",
  },

  // Team-related permissions
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: {
    action: "create",
    resource: "teams",
  },
  YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION: {
    action: "create teams in",
    resource: "this organization",
  },
  YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION: {
    action: "delete teams in",
    resource: "this organization",
  },
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: {
    action: "update",
    resource: "this team",
  },
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: {
    action: "delete",
    resource: "this team",
  },

  // Invitation-related permissions
  YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: {
    action: "cancel",
    resource: "this invitation",
  },

  // Passkey-related permissions
  YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY: {
    action: "register",
    resource: "this passkey",
  },
}

/**
 * Get parameterized text for permission errors
 */
export function getPermissionErrorText(
  errorCode: string,
  t: (key: string, params?: Record<string, unknown>) => string,
): string {
  const context = PERMISSION_ERROR_MAPPING[errorCode]

  if (context) {
    return t("PERMISSION_DENIED_ACTION", {
      action: context.action,
      resource: context.resource,
    })
  }

  // Fallback: if no mapping found, return original error text
  return t(errorCode)
}

/**
 * Other optimizable error categories
 */
export const VALIDATION_ERROR_MAPPING: Record<string, ErrorContext> = {
  USERNAME_TOO_SHORT: {
    field: "Username",
    constraint: "too short",
  },
  USERNAME_TOO_LONG: {
    field: "Username",
    constraint: "too long",
  },
  PASSWORD_TOO_SHORT: {
    field: "Password",
    constraint: "too short",
  },
  PASSWORD_TOO_LONG: {
    field: "Password",
    constraint: "too long",
  },
}

export function getValidationErrorText(
  errorCode: string,
  t: (key: string, params?: Record<string, unknown>) => string,
): string {
  const context = VALIDATION_ERROR_MAPPING[errorCode]

  if (context) {
    return t("FIELD_CONSTRAINT_ERROR", {
      field: context.field,
      constraint: context.constraint,
    })
  }

  return t(errorCode)
}

/**
 * Generic error handling function
 */
export function getOptimizedErrorText(
  errorCode: string,
  t: (key: string, params?: Record<string, unknown>) => string,
): string {
  // First try permission error mapping
  if (errorCode.startsWith("YOU_ARE_NOT_ALLOWED_TO_")) {
    return getPermissionErrorText(errorCode, t)
  }

  // Try validation error mapping
  if (VALIDATION_ERROR_MAPPING[errorCode]) {
    return getValidationErrorText(errorCode, t)
  }

  // Fallback to original error text
  return t(errorCode)
}
