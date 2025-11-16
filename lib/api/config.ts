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
 */
export function getStorageUrl(): string {
	return `${getApiUrl()}/storage`
}

// Export constants for convenience
export const API_BASE_URL = getApiBaseUrl()
export const API_URL = getApiUrl()
export const STORAGE_URL = getStorageUrl()

