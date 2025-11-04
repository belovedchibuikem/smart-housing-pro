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

	const isFormData = options.body instanceof FormData
	
	const headers: Record<string, string> = {
		...options.headers,
	}

	// Only set Content-Type for JSON, FormData sets its own
	if (!isFormData && !headers["Content-Type"]) {
		headers["Content-Type"] = "application/json"
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
				isFormData,
				timestamp: new Date().toISOString()
			})

			const response = await fetch(url, {
				method: options.method || "GET",
				headers,
				body: options.body !== undefined ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
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

// Investment Plans API
export async function getInvestmentPlans(params?: { search?: string; is_active?: string; risk_level?: string; return_type?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.is_active) query.set("is_active", params.is_active)
	if (params?.risk_level) query.set("risk_level", params.risk_level)
	if (params?.return_type) query.set("return_type", params.return_type)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/investment-plans?${query.toString()}`, { method: "GET" })
}

export async function getInvestmentPlanStats() {
	return apiFetch<{ success: boolean; data: { active_plans: number; total_invested: number; total_investors: number } }>("/admin/investment-plans/stats", { method: "GET" })
}

export async function getInvestmentPlan(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/investment-plans/${id}`, { method: "GET" })
}

export async function createInvestmentPlan(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/investment-plans", { method: "POST", body: data })
}

export async function updateInvestmentPlan(id: string, data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/investment-plans/${id}`, { method: "PUT", body: data })
}

export async function deleteInvestmentPlan(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/investment-plans/${id}`, { method: "DELETE" })
}

export async function toggleInvestmentPlanStatus(id: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/investment-plans/${id}/toggle-status`, { method: "POST" })
}

// Statutory Charges API
export async function getStatutoryCharges(params?: { search?: string; status?: string; type?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	if (params?.type) query.set("type", params.type)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/statutory-charges?${query.toString()}`, { method: "GET" })
}

export async function getStatutoryChargeStats() {
	return apiFetch<{ success: boolean; data: any }>("/admin/statutory-charges/stats", { method: "GET" })
}

export async function createStatutoryCharge(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/statutory-charges", { method: "POST", body: data })
}

export async function updateStatutoryCharge(id: string, data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/statutory-charges/${id}`, { method: "PUT", body: data })
}

export async function deleteStatutoryCharge(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/statutory-charges/${id}`, { method: "DELETE" })
}

export async function approveStatutoryCharge(id: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/statutory-charges/${id}/approve`, { method: "POST" })
}

export async function rejectStatutoryCharge(id: string, reason: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/statutory-charges/${id}/reject`, { method: "POST", body: { reason } })
}

export async function getStatutoryChargeTypes() {
	return apiFetch<{ success: boolean; data: any[] }>("/admin/statutory-charges/types", { method: "GET" })
}

export async function createStatutoryChargeType(data: { type: string; description?: string }) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/statutory-charges/types", { method: "POST", body: data })
}

export async function updateStatutoryChargeType(oldType: string, data: { new_type: string }) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/statutory-charges/types/${oldType}`, { method: "PUT", body: { old_type: oldType, new_type: data.new_type } })
}

export async function deleteStatutoryChargeType(type: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/statutory-charges/types/${type}`, { method: "DELETE" })
}

export async function createStatutoryChargeDepartment(data: { name: string; description?: string }) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/statutory-charges/departments", { method: "POST", body: data })
}

export async function updateStatutoryChargeDepartment(id: string, data: { name: string }) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/statutory-charges/departments/${id}`, { method: "PUT", body: data })
}

export async function deleteStatutoryChargeDepartment(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/statutory-charges/departments/${id}`, { method: "DELETE" })
}

export async function getStatutoryCharge(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/statutory-charges/${id}`, { method: "GET" })
}

export async function getStatutoryChargePayments(params?: { statutory_charge_id?: string; status?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.statutory_charge_id) query.set("statutory_charge_id", params.statutory_charge_id)
	if (params?.status) query.set("status", params.status)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/statutory-charges/payments?${query.toString()}`, { method: "GET" })
}

export async function createStatutoryChargePayment(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/statutory-charges/payments", { method: "POST", body: data })
}

export async function getStatutoryChargeDepartments() {
	return apiFetch<{ success: boolean; data: any[] }>("/admin/statutory-charges/departments", { method: "GET" })
}

