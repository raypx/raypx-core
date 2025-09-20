import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// Define custom statements for our application
export const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete", "share"],
  billing: ["read", "update", "manage"],
} as const;

// Create access control instance
const ac = createAccessControl(statement);

// Define roles with specific permissions
export const user = ac.newRole({
  project: ["create", "read"],
  billing: ["read"],
});

export const admin = ac.newRole({
  project: ["create", "read", "update", "delete", "share"],
  billing: ["read", "update"],
  ...adminAc.statements, // Include all admin statements
});

export const superadmin = ac.newRole({
  project: ["create", "read", "update", "delete", "share"],
  billing: ["read", "update", "manage"],
  ...adminAc.statements, // Include all admin statements
});

// Export the access control instance and roles
export { ac };

// Role type definitions
export type UserRole = "user" | "admin" | "superadmin";

// Helper functions for permission checking
export function canManageUsers(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canBanUsers(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canDeleteUsers(role: UserRole): boolean {
  return role === "superadmin";
}

export function canImpersonateUsers(role: UserRole): boolean {
  return role === "superadmin";
}

export function canSetUserRoles(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

// Get available roles that a user can assign based on their own role
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  switch (currentUserRole) {
    case "superadmin":
      return ["user", "admin", "superadmin"];
    case "admin":
      return ["user", "admin"];
    case "user":
      return ["user"];
    default:
      return [];
  }
}

// Check if a user can assign a specific role
export function canAssignRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  const assignableRoles = getAssignableRoles(currentUserRole);
  return assignableRoles.includes(targetRole);
}

export function canCreateUsers(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canManageOrganizations(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canManageBilling(role: UserRole): boolean {
  return role === "superadmin";
}

// Get user permissions based on role
export function getUserPermissions(role: UserRole) {
  switch (role) {
    case "user":
      return user.statements;
    case "admin":
      return admin.statements;
    case "superadmin":
      return superadmin.statements;
    default:
      return {};
  }
}

// Check if user has specific permission
export function hasPermission(
  userRole: UserRole,
  resource: keyof typeof statement,
  action: (typeof statement)[keyof typeof statement][number],
): boolean {
  const permissions = getUserPermissions(userRole);

  // Handle the case where permissions might be empty or the resource doesn't exist
  if (!permissions || typeof permissions !== "object") {
    return false;
  }

  const resourceActions = permissions[resource as keyof typeof permissions] as
    | readonly string[]
    | undefined;
  return Boolean(resourceActions?.includes(action));
}
