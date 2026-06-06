import { getEffectiveRoleNames } from "./user-roles"

/**
 * Tenant staff / cooperative admin area: backend enforces access_admin_panel + route permissions.
 * Client-side guard mirrors TenantStaffAccessMiddleware — no legacy role-name bypass.
 */
export function hasTenantStaffDashboardAccess(userData: {
  permissions?: string[]
  roles?: string[]
  role?: string | { slug?: string }
} | null): boolean {
  if (!userData) return false

  const roles = getEffectiveRoleNames(userData)
  const norm = (r: string) => r?.toLowerCase().replace(/-/g, "_") ?? ""

  if (roles.some((r) => norm(r) === "super_admin")) {
    return true
  }

  const perms = userData.permissions
  return Array.isArray(perms) && perms.includes("access_admin_panel")
}
