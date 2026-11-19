/**
 * Centralized API Configuration
 *
 * The browser calls same-origin /api, which the Cloudflare worker rewrites to Laravel.
 * Server code and storage URLs use the public Laravel host.
 */

import { resolveLaravelApiBase, resolveLaravelOrigin, resolveStorageBase } from "./public-origin.mjs"

/**
 * Browser: same-origin /api (Cloudflare rewrite).
 * Server: absolute Laravel /api URL.
 */
export function getApiBaseUrl(): string {
	if (typeof window !== "undefined") return "/api"
	return resolveLaravelApiBase()
}

/**
 * Laravel origin without the /api suffix.
 * Storage and other public files are loaded from this host.
 */
export function getApiUrl(): string {
	return resolveLaravelOrigin()
}

/**
 * Public file base. Uses NEXT_PUBLIC_STORAGE_URL when set,
 * otherwise the Laravel host plus NEXT_PUBLIC_PUBLIC_PATH (/public) and /storage.
 */
export function getStorageUrl(): string {
	return resolveStorageBase()
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

