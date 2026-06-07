import type { AuthUser } from "./types"
import { hasTenantStaffDashboardAccess } from "./staff-access"
import { getEffectiveRoleNames, getRoleSlug } from "./user-roles"
import { getTenantSlugFromHost, isCustomDomain } from "@/lib/tenant/tenant-utils"

function staffContext(user: AuthUser | null | undefined) {
  return {
    is_staff: user?.is_staff,
    auth_context: user?.auth_context,
    permissions: user?.permissions,
    roles: getEffectiveRoleNames(user),
    role: typeof user?.role === "object" ? user.role?.slug : user?.role,
  }
}

/** True when the browser is on a cooperative subdomain or custom domain (not the SaaS apex). */
export function isTenantAuthHost(hostname?: string): boolean {
  if (typeof window === "undefined" && !hostname) return false
  const host = (hostname ?? window.location.hostname).split(":")[0]
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return Boolean(getTenantSlugFromHost(hostname ?? window.location.hostname))
  }
  if (isCustomDomain(host)) return true
  return getTenantSlugFromHost(host) !== null
}

function isPlatformSuperAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  if (user.auth_context === "tenant") return false
  if (user.auth_context === "platform") return true
  if (user.is_staff === true) return false

  const roles = getEffectiveRoleNames(user).map((r) => r.toLowerCase().replace(/-/g, "_"))
  return roles.some((r) => r === "super_admin")
}

/**
 * Determines the appropriate dashboard route based on user roles
 */
export function getDashboardRoute(
  user: AuthUser | null | undefined,
  options?: { hostname?: string },
): string {
  if (!user) {
    return "/dashboard"
  }

  const staff = hasTenantStaffDashboardAccess(staffContext(user))
  const onTenantHost = isTenantAuthHost(options?.hostname)

  // Cooperative login — tenant super_admin belongs on /admin, not platform /super-admin
  if (user.auth_context === "tenant" || onTenantHost) {
    return staff || user.is_staff ? "/admin" : "/dashboard"
  }

  if (user.auth_context === "platform" || isPlatformSuperAdminUser(user)) {
    return "/super-admin"
  }

  if (user.is_staff === true || staff) {
    return "/admin"
  }

  return "/dashboard"
}

/**
 * Checks if user has access to a specific route based on their roles
 */
export function hasRouteAccess(
  user: AuthUser | null | undefined,
  route: string,
  options?: { hostname?: string },
): boolean {
  if (!user) {
    return route === "/dashboard"
  }

  if (route.startsWith("/admin")) {
    return hasTenantStaffDashboardAccess(staffContext(user))
  }

  if (route.startsWith("/super-admin")) {
    if (user.auth_context === "tenant" || isTenantAuthHost(options?.hostname)) {
      return false
    }
    return isPlatformSuperAdminUser(user) || getRoleSlug(user) === "super_admin"
  }

  return route === "/dashboard" || route.startsWith("/dashboard")
}
