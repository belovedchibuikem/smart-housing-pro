import type { AuthUser } from "./types"
import { getRoleDisplayName } from "./user-roles"

/**
 * Staff cooperative admin dashboard heading from the user's Role.display_name
 * (e.g. "Loan and Credit Office Dashboard"). No hardcoded role assumptions.
 */
export function getStaffDashboardHeading(user: AuthUser | null | undefined): string {
	const roleName = getRoleDisplayName(user).trim()
	if (!roleName) {
		return "Dashboard"
	}

	const base = roleName.replace(/\s+dashboard$/i, "").trim()
	return base ? `${base} Dashboard` : "Dashboard"
}
