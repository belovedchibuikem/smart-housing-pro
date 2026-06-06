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

  const userRoles = getEffectiveRoleNames(user)
  const roleNames = userRoles.map((role: any) => {
    if (typeof role === "string") return role.toLowerCase()
    if (role?.name) return role.name.toLowerCase()
    if (role?.slug) return role.slug.toLowerCase()
    return String(role).toLowerCase()
  })

  if (roleNames.some((role) => role === "super-admin" || role === "super_admin")) {
    return "/super-admin"
  }

  if (
    hasTenantStaffDashboardAccess({
      permissions: user.permissions,
      roles: userRoles,
      role: typeof user.role === "object" ? user.role?.slug : user.role,
    })
  ) {
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