// Property Management API
export async function getPropertyEstates(params?: { search?: string }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	return apiFetch<{ success: boolean; data: any[] }>(`/admin/property-management/estates?${query.toString()}`, { method: "GET" })
}

export async function getPropertyEstateStats() {
	return apiFetch<{ success: boolean; data: any }>("/admin/property-management/estates/stats", { method: "GET" })
}

export async function getPropertyEstate(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/estates/${id}`, { method: "GET" })
}

export async function createPropertyEstate(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/property-management/estates", { method: "POST", body: data })
}

export async function getPropertyAllottees(params?: { search?: string; status?: string; property_id?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	if (params?.property_id) query.set("property_id", params.property_id)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/property-management/allottees?${query.toString()}`, { method: "GET" })
}

export async function getPropertyAllotteeStats() {
	return apiFetch<{ success: boolean; data: any }>("/admin/property-management/allottees/stats", { method: "GET" })
}

export async function createPropertyAllottee(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/property-management/allottees", { method: "POST", body: data })
}

export async function updatePropertyAllottee(id: string, data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/property-management/allottees/${id}`, { method: "PUT", body: data })
}

export async function deletePropertyAllottee(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/property-management/allottees/${id}`, { method: "DELETE" })
}

export async function getPropertyMaintenance(params?: { search?: string; maintenance_status?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.maintenance_status) query.set("maintenance_status", params.maintenance_status)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/property-management/maintenance?${query.toString()}`, { method: "GET" })
}

export async function getPropertyMaintenanceStats() {
	return apiFetch<{ success: boolean; data: any }>("/admin/property-management/maintenance/stats", { method: "GET" })
}

export async function createPropertyMaintenance(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/property-management/maintenance", { method: "POST", body: data })
}

export async function updatePropertyMaintenance(id: string, data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/property-management/maintenance/${id}`, { method: "PUT", body: data })
}

export async function deletePropertyMaintenance(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/property-management/maintenance/${id}`, { method: "DELETE" })
}

export async function updatePropertyEstate(id: string, data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/property-management/estates/${id}`, { method: "PUT", body: data })
}

export async function deletePropertyEstate(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/property-management/estates/${id}`, { method: "DELETE" })
}

export async function getPropertyAllottee(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/allottees/${id}`, { method: "GET" })
}

export async function getPropertyMaintenanceById(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/maintenance/${id}`, { method: "GET" })
}

// Property Management Reports API
export async function getPropertyManagementReports(params?: { type?: string; estate_id?: string; allottee_id?: string; maintenance_id?: string }) {
	const query = new URLSearchParams()
	if (params?.type) query.set("type", params.type)
	if (params?.estate_id) query.set("estate_id", params.estate_id)
	if (params?.allottee_id) query.set("allottee_id", params.allottee_id)
	if (params?.maintenance_id) query.set("maintenance_id", params.maintenance_id)
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/reports?${query.toString()}`, { method: "GET" })
}

export async function getEstateReport(estateId: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/reports/estate?estate_id=${estateId}`, { method: "GET" })
}

export async function getAllotteeReport(allotteeId: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/reports/allottee?allottee_id=${allotteeId}`, { method: "GET" })
}

export async function getMaintenanceReport(maintenanceId: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/property-management/reports/maintenance?maintenance_id=${maintenanceId}`, { method: "GET" })
}

// Blockchain Property Management API
export async function getBlockchainProperties(params?: { search?: string; status?: string; network?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	if (params?.network) query.set("network", params.network)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/blockchain?${query.toString()}`, { method: "GET" })
}

export async function getBlockchainStats() {
	return apiFetch<{ success: boolean; data: any }>("/admin/blockchain/stats", { method: "GET" })
}

export async function getBlockchainProperty(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/blockchain/${id}`, { method: "GET" })
}

export async function registerPropertyOnBlockchain(data: { property_id: string; network?: string; ownership_data?: Array<{ member_id: string; wallet_address?: string; ownership_percentage?: number }> }) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain", { method: "POST", body: data })
}

export async function updateBlockchainProperty(id: string, data: { status?: string; verification_notes?: string; transaction_hash?: string; block_number?: number; failure_reason?: string }) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/blockchain/${id}`, { method: "PUT", body: data })
}

export async function verifyBlockchainTransaction(id: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/blockchain/${id}/verify`, { method: "POST" })
}

export async function deleteBlockchainProperty(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/blockchain/${id}`, { method: "DELETE" })
}

