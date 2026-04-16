/**
 * Tenant staff / cooperative admin area: backend enforces access_admin_panel + route permissions.
 * This mirrors that for client-side navigation and guards.
 */
export function hasTenantStaffDashboardAccess(userData: {
  permissions?: string[]
  roles?: string[]
  role?: string
} | null): boolean {
  if (!userData) return false

  const perms = userData.permissions
  if (Array.isArray(perms) && perms.includes("access_admin_panel")) {
    return true
  }

  const roles = userData.roles?.length ? userData.roles : userData.role ? [userData.role] : []
  const norm = (r: string) => r?.toLowerCase().replace(/-/g, "_") ?? ""

  if (roles.some((r) => norm(r) === "super_admin")) {
    return true
  }

  const staffRoles = new Set([
    "admin",
    "finance_manager",
    "loan_officer",
    "property_manager",
    "member_manager",
    "document_manager",
    "system_admin",
    "investment_manager",
    "staff",
  ])

  return roles.some((r) => staffRoles.has(norm(r)))
}
