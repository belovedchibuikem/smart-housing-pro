/**
 * Centralized API Configuration
 * 
 * This file provides a single source of truth for API base URLs.
 * All API requests should use getApiBaseUrl() to ensure consistency
 * across development and production environments.
 */

/**
 * Get the API base URL from environment variable
 * Falls back to default development URL if not set
 */
export function getApiBaseUrl(): string {
	const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"
	// Remove trailing slash if present
	return apiBase.replace(/\/$/, "")
}

/**
 * Get the API base URL without the /api suffix
 * Useful for storage URLs and other non-API endpoints
 */
export function getApiUrl(): string {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "http://127.0.0.1:8000"
	// Remove trailing slash if present
	return apiUrl.replace(/\/$/, "")
}

/**
 * Get storage URL (for file access)
 * Supports NEXT_PUBLIC_STORAGE_URL environment variable for explicit storage URL
 * Falls back to API URL + optional NEXT_PUBLIC_PUBLIC_PATH_PREFIX + /storage
 */
export function getStorageUrl(): string {
	// Check for explicit storage URL first
	if (process.env.NEXT_PUBLIC_STORAGE_URL) {
		return process.env.NEXT_PUBLIC_STORAGE_URL.replace(/\/$/, "")
	}
	const base = getApiUrl()
	const prefix = (process.env.NEXT_PUBLIC_PUBLIC_PATH_PREFIX || "")
		.replace(/^\/+|\/+$/g, "")
	if (prefix) {
		return `${base}/${prefix}/storage`
	}
	return `${base}/storage`
}

// Export constants for convenience
export const API_BASE_URL = getApiBaseUrl()
export const API_URL = getApiUrl()
export const STORAGE_URL = getStorageUrl()

/**
 * Resolves a media URL from the API for use in <img src> or next/image.
 * - Relative public-disk paths (e.g. `property-images/x.png`) → getStorageUrl()/path
 * - `/storage/...` and `/public/storage/...` → configured storage base (supports PUBLIC_PATH_PREFIX)
 * - Full URLs on the same origin as getApiUrl() with `/storage/` or `/public/storage/` are rebuilt
 *   so legacy links without `/public` still work when the app uses `/public/storage/`
 * - Other root-relative paths (e.g. `/placeholder.svg`) are left as-is (Next public assets)
 */
export function resolveStorageUrl(href: string | null | undefined): string {
	if (href == null || typeof href !== "string") {
		return ""
	}
	const s = href.trim()
	if (!s) {
		return ""
	}
	if (s.startsWith("blob:") || s.startsWith("data:")) {
		return s
	}
	if (/^https?:\/\//i.test(s)) {
		try {
			const parsed = new URL(s)
			const apiBase = new URL(getApiUrl())
			if (parsed.origin === apiBase.origin) {
				const path = parsed.pathname
				if (path.startsWith("/public/storage/") || path === "/public/storage") {
					const rest = path === "/public/storage" ? "" : path.slice("/public/storage/".length)
					return rest ? `${getStorageUrl()}/${rest}` : getStorageUrl()
				}
				if (path.startsWith("/storage/") || path === "/storage") {
					const rest = path === "/storage" ? "" : path.slice("/storage/".length)
					return rest ? `${getStorageUrl()}/${rest}` : getStorageUrl()
				}
			}
		} catch {
			// ignore parse errors
		}
		return s
	}
	// protocol-relative: use current page's protocol in the browser
	if (s.startsWith("//")) {
		if (typeof window !== "undefined" && window.location?.protocol) {
			return `${window.location.protocol}${s}`
		}
		return `https:${s}`
	}
	if (s === "/public/storage" || s.startsWith("/public/storage/")) {
		const rest = s === "/public/storage" ? "" : s.slice("/public/storage/".length)
		return rest ? `${getStorageUrl()}/${rest}` : getStorageUrl()
	}
	if (s === "/storage" || s.startsWith("/storage/")) {
		const rest = s === "/storage" ? "" : s.slice("/storage/".length)
		return `${getStorageUrl()}${rest}`
	}
	if (s.startsWith("/")) {
		return s
	}
	return `${getStorageUrl()}/${s.replace(/^\/+/, "")}`
}