// Blockchain Setup Wizard API
export async function getBlockchainSetupStatus() {
	return apiFetch<{ success: boolean; data: any }>("/admin/blockchain-setup/status", { method: "GET" })
}

export async function saveNetworkSettings(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/step-1-network", { method: "POST", body: data })
}

export async function saveExplorerApiKeys(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/step-2-explorer", { method: "POST", body: data })
}

export async function saveSmartContracts(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/step-3-contracts", { method: "POST", body: data })
}

export async function importWallet(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/step-4-wallet", { method: "POST", body: data })
}

export async function completeBlockchainSetup(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/step-5-complete", { method: "POST", body: data })
}

export async function testBlockchainConnection(data: { network: string; rpc_url: string }) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/test-connection", { method: "POST", body: data })
}

// Blockchain Wallet Management API
export async function getBlockchainWallets(params?: { network?: string }) {
	const query = new URLSearchParams()
	if (params?.network) query.set("network", params.network)
	return apiFetch<{ success: boolean; data: any[] }>(`/admin/blockchain-wallets?${query.toString()}`, { method: "GET" })
}

export async function createBlockchainWallet(data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-wallets", { method: "POST", body: data })
}

export async function updateBlockchainWallet(id: string, data: any) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/blockchain-wallets/${id}`, { method: "PUT", body: data })
}

export async function deleteBlockchainWallet(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/blockchain-wallets/${id}`, { method: "DELETE" })
}

export async function setDefaultWallet(id: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/blockchain-wallets/${id}/set-default`, { method: "POST" })
}

export async function syncWalletBalance(id: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/blockchain-wallets/${id}/sync-balance`, { method: "POST" })
}

// Mail Service API
export async function getMailServiceStats() {
	return apiFetch<{ success: boolean; data: any }>("/admin/mail-service/stats", { method: "GET" })
}

export async function getInboxMessages(params?: { search?: string; category?: string; unread_only?: boolean; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.category) query.set("category", params.category)
	if (params?.unread_only) query.set("unread_only", String(params.unread_only))
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/mail-service/inbox?${query.toString()}`, { method: "GET" })
}

export async function getDraftMessages(params?: { search?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/mail-service/drafts?${query.toString()}`, { method: "GET" })
}

export async function getSentMessages(params?: { search?: string; category?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.category) query.set("category", params.category)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/mail-service/sent?${query.toString()}`, { method: "GET" })
}

export async function getOutboxMessages(params?: { search?: string; status?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/mail-service/outbox?${query.toString()}`, { method: "GET" })
}

export async function getMessage(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/mail-service/${id}`, { method: "GET" })
}

export async function composeMessage(data: {
	subject?: string
	message?: string
	category?: string
	recipients?: string
	recipient_ids?: string[]
	cc?: string
	bcc?: string
	is_urgent?: boolean
	save_as_draft?: boolean
	attachments?: File[]
}) {
	const formData = new FormData()
	if (data.subject) formData.append("subject", data.subject)
	if (data.message) formData.append("message", data.message)
	if (data.category) formData.append("category", data.category)
	if (data.recipients) formData.append("recipients", data.recipients)
	if (data.recipient_ids) {
		data.recipient_ids.forEach(id => formData.append("recipient_ids[]", id))
	}
	if (data.cc) formData.append("cc", data.cc)
	if (data.bcc) formData.append("bcc", data.bcc)
	if (data.is_urgent !== undefined) formData.append("is_urgent", String(data.is_urgent))
	if (data.save_as_draft !== undefined) formData.append("save_as_draft", String(data.save_as_draft))
	if (data.attachments) {
		data.attachments.forEach(file => formData.append("attachments[]", file))
	}
	
	const token = getAuthToken()
	const headers: Record<string, string> = {}
	if (token) {
		headers["Authorization"] = `Bearer ${token}`
	}
	
	// Don't set Content-Type, browser will set it with boundary for FormData
	
	const response = await fetch(`${getApiBaseUrl()}/admin/mail-service/compose`, {
		method: "POST",
		headers,
		body: formData,
	})
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Request failed" }))
		throw new Error(error.message || "Failed to send message")
	}
	
	return response.json() as Promise<{ success: boolean; message: string; data: any }>
}

export async function updateMessage(id: string, data: { is_starred?: boolean; is_archived?: boolean; is_read?: boolean; subject?: string; message?: string; category?: string }) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/mail-service/${id}`, { method: "PUT", body: data })
}

