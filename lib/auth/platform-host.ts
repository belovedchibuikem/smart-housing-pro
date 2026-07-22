/**
 * Detect SaaS platform apex (not a cooperative subdomain / custom domain).
 */

import { getTenantSlugFromHost, isCustomDomain } from "@/lib/tenant/tenant-utils"

export function isPlatformApexHost(hostname?: string): boolean {
	if (typeof window === "undefined" && !hostname) return false
	const host = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : ""))
		.split(":")[0]
		.toLowerCase()

	if (!host) return false
	if (host === "localhost" || host === "127.0.0.1") {
		// Bare localhost is platform; tenant1.localhost is cooperative.
		return !getTenantSlugFromHost(hostname ?? host)
	}

	return !getTenantSlugFromHost(host) && !isCustomDomain(host)
}

export function isPlatformSuperAdminSession(): boolean {
	if (typeof window === "undefined") return false
	try {
		const raw = window.localStorage.getItem("user_data")
		if (!raw) return false
		const user = JSON.parse(raw) as {
			auth_context?: string
			roles?: string[]
			role?: string | { slug?: string }
		}
		if (user.auth_context === "platform") return true
		if (user.auth_context === "tenant") return false
		const roles = Array.isArray(user.roles) ? user.roles : []
		const slug =
			typeof user.role === "object" && user.role?.slug
				? user.role.slug
				: typeof user.role === "string"
					? user.role
					: roles[0] ?? ""
		return String(slug).toLowerCase().replace(/-/g, "_") === "super_admin" && isPlatformApexHost()
	} catch {
		return false
	}
}

/** Cooperative-only API prefixes — a platform SuperAdmin token will 401 here. */
export function isTenantScopedApiPath(path: string): boolean {
	const normalized = path.startsWith("/") ? path : `/${path}`
	if (normalized.startsWith("/super-admin")) return false
	if (normalized.startsWith("/auth/")) return false
	if (normalized.startsWith("/public/")) return false
	if (normalized.startsWith("/marketplace")) return false
	if (normalized.startsWith("/onboarding")) return false
	if (normalized.startsWith("/business-onboarding")) return false
	if (normalized.startsWith("/app/")) return false
	return (
		normalized.startsWith("/admin/") ||
		normalized.startsWith("/user/") ||
		normalized.startsWith("/tenant/") ||
		normalized.startsWith("/properties/") ||
		normalized.startsWith("/members/") ||
		normalized.startsWith("/dashboard/") ||
		normalized.startsWith("/loans/") ||
		normalized.startsWith("/wallet/") ||
		normalized.startsWith("/contributions/") ||
		normalized.startsWith("/investments/")
	)
}
