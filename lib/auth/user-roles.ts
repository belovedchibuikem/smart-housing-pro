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

function formatRoleLabel(label: string): string {
	const trimmed = label.trim()
	if (!trimmed) return ""
	// Machine slugs → "Loans And Credit Office"; keep human names as-is
	if (trimmed.includes("_") || /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i.test(trimmed)) {
		return trimmed
			.replace(/[_-]+/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase())
	}
	return trimmed
}

export function getRoleDisplayName(user: AuthUser | null | undefined): string {
	if (!user) return ""
	if (typeof user.role === "object" && user.role?.name) {
		return formatRoleLabel(String(user.role.name))
	}
	if (typeof user.role === "string" && user.role) {
		return formatRoleLabel(user.role)
	}
	const slug = getRoleSlug(user)
	if (!slug) return ""
	return formatRoleLabel(slug)
}
