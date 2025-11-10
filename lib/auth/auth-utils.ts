import { logoutRequest, setAuthToken } from "@/lib/api/client"
import { useRouter } from "next/navigation"

/**
 * Logout function that calls API and clears all local storage
 */
export async function handleLogout(): Promise<void> {
	try {
		// Call logout API to invalidate token on server
		await logoutRequest()
	} catch (error) {
		// Even if API call fails, clear local storage
		console.error("Logout API call failed:", error)
	} finally {
		// Clear all authentication data from localStorage
		localStorage.removeItem("auth_token")
		localStorage.removeItem("user_data")
		setAuthToken(null)
		
		// Redirect to login page
		window.location.href = "/login"
	}
}

/**
 * Check if user is authenticated by validating token
 */
export function isAuthenticated(): boolean {
	if (typeof window === "undefined") return false
	const token = localStorage.getItem("auth_token")
	return !!token
}

/**
 * Get user data from localStorage
 */
export function getUserData(): any | null {
	if (typeof window === "undefined") return null
	try {
		const userData = localStorage.getItem("user_data")
		return userData ? JSON.parse(userData) : null
	} catch {
		return null
	}
}