export async function deleteMessage(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/mail-service/${id}`, { method: "DELETE" })
}

export async function bulkMailOperation(data: { action: string; message_ids: string[] }) {
	return apiFetch<{ success: boolean; message: string; affected_count: number }>("/admin/mail-service/bulk", { method: "POST", body: data })
}

// Users API (for member selection in mail service)
export async function getUsers(params?: { search?: string; status?: string; role?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	if (params?.role) query.set("role", params.role)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination?: any }>(`/admin/users?${query.toString()}`, { method: "GET" })
}

// Reports API
export async function getMemberReports(params?: { date_range?: string; search?: string; status?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; members: any[]; pagination?: any } }>(`/admin/reports/members?${query.toString()}`, { method: "GET" })
}

export async function getFinancialReports(params?: { date_range?: string }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	return apiFetch<{ success: boolean; data: { stats: any; monthly_data: any[]; transactions: any[] } }>(`/admin/reports/financial?${query.toString()}`, { method: "GET" })
}

export async function getContributionReports(params?: { date_range?: string; search?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; contributions: any[]; pagination?: any } }>(`/admin/reports/contributions?${query.toString()}`, { method: "GET" })
}

export async function getInvestmentReports(params?: { date_range?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; plan_performance: any[]; investments: any[]; pagination?: any } }>(`/admin/reports/investments?${query.toString()}`, { method: "GET" })
}

export async function getLoanReports(params?: { date_range?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; loan_types: any[]; loans: any[]; pagination?: any } }>(`/admin/reports/loans?${query.toString()}`, { method: "GET" })
}

export async function getPropertyReports(params?: { date_range?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; properties: any[]; pagination?: any } }>(`/admin/reports/properties?${query.toString()}`, { method: "GET" })
}

export async function getMailServiceReports(params?: { date_range?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; messages_by_category: any[]; messages: any[]; pagination?: any } }>(`/admin/reports/mail-service?${query.toString()}`, { method: "GET" })
}

export async function getAuditReports(params?: { date_range?: string; search?: string; action?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.search) query.set("search", params.search)
	if (params?.action) query.set("action", params.action)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: { stats: any; logs: any[]; pagination?: any } }>(`/admin/reports/audit?${query.toString()}`, { method: "GET" })
}

export async function exportReport(type: string, params?: Record<string, any>) {
	const query = new URLSearchParams()
	query.set("type", type)
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value) query.set(key, String(value))
		})
	}
	return apiFetch<{ success: boolean; message: string; download_url?: string }>(`/admin/reports/export?${query.toString()}`, { method: "POST" })
}

// Activity Logs API
export async function getActivityLogs(params?: { search?: string; module?: string; action?: string; date_range?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.module) query.set("module", params.module)
	if (params?.action) query.set("action", params.action)
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; pagination?: any }>(`/admin/activity-logs?${query.toString()}`, { method: "GET" })
}

// Documents API
export async function getDocuments(params?: { search?: string; type?: string; status?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.type) query.set("type", params.type)
	if (params?.status) query.set("status", params.status)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; data: any[]; stats?: any; pagination?: any }>(`/admin/documents?${query.toString()}`, { method: "GET" })
}

export async function getDocument(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/documents/${id}`, { method: "GET" })
}

export async function uploadDocument(data: FormData) {
	return apiFetch<{ success: boolean; message: string; data?: any }>("/admin/documents", { method: "POST", body: data, headers: {} })
}

export async function downloadDocument(id: string) {
	return apiFetch<{ success: boolean; data: { download_url: string; filename: string; mime_type: string } }>(`/admin/documents/${id}/download`, { method: "GET" })
}

export async function viewDocument(id: string) {
	return apiFetch<{ success: boolean; data: { view_url: string; filename: string; mime_type: string } }>(`/admin/documents/${id}/view`, { method: "GET" })
}

export async function approveDocument(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/documents/${id}/approve`, { method: "POST" })
}

export async function rejectDocument(id: string, reason: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/documents/${id}/reject`, { method: "POST", body: { reason } })
}

export async function deleteDocument(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/documents/${id}`, { method: "DELETE" })
}


