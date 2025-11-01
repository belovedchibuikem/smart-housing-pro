"use client"

// Lightweight API client for browser-side requests

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// Use Next.js API route proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
const AUTH_TOKEN_KEY = "auth_token"

export function getApiBaseUrl(): string {
	return API_BASE_URL.replace(/\/$/, "")
}

export function getAuthToken(): string | null {
	if (typeof window === "undefined") return null
	try {
		return window.localStorage.getItem(AUTH_TOKEN_KEY)
	} catch {
		return null
	}
}

export function setAuthToken(token: string | null) {
	if (typeof window === "undefined") return
	try {
		if (token) {
			window.localStorage.setItem(AUTH_TOKEN_KEY, token)
		} else {
			window.localStorage.removeItem(AUTH_TOKEN_KEY)
		}
	} catch {
		// no-op
	}
}

export async function apiFetch<T = unknown>(
	path: string,
	options: {
		method?: HttpMethod
		body?: unknown
		headers?: Record<string, string>
	} = {}
): Promise<T> {
	const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
	const token = getAuthToken()

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...options.headers,
	}

	if (token) {
		headers["Authorization"] = `Bearer ${token}`
	}

	// Forward tenant host context to backend for multi-tenancy resolution
	if (typeof window !== "undefined") {
		try {
			headers["X-Forwarded-Host"] = window.location.host
		} catch {
			// no-op
		}
	}

		try {
			console.log('API Fetch Request:', {
				url,
				method: options.method || "GET",
				headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, k === 'Authorization' ? '***' : v])),
				hasBody: !!options.body,
				timestamp: new Date().toISOString()
			})

			const response = await fetch(url, {
				method: options.method || "GET",
				headers,
				body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
			}).catch((fetchError) => {
				// Handle network errors specifically
				console.error('Fetch Network Error:', {
					url,
					errorName: fetchError?.name,
					errorMessage: fetchError?.message,
					errorType: typeof fetchError,
					errorConstructor: fetchError?.constructor?.name,
				})
				throw new Error(`Network error: ${fetchError?.message || 'Failed to connect to server'}`)
			})

			console.log('API Fetch Response:', {
				url,
				status: response.status,
				statusText: response.statusText,
				contentType: response.headers.get("content-type"),
				timestamp: new Date().toISOString()
			})

			// Attempt to parse JSON; if not JSON, throw generic error on non-OK
			const isJson = response.headers.get("content-type")?.includes("application/json")
			let data
			
			try {
				const text = await response.text()
				data = isJson && text ? JSON.parse(text) : (text || undefined)
			} catch (parseError: any) {
				console.warn('JSON Parse Error:', {
					url,
					parseError: parseError?.message || String(parseError),
					contentType: response.headers.get("content-type"),
				})
				data = undefined
			}

			if (!response.ok) {
				const message = (data as any)?.message || (data as any)?.error || `Request failed with ${response.status}`
				
				// Log detailed error for debugging
				console.error('API Fetch HTTP Error:', {
					url,
					method: options.method || "GET",
					status: response.status,
					statusText: response.statusText,
					contentType: response.headers.get("content-type"),
					data: data || "No response data",
					timestamp: new Date().toISOString()
				})
				
				throw new Error(message)
			}

			return (data || {}) as T
		} catch (error: any) {
			// Enhanced error logging for debugging
			const errorDetails: any = {
				url,
				method: options.method || "GET",
				timestamp: new Date().toISOString(),
			}

			// Safely extract error information
			if (error) {
				if (error instanceof Error) {
					errorDetails.errorType = 'Error'
					errorDetails.errorName = error.name || 'Unknown'
					errorDetails.errorMessage = error.message || 'No message'
					if (error.stack) {
						errorDetails.errorStack = error.stack.split('\n').slice(0, 5).join('\n') // Limit stack trace
					}
				} else if (typeof error === 'object') {
					errorDetails.errorType = 'Object'
					try {
						errorDetails.errorKeys = Object.keys(error)
						errorDetails.errorString = String(error)
						// Try to get common error properties
						if ('message' in error) errorDetails.errorMessage = String(error.message)
						if ('name' in error) errorDetails.errorName = String(error.name)
					} catch (e) {
						errorDetails.errorExtractionFailed = true
					}
				} else {
					errorDetails.errorType = typeof error
					errorDetails.errorValue = String(error)
				}
			} else {
				errorDetails.errorIsNull = true
			}

			console.error('API Fetch Error Details:', errorDetails)
			
			// Re-throw the error with more context
			if (error instanceof Error) {
				throw new Error(`Failed to fetch ${url}: ${error.message}`)
			}
			throw new Error(`Failed to fetch ${url}: Network error - ${String(error)}`)
		}
}

export async function loginRequest(payload: { email: string; password: string }) {
	return apiFetch<{ message: string; user: unknown; token: string }>("/auth/login", {
		method: "POST",
		body: payload,
	})
}

export async function meRequest() {
	return apiFetch<{ user: unknown; message?: string }>("/auth/me", { method: "GET" })
}

export async function logoutRequest() {
	return apiFetch<{ message: string }>("/auth/logout", { method: "POST" })
}

export async function registerRequest(payload: Record<string, unknown>) {
	return apiFetch<{ message: string; user?: unknown }>("/auth/register", {
		method: "POST",
		body: payload,
	})
}

export async function verifyOtpRequest(payload: { email: string; otp: string }) {
	return apiFetch<{ message: string; token?: string; user?: unknown }>("/auth/verify-otp", {
		method: "POST",
		body: payload,
	})
}

export async function resendOtpRequest(payload: { email: string }) {
	return apiFetch<{ message: string }>("/auth/resend-otp", {
		method: "POST",
		body: payload,
	})
}

export async function getWallet() {
	return apiFetch<{ wallet: { id: string; balance: number; currency: string } }>("/user/wallet", {
		method: "GET",
	})
}

export async function getWalletTransactions(params?: { page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	const path = `/user/wallet/transactions${query.toString() ? `?${query.toString()}` : ""}`
	return apiFetch<{
		transactions: { data: any[]; current_page: number; last_page: number; total: number }
		pagination: { current_page: number; last_page: number; per_page: number; total: number }
	}>(path, { method: "GET" })
}


