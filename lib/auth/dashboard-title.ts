import type { AuthUser } from "./types"
import { getRoleSlug } from "./user-roles"

/**
 * Staff cooperative admin dashboard heading. "Admin Dashboard" only when primary role slug is `admin`.
 */
export function getStaffDashboardHeading(user: AuthUser | null | undefined): string {
  if (!user) {
    return "Dashboard"
  }
  const slug = getRoleSlug(user).toLowerCase().replace(/-/g, "_")
  const displayFromApi =
    typeof user.role === "object" && user.role?.name ? String(user.role.name).trim() : ""

  if (slug === "admin" || displayFromApi === "Admin") {
    return "Admin Dashboard"
  }

  const name =
    displayFromApi ||
    slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  if (name?.trim()) {
    return `${name.trim()} Dashboard`
  }

  return "Dashboard"
}
