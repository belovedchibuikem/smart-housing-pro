import type { AuthUser } from "./types"

/**
 * Spatie role names from `roles`, or legacy single `role` when the array is missing/empty.
 */
export function getEffectiveRoleNames(user: {
	roles?: string[]
	role?: string | { slug?: string }
} | null | undefined): string[] {
	if (!user) return []
	const raw = Array.isArray(user.roles) ? user.roles : []
	if (raw.length > 0) return raw
	if (typeof user.role === "object" && user.role?.slug) {
		return [user.role.slug]
	}
	if (typeof user.role === "string" && user.role) {
		return [user.role]
	}
	return []
}

export function getRoleSlug(user: AuthUser | { role?: AuthUser["role"]; roles?: string[] } | null | undefined): string {
	if (!user) return ""
	if (typeof user.role === "object" && user.role?.slug) {
		return String(user.role.slug)
	}
	if (typeof user.role === "string" && user.role) {
		return user.role
	}
	if (user.roles?.length) {
		return user.roles[0]
	}
	return ""
}

export function getRoleDisplayName(user: AuthUser | null | undefined): string {
	if (!user) return ""
	if (typeof user.role === "object" && user.role?.name) {
		return user.role.name
	}
	const slug = getRoleSlug(user)
	if (!slug) return ""
	return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}
