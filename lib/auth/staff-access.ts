import { getEffectiveRoleNames } from "./user-roles"

/** Non-member cooperative staff roles (Spatie role `name` values). */
const STAFF_ROLE_SLUGS = new Set([
  "super_admin",
  "admin",
  "finance_manager",
  "accountant",
  "loan_officer",
  "property_manager",
  "manager",
  "member_manager",
  "document_manager",
  "investment_manager",
  "system_admin",
  "staff",
])

function normalizeRoleName(role: string | undefined | null): string {
  return role?.toLowerCase().replace(/-/g, "_") ?? ""
}

function isStaffRoleName(role: string): boolean {
  return STAFF_ROLE_SLUGS.has(normalizeRoleName(role))
}

/**
 * Tenant staff / cooperative admin area: backend enforces access_admin_panel + route permissions.
 * Mirrors App\Models\Tenant\User::isAdmin() so login routing matches API access.
 */
export function hasTenantStaffDashboardAccess(userData: {
  is_staff?: boolean
  permissions?: string[]
  roles?: string[]
  role?: string | { slug?: string }
} | null): boolean {
  if (!userData) return false

  if (userData.is_staff === true) {
    return true
  }

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
