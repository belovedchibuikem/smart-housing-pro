import type { AuthUser } from "./types"
import { getRoleDisplayName, getRoleSlug } from "./user-roles"

/**
 * Staff cooperative admin dashboard heading.
 * Uses the officer's role display name, e.g. "Loans and Credit Office Dashboard".
 * "Admin Dashboard" only when primary role slug is `admin`.
 */
export function getStaffDashboardHeading(user: AuthUser | null | undefined): string {
  if (!user) {
    return "Dashboard"
  }

  const slug = getRoleSlug(user).toLowerCase().replace(/-/g, "_")
  if (slug === "admin") {
    return "Admin Dashboard"
  }

  const roleName = getRoleDisplayName(user).trim()
  if (!roleName) {
    return "Dashboard"
  }

  if (/^admin$/i.test(roleName)) {
    return "Admin Dashboard"
  }

  const base = roleName.replace(/\s+dashboard$/i, "").trim()
  return base ? `${base} Dashboard` : "Dashboard"
}
