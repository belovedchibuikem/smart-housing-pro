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
 * Falls back to API URL + /storage if not set
 */
export function getStorageUrl(): string {
	// Check for explicit storage URL first
	if (process.env.NEXT_PUBLIC_STORAGE_URL) {
		return process.env.NEXT_PUBLIC_STORAGE_URL.replace(/\/$/, "")
	}
	// Fallback to API URL + /storage
	return `${getApiUrl()}/storage`
}

// Export constants for convenience
export const API_BASE_URL = getApiBaseUrl()
export const API_URL = getApiUrl()
export const STORAGE_URL = getStorageUrl()

/**
 * Resolves a media URL from the API for use in <img src>.
 * Database values are often `/storage/...` relative to the API origin; the admin UI runs
 * on a different host (e.g. Next), so a bare path would load the wrong site and show broken images.
 * Absolute http(s) URLs are returned unchanged.
 */
export function resolveStorageUrl(href: string | null | undefined): string {
	if (href == null || typeof href !== "string") {
		return ""
	}
	const s = href.trim()
	if (!s) {
		return ""
	}
	if (/^https?:\/\//i.test(s)) {
		return s
	}
	// protocol-relative: use current page's protocol in the browser
	if (s.startsWith("//")) {
		if (typeof window !== "undefined" && window.location?.protocol) {
			return `${window.location.protocol}${s}`
		}
		return `https:${s}`
	}
	const base = getApiUrl()
	if (s.startsWith("/")) {
		return `${base}${s}`
	}
	// e.g. "property-images/abc.jpg" from some uploads
	return `${getStorageUrl()}/${s.replace(/^\/+/, "")}`
}

