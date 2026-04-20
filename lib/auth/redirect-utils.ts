import type { AuthUser } from "./types"
import { hasTenantStaffDashboardAccess } from "./staff-access"
import { getEffectiveRoleNames, getRoleSlug } from "./user-roles"

/**
 * Determines the appropriate dashboard route based on user roles
 */
export function getDashboardRoute(user: AuthUser | null | undefined): string {
  if (!user) {
    return "/dashboard" // Default to member dashboard
  }

  if (user.permissions?.includes("access_admin_panel")) {
    return "/admin"
  }

  const userRoles = getEffectiveRoleNames(user)

  // Also handle case where roles might be objects with 'name' property
  const roleNames = userRoles.map((role: any) => {
    if (typeof role === 'string') return role.toLowerCase()
    if (role?.name) return role.name.toLowerCase()
    if (role?.slug) return role.slug.toLowerCase()
    return String(role).toLowerCase()
  })

  if (roleNames.length === 0) {
    return "/dashboard" // Default to member dashboard
  }

  // Super admin gets super admin dashboard
  if (roleNames.some(role => role === 'super-admin' || role === 'super_admin')) {
    return "/super-admin"
  }

  // Admin roles get admin dashboard
  const adminRoles = [
    "admin",           // Main admin role
    "tenant-admin",
    "tenant_admin",
    "finance_manager", 
    "finance-manager",
    "accountant",
    "loan_officer",
    "loan-officer",
    "property_manager",
    "property-manager",
    "manager",
    "member_manager",
    "member-manager",
    "document_manager",
    "document-manager",
    "system_admin",
    "system-admin",
    "investment_manager",
    "investment-manager"
  ]

  if (roleNames.some(role => adminRoles.includes(role))) {
    return "/admin"
  }

  // Default to member dashboard
  return "/dashboard"
}

/**
 * Checks if user has access to a specific route based on their roles
 */
export function hasRouteAccess(user: AuthUser | null | undefined, route: string): boolean {
  if (!user) {
    return route === "/dashboard"
  }

  if (route.startsWith("/admin")) {
    return hasTenantStaffDashboardAccess({
      permissions: user.permissions,
      roles: getEffectiveRoleNames(user),
      role: typeof user.role === "object" ? user.role?.slug : user.role,
    })
  }

  if (route.startsWith("/super-admin")) {
    const roles = getEffectiveRoleNames(user)
    return roles.some((r) => r === "super-admin" || r === "super_admin") || getRoleSlug(user) === "super_admin"
  }

  return route === "/dashboard" || route.startsWith("/dashboard")
}
