import type { AuthUser } from "./types"

/**
 * Determines the appropriate dashboard route based on user roles
 */
export function getDashboardRoute(user: AuthUser | null | undefined): string {
  if (!user) {
    return "/dashboard" // Default to member dashboard
  }

  // Normalize roles - handle both singular 'role' and plural 'roles'
  const userRoles = user.roles || (user.role ? [user.role] : [])
  
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
    "loan_officer",
    "loan-officer",
    "property_manager",
    "property-manager",
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
  if (!user?.roles || user.roles.length === 0) {
    return route === "/dashboard" // Only allow member dashboard for users without roles
  }

  // Super admin has access to everything
  if (user.roles.includes("super-admin")) {
    return true
  }

  // Admin roles have access to admin routes
  const adminRoles = [
    "admin",           // Main admin role
    "tenant-admin",
    "finance_manager", 
    "loan_officer",
    "property_manager",
    "member_manager",
    "document_manager",
    "system_admin",
    "investment_manager"
  ]

  if (user.roles.some(role => adminRoles.includes(role))) {
    return route.startsWith("/admin") || route === "/dashboard"
  }

  // Regular members only have access to dashboard
  return route === "/dashboard"
}
