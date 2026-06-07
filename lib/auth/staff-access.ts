import { getEffectiveRoleNames } from "./user-roles"

function normalizeRoleName(role: string | undefined | null): string {
  return role?.toLowerCase().replace(/-/g, "_") ?? ""
}

function isStaffRoleName(role: string): boolean {
  const normalized = normalizeRoleName(role)
  return normalized === "super_admin" || normalized === "admin"
}

/**
 * Tenant staff / cooperative admin area: backend enforces access_admin_panel + route permissions.
 * Mirrors App\Models\Tenant\User::isAdmin() so login routing matches API access.
 */
export function hasTenantStaffDashboardAccess(userData: {
  permissions?: string[]
  roles?: string[]
  role?: string | { slug?: string }
} | null): boolean {
  if (!userData) return false

  const roles = getEffectiveRoleNames(userData)

  if (roles.some((role) => isStaffRoleName(role))) {
    return true
  }

  const legacyRole =
    typeof userData.role === "object" && userData.role?.slug
      ? userData.role.slug
      : typeof userData.role === "string"
        ? userData.role
        : ""

  if (isStaffRoleName(legacyRole)) {
    return true
  }

  const perms = userData.permissions
  return Array.isArray(perms) && perms.includes("access_admin_panel")
}
