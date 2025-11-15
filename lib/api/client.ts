"use client"

// Lightweight API client for browser-side requests

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// Use Next.js API route proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
const AUTH_TOKEN_KEY = "auth_token"
const TENANT_SLUG_KEY = "tenant_slug"

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

export function getTenantSlug(): string | null {
	if (typeof window === "undefined") return null
	try {
		return window.localStorage.getItem(TENANT_SLUG_KEY)
	} catch {
		return null
	}
}

export function setTenantSlug(slug: string | null) {
	if (typeof window === "undefined") return
	try {
		if (slug) {
			window.localStorage.setItem(TENANT_SLUG_KEY, slug)
			const maxAge = 60 * 60 * 24 * 30 // 30 days
			document.cookie = `tenant_slug=${encodeURIComponent(slug)}; path=/; max-age=${maxAge}; SameSite=Lax`
		} else {
			window.localStorage.removeItem(TENANT_SLUG_KEY)
			document.cookie = "tenant_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
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
			const tenantSlug = getTenantSlug()
			if (tenantSlug) {
				headers["X-Tenant-Slug"] = tenantSlug
			}
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
				body:
					options.body !== undefined
						? (isFormData ? (options.body as BodyInit) : (JSON.stringify(options.body) as BodyInit))
						: undefined,
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
	return apiFetch<{ success?: boolean; message: string; user?: unknown; requires_otp_verification?: boolean }>("/auth/register", {
		method: "POST",
		body: payload,
	})
}

export async function verifyOtpRequest(payload: { email: string; otp: string }) {
	return apiFetch<{ success: boolean; message: string; token?: string; user?: unknown; email_verified?: boolean }>("/auth/verify-otp", {
		method: "POST",
		body: payload,
	})
}

export async function resendOtpRequest(payload: { email: string; type?: string; phone?: string }) {
	return apiFetch<{ success: boolean; message: string; expires_at?: string }>("/auth/resend-otp", {
		method: "POST",
		body: payload,
	})
}

export async function getWallet() {
	return apiFetch<{ wallet: { id: string; balance: number; currency: string } }>("/user/wallet", {
		method: "GET",
	})
}

export async function getWalletPaymentMethods() {
	return apiFetch<{
		payment_methods: Array<{
			id: string
			name: string
			description: string
			icon: string
			is_enabled: boolean
			configuration?: any
		}>
	}>("/user/wallet/payment-methods", { method: "GET" })
}

export async function initializeWalletFunding(
  data: FormData | {
	amount: number
	payment_method: string
	notes?: string
	payer_name?: string
	payer_phone?: string
	account_details?: string
	payment_evidence?: string[]
  },
) {
	return apiFetch<{
		success: boolean
		paymentUrl?: string
		reference?: string
		payment_id?: string
		requires_approval?: boolean
		message?: string
	}>("/user/wallet/fund", {
		method: "POST",
		body: data,
	})
}

export async function verifyWalletFunding(provider: string, reference: string) {
	return apiFetch<{
		success: boolean
		message: string
	}>("/user/wallet/verify", {
		method: "POST",
		body: { provider, reference },
	})
}

export interface WalletTransactionsResponse {
	transactions: Array<{
		id: string
		type: string
		status: string
		amount: number
		payment_method?: string | null
		payment_reference?: string | null
		description?: string | null
		metadata?: Record<string, unknown> | null
		created_at?: string | null
	}>
	pagination: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
	summary?: {
		total_transactions?: number
		total_completed_transactions?: number
		total_credit?: number
		total_debit?: number
	}
	balance?: number
}

export async function getWalletTransactions(params?: { page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	const path = `/user/wallet/transactions${query.toString() ? `?${query.toString()}` : ""}`
	return apiFetch<WalletTransactionsResponse>(path, { method: "GET" })
}

export interface PropertyImage {
	id: string
	url: string
	is_primary?: boolean
	caption?: string | null
}

export interface AvailableProperty {
	id: string
	title: string
	description?: string | null
	type: string
	location: string
	price: number
	size?: number | null
	bedrooms?: number | null
	bathrooms?: number | null
	created_at?: string | null
	status: string
	images: PropertyImage[]
}

export interface MemberHouse {
	id: string
	title: string
	type: string
	location: string
	price: number
	description?: string | null
	features?: string[] | null
	size?: number | string | null
	bedrooms?: number | null
	bathrooms?: number | null
	total_paid: number
	current_value: number
	predictive_value: number
	progress: number
	status: string
	interest_status?: string
	interest_type?: string
	interest_id?: string
	interest_created_at?: string | null
	funding_option?: PropertyFundingOption | null
	preferred_payment_methods?: PropertyFundingOption[] | null
	mortgage_preferences?: Record<string, unknown> | null
	mortgage_flagged?: boolean | null
	allocation_status?: string | null
	allocation_date?: string | null
	images: PropertyImage[]
}

export interface PropertyPaymentHistoryEntry {
	id: string
	amount: number
	status: string
	approval_status?: string | null
	payment_method?: string | null
	reference?: string | null
	description?: string | null
	created_at?: string | null
	metadata?: Record<string, unknown> | null
}

export interface RepaymentScheduleEntry {
	installment?: number
	month?: number
	period?: number
	frequency?: string
	due_date: string
	principal: number
	interest: number
	total: number
	remaining_balance: number
	status: 'paid' | 'pending' | 'overdue'
	paid_date?: string | null
	repayment_id?: string
}

export interface MortgageProvider {
	id: string
	name: string
	code?: string | null
	contact_email?: string | null
	contact_phone?: string | null
	address?: string | null
}

export interface RepaymentSchedule {
	schedule_approved?: boolean
	schedule_approved_at?: string | null
	loan_id?: string
	mortgage_id?: string
	plan_id?: string
	loan_amount?: number
	principal?: number
	interest_rate: number
	duration_months?: number
	tenure_years?: number
	tenure_months?: number
	monthly_payment?: number
	periodic_payment?: number
	frequency?: string
	total_principal_repaid: number
	total_interest_paid: number
	remaining_principal: number
	is_fully_repaid: boolean
	provider?: MortgageProvider | null
	title?: string | null
	starts_on?: string | null
	notes?: string | null
	schedule: RepaymentScheduleEntry[]
}

export interface PropertyPaymentSetup {
	property: {
		id: string
		title: string
		location?: string | null
		price: number
		total_paid: number
		balance: number
		progress: number
		status: string
	}
	funding_option?: PropertyFundingOption | null
	preferred_payment_methods: PropertyFundingOption[]
	mortgage_preferences?: Record<string, unknown> | null
	equity_wallet: {
		balance: number
		currency: string
		is_active: boolean
		total_contributed?: number
		total_used?: number
	}
	payment_history: PropertyPaymentHistoryEntry[]
	ledger_entries: PropertyLedgerEntry[]
	ledger_total_paid: number
	payment_plan?: PropertyPaymentPlan | null
	repayment_schedules?: {
		loan?: RepaymentSchedule
		mortgage?: RepaymentSchedule
		cooperative?: RepaymentSchedule
	}
}

export interface PropertyLedgerEntry {
	id: string
	amount: number
	direction: "credit" | "debit"
	source: string
	reference?: string | null
	status: string
	paid_at?: string | null
	metadata?: Record<string, unknown> | null
	payment_id?: string | null
	plan_id?: string | null
	mortgage_plan_id?: string | null
	created_at?: string | null
}

export interface PropertyDocument {
	id: string
	property_id: string
	member_id?: string | null
	uploaded_by: string
	uploaded_by_role: "member" | "admin" | "system"
	title: string
	description?: string | null
	document_type?: string | null
	file_path: string
	file_url?: string | null
	file_name: string
	mime_type?: string | null
	file_size?: number | null
	created_at: string
	updated_at: string
	uploader?: {
		id: string
		first_name?: string | null
		last_name?: string | null
		email?: string | null
	} | null
	metadata?: Record<string, unknown> | null
}

export type PropertyFundingOption = "equity_wallet" | "cash" | "loan" | "mix" | "mortgage" | "cooperative"

export type MixFundingAllocationMap = Partial<Record<PropertyFundingOption, number>>

export interface MixFundingAllocationDetail {
	percentages: MixFundingAllocationMap
	amounts: Partial<Record<PropertyFundingOption, number>>
	total_amount: number
}

export type PropertyPaymentPlanConfiguration = (Record<string, unknown> & {
	mix_allocations?: MixFundingAllocationDetail
}) |
	null

export interface PropertyPaymentPlan {
	id: string
	property_id: string
	member_id: string
	interest_id?: string | null
	configured_by: string
	status: "draft" | "active" | "completed" | "cancelled"
	funding_option?: PropertyFundingOption | null
	selected_methods?: PropertyFundingOption[] | null
	configuration?: PropertyPaymentPlanConfiguration
	schedule?: Record<string, unknown> | null
	total_amount?: number | null
	initial_balance?: number | null
	remaining_balance?: number | null
	starts_on?: string | null
	ends_on?: string | null
	metadata?: Record<string, unknown> | null
	created_at: string
	updated_at: string
	property?: AvailableProperty | null
	member?: {
		id: string
		user?: {
			first_name?: string | null
			last_name?: string | null
			email?: string | null
			phone?: string | null
		} | null
	} | null
	interest?: {
		id: string
		status: string
		funding_option?: PropertyFundingOption | null
	} | null
	configured_by?: {
		id: string
		first_name?: string | null
		last_name?: string | null
	} | null
}

export interface PendingPlanInterest {
	id: string
	property_id: string
	member_id: string
	status: string
	funding_option?: PropertyFundingOption | null
	preferred_payment_methods?: PropertyFundingOption[] | null
	property?: AvailableProperty | null
	member?: {
		id: string
		user?: {
			first_name?: string | null
			last_name?: string | null
			email?: string | null
			phone?: string | null
		} | null
	} | null
}

export interface MemberPropertiesSummary {
	total_properties: number
	houses_owned: number
	lands_owned?: number
	total_paid: number
	current_value: number
	predictive_value: number
}

export type ExistingLoanType = "fmbn" | "fgshlb" | "home_renovation" | "cooperative" | "other"

export interface SubmitPropertyInterestPayload {
	interest_type: "rental" | "purchase" | "investment"
	message?: string | null
	applicant: {
		name: string
		rank?: string | null
		pin?: string | null
		ippis_number?: string | null
		command?: string | null
		phone: string
		email?: string | null
	}
	financial: {
		net_salary: number
		has_existing_loan: boolean
		existing_loan_types?: ExistingLoanType[]
	}
	next_of_kin: {
		name: string
		phone: string
		address: string
		relationship?: string | null
		email?: string | null
	}
	property_snapshot: {
		id?: string
		title: string
		description?: string | null
		type?: string | null
		location?: string | null
		address?: string | null
		city?: string | null
		state?: string | null
		price?: number | null
		size?: string | number | null
		bedrooms?: number | null
		bathrooms?: number | null
	}
	funding_option: PropertyFundingOption
	funding_breakdown?: Record<string, unknown> | null
	preferred_payment_methods?: PropertyFundingOption[]
	documents?: {
		passport?: string | null
		pay_slip?: string | null
	}
	signature: {
		data_url: string
		signed_at?: string | null
	}
	mortgage_id?: string | null
	mortgage?: {
		provider?: string | null
		tenure_years?: number | null
		interest_rate?: number | null
		loan_amount?: number | null
		monthly_payment?: number | null
	}
}

export interface PropertyMortgage {
	id: string
	status: string
	loan_amount: number
	interest_rate: number
	tenure_years: number
	monthly_payment: number
	provider?: {
		id: string
		name: string
		contact_email?: string | null
		contact_phone?: string | null
	} | null
	notes?: string | null
	updated_at?: string | null
}

export interface PropertyInterestResponse {
	success: boolean
	message: string
	interest: {
		id: string
		property_id: string
		interest_type: string
		status: string
		priority: number
		funding_option?: PropertyFundingOption | null
		preferred_payment_methods?: PropertyFundingOption[] | null
		signature_url?: string | null
		mortgage_flagged?: boolean
		created_at: string
	}
}

export async function getAvailableProperties(type?: string) {
	const params = type ? `?type=${encodeURIComponent(type)}` : ""
	return apiFetch<{ properties: AvailableProperty[] }>(`/properties/available${params}`, { method: "GET" })
}

export async function getMemberProperties(type?: string) {
	const params = type ? `?type=${encodeURIComponent(type)}` : ""
	return apiFetch<{
		success: boolean
		summary: MemberPropertiesSummary
		properties: MemberHouse[]
	}>(`/properties/my${params}`, { method: "GET" })
}

export async function getPropertyMortgage(propertyId: string) {
	return apiFetch<{ success: boolean; mortgage: PropertyMortgage | null }>(`/properties/${propertyId}/mortgage`, { method: "GET" })
}

export async function approveEoiForm(id: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/eoi-forms/${id}/approve`, {
		method: "POST",
	})
}

export async function getPropertyPaymentSetup(propertyId: string) {
	return apiFetch<{ success: boolean; data: PropertyPaymentSetup; message?: string }>(`/properties/${propertyId}/payment-setup`, {
		method: "GET",
	})
}

export async function getPropertyDocuments(propertyId: string, params?: { page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))

	return apiFetch<{
		success: boolean
		data: PropertyDocument[]
		pagination: { current_page: number; last_page: number; per_page: number; total: number }
	}>(`/properties/${propertyId}/documents?${query.toString()}`, { method: "GET" })
}

export async function uploadPropertyDocument(body: FormData) {
	return apiFetch<{ success: boolean; message: string; data: PropertyDocument }>(`/properties/documents`, {
		method: "POST",
		body,
		headers: {}, // let browser set multipart headers
	})
}

export async function deletePropertyDocument(documentId: string) {
	return apiFetch<{ success: boolean; message: string }>(`/properties/documents/${documentId}`, {
		method: "DELETE",
	})
}

export async function getPropertyPaymentPlans(params?: {
	status?: string
	property_id?: string
	member_id?: string
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.status) query.set("status", params.status)
	if (params?.property_id) query.set("property_id", params.property_id)
	if (params?.member_id) query.set("member_id", params.member_id)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))

	return apiFetch<{
		success: boolean
		data: PropertyPaymentPlan[]
		pagination: { current_page: number; last_page: number; per_page: number; total: number }
	}>(
		`/admin/property-payment-plans?${query.toString()}`,
		{ method: "GET" },
	)
}

export async function getPendingPropertyPaymentInterests(params?: {
	property_id?: string
	member_id?: string
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.property_id) query.set("property_id", params.property_id)
	if (params?.member_id) query.set("member_id", params.member_id)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))

	return apiFetch<{
		success: boolean
		data: PendingPlanInterest[]
		pagination: { current_page: number; last_page: number; per_page: number; total: number }
	}>(
		`/admin/property-payment-plans/pending-interests?${query.toString()}`,
		{ method: "GET" },
	)
}

export async function createPropertyPaymentPlan(body: {
	property_id: string
	member_id: string
	interest_id?: string | null
	funding_option?: PropertyFundingOption | null
	selected_methods?: PropertyFundingOption[]
	mix_allocations?: MixFundingAllocationMap | null
	configuration?: Record<string, unknown> | null
	schedule?: Record<string, unknown> | null
	total_amount?: number | null
	initial_balance?: number | null
	remaining_balance?: number | null
	starts_on?: string | null
	ends_on?: string | null
	status?: "draft" | "active" | "completed" | "cancelled"
	metadata?: Record<string, unknown> | null
}) {
	return apiFetch<{ success: boolean; message: string; data: PropertyPaymentPlan }>(`/admin/property-payment-plans`, {
		method: "POST",
		body,
	})
}

export async function updatePropertyPaymentPlan(
	planId: string,
	body: {
		funding_option?: PropertyFundingOption | null
		selected_methods?: PropertyFundingOption[]
		mix_allocations?: MixFundingAllocationMap | null
		configuration?: Record<string, unknown> | null
		schedule?: Record<string, unknown> | null
		total_amount?: number | null
		initial_balance?: number | null
		remaining_balance?: number | null
		starts_on?: string | null
		ends_on?: string | null
		status?: "draft" | "active" | "completed" | "cancelled"
		metadata?: Record<string, unknown> | null
	},
) {
	return apiFetch<{ success: boolean; message: string; data: PropertyPaymentPlan }>(`/admin/property-payment-plans/${planId}`, {
		method: "PUT",
		body,
	})
}

export async function getPropertyPaymentPlan(planId: string) {
	return apiFetch<{ success: boolean; data: PropertyPaymentPlan }>(`/admin/property-payment-plans/${planId}`, { method: "GET" })
}

export interface InternalMortgagePlan {
	id: string
	property_id?: string | null
	member_id?: string | null
	title: string
	description?: string | null
	principal: number
	interest_rate: number
	tenure_months: number
	monthly_payment?: number | null
	frequency: "monthly" | "quarterly" | "biannually" | "annually"
	status: "draft" | "active" | "completed" | "cancelled"
	schedule_approved?: boolean
	schedule_approved_at?: string | null
	starts_on?: string | null
	ends_on?: string | null
	schedule?: Record<string, unknown> | null
	metadata?: Record<string, unknown> | null
	configured_by: {
		id: string
		first_name?: string | null
		last_name?: string | null
	} | null
	property?: AvailableProperty | null
	member?: {
		id: string
		user?: {
			first_name?: string | null
			last_name?: string | null
			email?: string | null
			phone?: string | null
		} | null
	} | null
	created_at: string
	updated_at: string
}

export async function getInternalMortgagePlans(params?: {
	status?: string
	property_id?: string
	member_id?: string
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.status) query.set("status", params.status)
	if (params?.property_id) query.set("property_id", params.property_id)
	if (params?.member_id) query.set("member_id", params.member_id)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))

	return apiFetch<{
		success: boolean
		data: InternalMortgagePlan[]
		pagination: { current_page: number; last_page: number; per_page: number; total: number }
	}>(
		`/admin/internal-mortgages?${query.toString()}`,
		{ method: "GET" },
	)
}

export async function createInternalMortgagePlan(body: {
	title: string
	property_id?: string | null
	member_id?: string | null
	description?: string | null
	principal: number
	interest_rate: number
	tenure_years: number
	frequency: "monthly" | "quarterly" | "biannually" | "annually"
	starts_on?: string | null
	ends_on?: string | null
	status?: "draft" | "active" | "completed" | "cancelled"
	metadata?: Record<string, unknown> | null
}) {
	return apiFetch<{ success: boolean; message: string; data: InternalMortgagePlan }>(`/admin/internal-mortgages`, {
		method: "POST",
		body,
	})
}

export async function getInternalMortgagePlan(planId: string) {
	return apiFetch<{ success: boolean; data: InternalMortgagePlan }>(`/admin/internal-mortgages/${planId}`, {
		method: "GET",
	})
}

export async function rejectEoiForm(id: string, reason: string) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/eoi-forms/${id}/reject`, {
		method: "POST",
		body: { reason },
	})
}

export async function submitPropertyInterest(propertyId: string, payload: SubmitPropertyInterestPayload) {
	return apiFetch<PropertyInterestResponse>(`/properties/${propertyId}/express-interest`, {
		method: "POST",
		body: payload,
	})
}

export interface AdminRefundMemberSummary {
	member: {
		id: string
		member_number?: string | null
		name?: string | null
		staff_id?: string | null
	}
	summary: {
		wallet: {
			balance: number
		}
		contribution: {
			total: number
			refunded: number
			available: number
		}
		investment_returns: {
			total: number
			refunded: number
			available: number
		}
		equity_wallet: {
			balance: number
		}
		loans: {
			count: number
			outstanding_total: number
			items: Array<{
				id: string
				status: string
				principal: number
				total_amount: number
				repaid: number
				outstanding: number
			}>
		}
	}
}

export async function getAdminRefundMemberSummary(memberId: string) {
	return apiFetch<{
		success: boolean
		member: AdminRefundMemberSummary["member"]
		summary: AdminRefundMemberSummary["summary"]
	}>(`/admin/refund-member/${memberId}`, { method: "GET" })
}

export interface CreateRefundPayload {
	member_id: string
	source: "wallet" | "contribution" | "investment_return" | "equity_wallet"
	amount: number
	reason: string
	notes?: string
	auto_approve?: boolean
}

export async function createAdminRefund(payload: CreateRefundPayload) {
	return apiFetch<{
		success: boolean
		message: string
		data?: {
			refund: {
				id: string
				amount: number
				source: string
				reason: string
				reference?: string | null
			}
			summary: AdminRefundMemberSummary["summary"]
		}
	}>("/admin/refund-member", {
		method: "POST",
		body: payload,
	})
}

// User Investment Plans API (for members)
export async function getUserInvestmentPlans() {
	return apiFetch<{ plans: Array<{
		id: string
		name: string
		description: string | null
		min_amount: number
		max_amount: number
		expected_return_rate: number
		min_duration_months: number
		max_duration_months: number
		return_type: string
		risk_level: string
		risk_color: string
		features: any[]
		terms_and_conditions: any[]
		is_active: boolean
		created_at: string
		updated_at: string
	}> }>("/investments/plans", { method: "GET" })
}

export async function getUserInvestmentPlan(id: string) {
	return apiFetch<{ plan: {
		id: string
		name: string
		description: string | null
		min_amount: number
		max_amount: number
		expected_return_rate: number
		min_duration_months: number
		max_duration_months: number
		return_type: string
		risk_level: string
		risk_color: string
		features: any[]
		terms_and_conditions: any[]
		is_active: boolean
		created_at: string
		updated_at: string
	} }>(`/investments/plans/${id}`, { method: "GET" })
}

// User Investments API (for members)
export interface UserInvestment {
	id: string
	member_id: string
	amount: number
	type: string
	duration_months: number
	expected_return_rate: number
	status: string
	investment_date: string
	approved_at: string | null
	approved_by: string | null
	rejection_reason: string | null
	rejected_at: string | null
	rejected_by: string | null
	member?: {
		id: string
		user?: {
			id: string
			first_name: string
			last_name: string
			email: string
		}
	}
	returns?: Array<{
		id: string
		investment_id: string
		amount: number
		return_date: string
		status: string
		type: string
	}>
}

export async function getUserInvestments(params?: { status?: string; type?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.status) query.set("status", params.status)
	if (params?.type) query.set("type", params.type)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		investments: UserInvestment[]
		pagination: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/investments?${query.toString()}`, { method: "GET" })
}

export async function getUserInvestment(id: string) {
	return apiFetch<{ investment: UserInvestment }>(`/investments/${id}`, { method: "GET" })
}

export async function createInvestment(data: {
	amount: number
	type: string
	duration_months: number
	expected_return_rate: number
}) {
	return apiFetch<{ success: boolean; message: string; investment: UserInvestment }>("/investments", {
		method: "POST",
		body: data,
	})
}

export async function getInvestmentPaymentMethods() {
	return apiFetch<{
		payment_methods: Array<{
			id: string
			name: string
			description: string
			icon?: string
			is_enabled: boolean
			configuration?: Record<string, unknown>
		}>
	}>("/investments/payment-methods", { method: "GET" })
}

export async function initializeInvestmentPayment(
	data:
		| FormData
		| {
			amount: number
			payment_method: string
			investment_plan_id: string
			type: string
			duration_months: number
			expected_return_rate: number
			notes?: string
			payer_name?: string
			payer_phone?: string
			transaction_reference?: string
			bank_account_id?: string
			payment_evidence?: string[]
		},
) {
	return apiFetch<{
		success: boolean
		message?: string
		reference?: string
		payment_id?: string
		payment_method?: string
		payment_url?: string | null
		requires_approval?: boolean
		manual_instructions?: {
			account?: Record<string, unknown>
			requires_payment_evidence?: boolean
			message?: string
		}
		investment?: {
			id: string
			status: string
			amount: number
		}
	}>("/investments/pay", {
		method: "POST",
		body: data,
	})
}

// Investment Withdrawal API
export interface InvestmentWithdrawalOptions {
	investment: {
		id: string
		amount: number
		status: string
		maturity_date: string | null
	}
	withdrawal_options: {
		is_matured: boolean
		maturity_date: string | null
		total_invested: number
		total_returns: number
		available_for_withdrawal: number
		withdrawal_types: {
			full: {
				available: boolean
				amount: number
				description: string
			}
			partial: {
				available: boolean
				min_amount: number
				max_amount: number
				description: string
			}
		}
	}
}

export async function getInvestmentWithdrawalOptions(investmentId: string) {
	return apiFetch<InvestmentWithdrawalOptions>(`/investments/${investmentId}/withdrawal-options`, { method: "GET" })
}

export async function getInvestmentWithdrawalHistory(investmentId: string, params?: { page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		withdrawals: Array<{
			id: string
			investment_id: string
			amount: number
			return_date: string
			status: string
			type: string
		}>
		pagination: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/investments/${investmentId}/withdrawal-history?${query.toString()}`, { method: "GET" })
}

export async function requestInvestmentWithdrawal(investmentId: string, data: {
	withdrawal_type: "full" | "partial"
	amount?: number
	reason?: string
}) {
	return apiFetch<{
		success: boolean
		message: string
		withdrawal_request?: {
			id: string
			investment_id: string
			amount: number
			type: string
			status: string
		}
	}>(`/investments/${investmentId}/withdraw`, {
		method: "POST",
		body: data,
	})
}

// Admin Investment Withdrawal Request API
export interface AdminInvestmentWithdrawalRequest {
	id: string
	investment_id: string
	member_id: string
	withdrawal_type: string
	amount: number
	status: string
	reason: string | null
	admin_response: string | null
	rejection_reason: string | null
	requested_by: string | null
	approved_by: string | null
	rejected_by: string | null
	processed_by: string | null
	requested_at: string | null
	approved_at: string | null
	rejected_at: string | null
	processed_at: string | null
	completed_at: string | null
	investment?: UserInvestment
	member?: {
		id: string
		user?: {
			id: string
			first_name: string
			last_name: string
			email: string
		}
	}
}

export async function getAdminInvestmentWithdrawalRequests(params?: {
	status?: string
	investment_id?: string
	member_id?: string
	search?: string
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.status) query.set("status", params.status)
	if (params?.investment_id) query.set("investment_id", params.investment_id)
	if (params?.member_id) query.set("member_id", params.member_id)
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		success: boolean
		withdrawals: AdminInvestmentWithdrawalRequest[]
		pagination: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/admin/investment-withdrawal-requests?${query.toString()}`, { method: "GET" })
}

export async function getAdminInvestmentWithdrawalStats() {
	return apiFetch<{
		success: boolean
		stats: {
			total_requests: number
			pending: number
			approved: number
			rejected: number
			processing: number
			completed: number
			total_amount_pending: number
			total_amount_completed: number
		}
	}>("/admin/investment-withdrawal-requests/stats", { method: "GET" })
}

export async function getAdminInvestmentWithdrawalRequest(id: string) {
	return apiFetch<{
		success: boolean
		withdrawal: AdminInvestmentWithdrawalRequest
	}>(`/admin/investment-withdrawal-requests/${id}`, { method: "GET" })
}

export async function approveInvestmentWithdrawalRequest(id: string, data?: {
	admin_response?: string
	process_immediately?: boolean
}) {
	return apiFetch<{
		success: boolean
		message: string
		withdrawal: AdminInvestmentWithdrawalRequest
	}>(`/admin/investment-withdrawal-requests/${id}/approve`, {
		method: "POST",
		body: data || {},
	})
}

export async function rejectInvestmentWithdrawalRequest(id: string, rejection_reason: string) {
	return apiFetch<{
		success: boolean
		message: string
		withdrawal: AdminInvestmentWithdrawalRequest
	}>(`/admin/investment-withdrawal-requests/${id}/reject`, {
		method: "POST",
		body: { rejection_reason },
	})
}

export async function processInvestmentWithdrawalRequest(id: string) {
	return apiFetch<{
		success: boolean
		message: string
		withdrawal: AdminInvestmentWithdrawalRequest
	}>(`/admin/investment-withdrawal-requests/${id}/process`, {
		method: "POST",
	})
}

// Investment Plans API (Admin)
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

export async function createStatutoryChargeType(data: { type: string; description?: string; default_amount?: number | string; frequency?: string; is_active?: boolean; sort_order?: number }) {
	return apiFetch<{ success: boolean; message: string; data: any }>("/admin/statutory-charges/types", { method: "POST", body: data })
}

export async function updateStatutoryChargeType(id: string, data: { type?: string; description?: string; default_amount?: number | string | null; frequency?: string; is_active?: boolean; sort_order?: number }) {
	return apiFetch<{ success: boolean; message: string; data: any }>(`/admin/statutory-charges/types/${id}`, { method: "PUT", body: data })
}

export async function deleteStatutoryChargeType(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/statutory-charges/types/${id}`, { method: "DELETE" })
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

// Member Statutory Charges API
export async function getMemberStatutoryCharges(params?: { status?: string; type?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.status) query.set("status", params.status)
	if (params?.type) query.set("type", params.type)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{ success: boolean; charges: any[]; pagination?: any }>(`/user/statutory/charges?${query.toString()}`, { method: "GET" })
}

export async function getMemberStatutoryCharge(chargeId: string) {
	return apiFetch<{ success: boolean; charge: any }>(`/user/statutory/charges/${chargeId}`, { method: "GET" })
}

export async function payStatutoryCharge(chargeId: string, data: { amount: number; payment_method: string; reference?: string }) {
	return apiFetch<{ success: boolean; message: string; payment: any; payment_url?: string; requires_approval?: boolean }>(`/user/statutory/charges/${chargeId}/pay`, { method: "POST", body: data })
}

export async function createAndPayStatutoryCharge(data: { charge_type: string; amount: number; payment_method: string; property_id?: string; description?: string; reference?: string }) {
	return apiFetch<{ success: boolean; message: string; payment: any; payment_url?: string; requires_approval?: boolean }>("/user/statutory/charges/create-and-pay", { method: "POST", body: data })
}

export async function getStatutoryChargePaymentMethods() {
	return apiFetch<{ success: boolean; payment_methods: any[] }>("/user/statutory/charges/payment-methods", { method: "GET" })
}

export async function getMemberStatutoryChargeTypes() {
	return apiFetch<{ success: boolean; data: any[] }>("/user/statutory/charges/types", { method: "GET" })
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

// Member Property Management API
export interface MemberEstate {
	id: string
	name: string
	location: string
	total_units: number
	occupied_units: number
	my_properties: number
	status: string
	description: string
}

export interface AllotteeInfo {
	status: string
	allottee_id: string
	date_allocated: string | null
	properties: Array<{
		id: string
		property_id: string
		type: string
		estate: string
		unit: string
		allocation_date: string | null
		status: string
	}>
}

export interface MaintenanceRequest {
	id: string
	request_id: string
	title: string
	description: string
	property: string
	estate: string
	status: string
	priority: string
	category: string
	date_submitted: string | null
	date_assigned: string | null
	estimated_completion: string | null
	assigned_to: string | null
	resolution_notes?: string | null
	estimated_cost?: number | null
	actual_cost?: number | null
}

export interface MemberProperty {
	id: string
	title: string
	location: string
	type: string
}

export async function getMyEstates() {
	return apiFetch<{ success: boolean; estates: MemberEstate[] }>("/property-management/my-estates", { method: "GET" })
}

export async function getAllotteeStatus() {
	return apiFetch<{ success: boolean; allottee_info: AllotteeInfo }>("/property-management/allottee-status", { method: "GET" })
}

export async function getMyMaintenanceRequests(params?: { search?: string; status?: string }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.status) query.set("status", params.status)
	return apiFetch<{ success: boolean; requests: MaintenanceRequest[] }>(`/property-management/maintenance?${query.toString()}`, { method: "GET" })
}

export async function getMaintenanceRequest(id: string) {
	return apiFetch<{ success: boolean; request: MaintenanceRequest }>(`/property-management/maintenance/${id}`, { method: "GET" })
}

export async function createMaintenanceRequest(data: {
	property_id: string
	issue_type: string
	priority: string
	title: string
	description: string
	attachments?: File[]
}) {
	const formData = new FormData()
	formData.append("property_id", data.property_id)
	formData.append("issue_type", data.issue_type)
	formData.append("priority", data.priority)
	formData.append("title", data.title)
	formData.append("description", data.description)
	
	if (data.attachments) {
		data.attachments.forEach((file) => {
			formData.append("attachments[]", file)
		})
	}

	return apiFetch<{ success: boolean; message: string; request: { id: string; request_id: string } }>("/property-management/maintenance", {
		method: "POST",
		body: formData,
	})
}

export async function getMyPropertiesForMaintenance() {
	return apiFetch<{ success: boolean; properties: MemberProperty[] }>("/property-management/my-properties", { method: "GET" })
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

export async function getAdminBlockchainStats() {
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

export async function verifyAdminBlockchainTransaction(id: string) {
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
	query.set("format", "csv")
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value) query.set(key, String(value))
		})
	}
	
	const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
	
	try {
		const response = await fetch(`${apiUrl}/admin/reports/export?${query.toString()}`, {
			method: 'POST',
			headers: {
				'Accept': 'text/csv',
				...(token && { 'Authorization': `Bearer ${token}` }),
			},
		})
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: 'Export failed' }))
			throw new Error(errorData.message || 'Export failed')
		}
		
		const blob = await response.blob()
		const contentDisposition = response.headers.get('content-disposition')
		let filename = `${type}_${new Date().toISOString().split('T')[0]}.csv`
		
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename="(.+)"/)
			if (filenameMatch) {
				filename = filenameMatch[1]
			}
		}
		
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		window.URL.revokeObjectURL(url)
		document.body.removeChild(a)
		
		return { success: true, message: 'Export completed successfully' }
	} catch (error: any) {
		console.error('Export error:', error)
		throw error
	}
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

// Admin Notifications API
export async function getAdminNotifications(params?: {
	user_id?: string
	type?: string
	read?: boolean
	from_date?: string
	to_date?: string
	search?: string
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.user_id) query.set("user_id", params.user_id)
	if (params?.type) query.set("type", params.type)
	if (params?.read !== undefined) query.set("read", String(params.read))
	if (params?.from_date) query.set("from_date", params.from_date)
	if (params?.to_date) query.set("to_date", params.to_date)
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		success: boolean
		notifications: any[]
		pagination: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/admin/notifications?${query.toString()}`, { method: "GET" })
}

export async function getAdminNotificationStats() {
	return apiFetch<{
		success: boolean
		stats: {
			total: number
			unread: number
			read: number
			by_type: Record<string, number>
			today: number
			this_week: number
			this_month: number
		}
	}>("/admin/notifications/stats", { method: "GET" })
}

export async function getAdminUnreadCount() {
	return apiFetch<{
		success: boolean
		unread_count: number
	}>("/admin/notifications/unread-count", { method: "GET" })
}

export async function createAdminNotification(data: {
	user_id: string
	type: "info" | "success" | "warning" | "error" | "system"
	title: string
	message: string
	data?: Record<string, any>
	mark_as_read?: boolean
}) {
	return apiFetch<{
		success: boolean
		message: string
		notification: any
	}>("/admin/notifications", { method: "POST", body: data })
}

export async function markNotificationAsRead(notificationId: string) {
	return apiFetch<{
		success: boolean
		message: string
		notification: any
	}>(`/admin/notifications/${notificationId}/read`, { method: "POST" })
}

export async function markAllNotificationsAsRead(userId?: string) {
	return apiFetch<{
		success: boolean
		message: string
		count: number
	}>("/admin/notifications/mark-all-read", {
		method: "POST",
		body: userId ? { user_id: userId } : {},
	})
}

export async function markMultipleNotificationsAsRead(notificationIds: string[]) {
	return apiFetch<{
		success: boolean
		message: string
		count: number
	}>("/admin/notifications/mark-multiple-read", {
		method: "POST",
		body: { notification_ids: notificationIds },
	})
}

export async function deleteAdminNotification(notificationId: string) {
	return apiFetch<{
		success: boolean
		message: string
	}>(`/admin/notifications/${notificationId}`, { method: "DELETE" })
}

export async function bulkDeleteNotifications(notificationIds: string[]) {
	return apiFetch<{
		success: boolean
		message: string
		count: number
	}>("/admin/notifications/bulk-delete", {
		method: "POST",
		body: { notification_ids: notificationIds },
	})
}

// Admin Audit Logs API
export async function getAuditLogs(params?: {
	user_id?: string
	action?: string
	module?: string
	resource_type?: string
	resource_id?: string
	date_range?: string
	start_date?: string
	end_date?: string
	search?: string
	sort_by?: string
	sort_order?: "asc" | "desc"
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.user_id) query.set("user_id", params.user_id)
	if (params?.action) query.set("action", params.action)
	if (params?.module) query.set("module", params.module)
	if (params?.resource_type) query.set("resource_type", params.resource_type)
	if (params?.resource_id) query.set("resource_id", params.resource_id)
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.start_date) query.set("start_date", params.start_date)
	if (params?.end_date) query.set("end_date", params.end_date)
	if (params?.search) query.set("search", params.search)
	if (params?.sort_by) query.set("sort_by", params.sort_by)
	if (params?.sort_order) query.set("sort_order", params.sort_order)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		success: boolean
		data: any[]
		pagination?: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
		filters?: {
			date_range: string
			start_date: string
			end_date: string
		}
	}>(`/admin/audit-logs?${query.toString()}`, { method: "GET" })
}

export async function getAuditLogStats(params?: { date_range?: string }) {
	const query = new URLSearchParams()
	if (params?.date_range) query.set("date_range", params.date_range)
	return apiFetch<{
		success: boolean
		stats: {
			total: number
			by_action: Record<string, number>
			by_module: Record<string, number>
			by_user: Array<{
				user_id: string
				user: {
					name: string
					email: string
				} | null
				count: number
			}>
			login_logout: {
				logins: number
				logouts: number
			}
			recent_activity: Array<{
				id: string
				action: string
				module: string
				description: string
				user: string
				created_at: string
			}>
		}
		period: {
			start_date: string
			end_date: string
		}
	}>(`/admin/audit-logs/stats?${query.toString()}`, { method: "GET" })
}

export async function getAuditLog(id: string) {
	return apiFetch<{
		success: boolean
		data: any
	}>(`/admin/audit-logs/${id}`, { method: "GET" })
}

export async function getResourceAuditLogs(resourceType: string, resourceId: string, params?: { page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		success: boolean
		data: any[]
		pagination?: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/admin/audit-logs/resource/${resourceType}/${resourceId}?${query.toString()}`, { method: "GET" })
}

export async function getUserAuditLogs(userId: string, params?: { page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<{
		success: boolean
		user: {
			id: string
			name: string
			email: string
		}
		data: any[]
		pagination?: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/admin/audit-logs/user/${userId}?${query.toString()}`, { method: "GET" })
}

export async function exportAuditLogs(params?: {
	user_id?: string
	action?: string
	module?: string
	resource_type?: string
	resource_id?: string
	date_range?: string
	start_date?: string
	end_date?: string
	search?: string
	sort_by?: string
	sort_order?: "asc" | "desc"
}) {
	const query = new URLSearchParams()
	if (params?.user_id) query.set("user_id", params.user_id)
	if (params?.action) query.set("action", params.action)
	if (params?.module) query.set("module", params.module)
	if (params?.resource_type) query.set("resource_type", params.resource_type)
	if (params?.resource_id) query.set("resource_id", params.resource_id)
	if (params?.date_range) query.set("date_range", params.date_range)
	if (params?.start_date) query.set("start_date", params.start_date)
	if (params?.end_date) query.set("end_date", params.end_date)
	if (params?.search) query.set("search", params.search)
	if (params?.sort_by) query.set("sort_by", params.sort_by)
	if (params?.sort_order) query.set("sort_order", params.sort_order)
	
	const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
	
	try {
		const response = await fetch(`${apiUrl}/admin/audit-logs/export?${query.toString()}`, {
			method: 'GET',
			headers: {
				'Accept': 'text/csv',
				...(token && { 'Authorization': `Bearer ${token}` }),
			},
		})
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: 'Export failed' }))
			throw new Error(errorData.message || 'Export failed')
		}
		
		const blob = await response.blob()
		const contentDisposition = response.headers.get('content-disposition')
		let filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
		
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
			if (filenameMatch) {
				filename = filenameMatch[1]
			}
		}
		
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		window.URL.revokeObjectURL(url)
	} catch (error: any) {
		console.error('Export error:', error)
		throw error
	}
}

// User Dashboard API
export async function getUserDashboardStats() {
	return apiFetch<{
		wallet_balance: number
		financial_summary: {
			total_contributions: number
			total_loans: number
			outstanding_loans: number
			total_investments: number
			total_repayments: number
		}
		recent_activity: {
			contributions: Array<{
				id: string
				amount: number
				status: string
				created_at: string
				type?: string
			}>
			loans: Array<{
				id: string
				amount: number
				status: string
				created_at: string
				type?: string
			}>
			investments: Array<{
				id: string
				amount: number
				status: string
				created_at: string
			}>
		}
		upcoming_payments: Array<{
			id: string
			amount: number
			due_date: string
			status: string
			description?: string
			type?: string
		}>
		property_interests: any[]
		monthly_trends: Array<{
			month: string
			contributions: number
			loans: number
			investments: number
		}>
		member_status: string
		kyc_status: string
		membership_type: string
	}>("/user/dashboard/stats", { method: "GET" })
}

export async function getUserDashboardQuickActions() {
	return apiFetch<{
		actions: Record<string, {
			title: string
			description: string
			url: string
			icon: string
			available: boolean
		}>
	}>("/user/dashboard/quick-actions", { method: "GET" })
}

// Subscription API
export async function getSubscriptionPackages() {
	return apiFetch<{
		packages: Array<{
			id: string
			name: string
			slug: string
			description?: string
			price: number
			billing_cycle: string
			duration: number
			duration_days: number
			trial_days: number
			features: any[]
			is_popular: boolean
			is_active: boolean
		}>
	}>("/subscriptions/packages", { method: "GET" })
}

export async function getCurrentSubscription() {
	return apiFetch<{
		success?: boolean
		subscription: {
			id: string
			package_id: string
			package_name: string
			status: string
			starts_at: string
			ends_at: string
			amount: number
			payment_reference: string
			days_remaining: number
			is_active: boolean
		} | null
		message?: string
	}>("/subscriptions/current", { method: "GET" })
}

export async function getSubscriptionHistory() {
	return apiFetch<{
		subscriptions: Array<{
			id: string
			package_name: string
			amount: number
			status: string
			starts_at: string
			ends_at: string
			payment_reference: string
			created_at: string
		}>
	}>("/subscriptions/history", { method: "GET" })
}

export async function getSubscriptionPaymentMethods() {
	return apiFetch<{
		payment_methods: Array<{
			id: string
			name: string
			description: string
			icon: string
			is_enabled: boolean
		}>
	}>("/subscriptions/payment-methods", { method: "GET" })
}

export async function initializeSubscription(data: {
	package_id: string
	payment_method: string
	notes?: string
	payer_name?: string
	payer_phone?: string
	account_details?: string
	payment_evidence?: string[]
}) {
	return apiFetch<{
		success: boolean
		paymentUrl?: string
		reference?: string
		rrr?: string
		message?: string
		requires_approval?: boolean
	}>("/subscriptions/initialize", {
		method: "POST",
		body: data,
	})
}

export async function verifySubscription(provider: string, reference: string) {
	const query = new URLSearchParams()
	query.set("provider", provider)
	query.set("reference", reference)
	return apiFetch<{
		success: boolean
		message: string
	}>(`/subscriptions/verify?${query.toString()}`, {
		method: "GET",
	})
}

// Member Subscription API (for individual members)
export async function getMemberSubscriptionPackages() {
	return apiFetch<{
		packages: Array<{
			id: string
			name: string
			slug: string
			description?: string
			price: number
			billing_cycle: string
			duration_days: number
			trial_days: number
			features: any[]
			benefits: any[]
			is_popular: boolean
			is_active: boolean
		}>
	}>("/user/member-subscriptions/packages", { method: "GET" })
}

export async function getMemberCurrentSubscription() {
	return apiFetch<{
		success?: boolean
		subscription: {
			id: string
			package_id: string
			package_name: string
			status: string
			payment_status: string
			start_date: string
			end_date: string
			amount_paid: number
			payment_method: string
			payment_reference: string
			days_remaining: number
			is_active: boolean
		} | null
		message?: string
	}>("/user/member-subscriptions/current", { method: "GET" })
}

export async function getMemberSubscriptionHistory() {
	return apiFetch<{
		subscriptions: Array<{
			id: string
			package_name: string
			amount_paid: number
			status: string
			payment_status: string
			payment_method: string
			start_date: string
			end_date: string
			payment_reference: string
			created_at: string
		}>
	}>("/user/member-subscriptions/history", { method: "GET" })
}

export async function getMemberSubscriptionPaymentMethods() {
	return apiFetch<{
		payment_methods: Array<{
			id: string
			name: string
			description: string
			icon: string
			is_enabled: boolean
		}>
	}>("/user/member-subscriptions/payment-methods", { method: "GET" })
}

export type MemberContributionFilters = {
	search?: string
	status?: string
	type?: string
	date_from?: string
	date_to?: string
	per_page?: number
	page?: number
}

export async function getMemberContributions(params?: MemberContributionFilters) {
	const query = new URLSearchParams()

	if (params?.search) query.set("search", params.search)
	if (params?.status && params.status !== "all") query.set("status", params.status)
	if (params?.type && params.type !== "all") query.set("type", params.type)
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	if (params?.per_page) query.set("per_page", String(params.per_page))
	if (params?.page) query.set("page", String(params.page))

	return apiFetch<{
		stats: {
			total_contributions: number
			this_month: number
			this_year: number
			average_monthly: number
			completed_payments: number
			next_due_date?: string | null
		}
		contributions: Array<{
			id: string
			amount: number
			status: string
			frequency?: string | null
			type?: string | null
			contribution_date?: string | null
			approved_at?: string | null
			rejection_reason?: string | null
			plan?: { id: string; name: string }
		}>
		pagination: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(`/user/contributions${query.toString() ? `?${query.toString()}` : ""}`)
}

export async function getContributionAutoPaySetting() {
	return apiFetch<{
		setting: {
			is_enabled: boolean
			payment_method: "wallet" | "card"
			amount: number | null
			day_of_month: number
			card_reference?: string | null
			metadata?: Record<string, unknown>
			last_run_at?: string | null
			next_run_at?: string | null
		}
	}>("/user/contributions/auto-pay")
}

export async function getContributionPlans(params?: { search?: string }) {
	const query = new URLSearchParams()

	if (params?.search) {
		query.append("search", params.search)
	}

	return apiFetch<{
		plans: Array<{
			id: string
			name: string
			description: string | null
			amount: number
			minimum_amount: number
			frequency: string
			is_mandatory: boolean
			created_at?: string | null
			updated_at?: string | null
		}>
		member_plan: {
			plan: {
				id: string
				name: string
				description: string | null
				amount: number
				minimum_amount: number
				frequency: string
				is_mandatory: boolean
				created_at?: string | null
				updated_at?: string | null
			}
			started_at: string | null
			last_contribution_at: string | null
			contributions_count: number
			total_contributed: number
		} | null
	}>(`/user/contributions/plans${query.toString() ? `?${query.toString()}` : ""}`)
}

export async function getContributionPaymentMethods() {
	return apiFetch<{
		payment_methods: Array<{
			id: string
			name: string
			description: string
			icon: string
			is_enabled: boolean
			configuration?: Record<string, unknown>
		}>
	}>("/user/contributions/payment-methods")
}

export async function getEquityPlans() {
	return apiFetch<{
		success: boolean
		data: Array<{
			id: string
			name: string
			description?: string | null
			min_amount: number
			max_amount?: number | null
			frequency: string
			is_mandatory: boolean
		}>
	}>("/user/equity-plans?is_active=true&per_page=100")
}

export async function getEquityContributionPaymentMethods() {
	return apiFetch<{
		success: boolean
		payment_methods: Array<{
			id: string
			name: string
			description: string
			icon?: string
			is_enabled: boolean
			configuration?: Record<string, unknown>
		}>
	}>("/user/equity-contributions/payment-methods")
}

export async function switchContributionPlan(planId: string) {
	return apiFetch<{
		success: boolean
		message: string
		member_plan: {
			plan: {
				id: string
				name: string
				description: string | null
				amount: number
				minimum_amount: number
				frequency: string
				is_mandatory: boolean
				created_at?: string | null
				updated_at?: string | null
			}
			started_at: string | null
			last_contribution_at: string | null
			contributions_count: number
			total_contributed: number
		} | null
	}>(`/user/contributions/plans/${planId}/switch`, {
		method: "POST",
	})
}

export async function initializeContributionPayment(
	data:
		| FormData
		| {
			amount: number
			payment_method: string
			plan_id?: string
			notes?: string
			payer_name?: string
			payer_phone?: string
			transaction_reference?: string
			bank_account_id?: string
			payment_evidence?: string[]
		},
) {
	return apiFetch<{
		success: boolean
		message?: string
		reference?: string
		payment_id?: string
		payment_method?: string
		payment_url?: string | null
		requires_approval?: boolean
		manual_instructions?: {
			account?: Record<string, unknown>
			requires_payment_evidence?: boolean
			message?: string
		}
		contribution?: {
			id: string
			status: string
			amount: number
			plan_id?: string | null
		}
	}>('/user/contributions/pay', {
		method: 'POST',
		body: data,
	})
}

export async function createEquityContribution(
	data:
		| FormData
		| {
				plan_id?: string | null
				amount: number
				payment_method: string
				payment_reference?: string | null
				notes?: string | null
				payer_name?: string | null
				payer_phone?: string | null
				transaction_reference?: string | null
				bank_account_id?: string | null
				payment_evidence?: string[]
		  },
) {
	return apiFetch<{
		success: boolean
		message?: string
		data?: Record<string, unknown>
		reference?: string
		payment_id?: string
		payment_method?: string
		payment_url?: string | null
		requires_approval?: boolean
		manual_instructions?: {
			account?: Record<string, unknown>
			requires_payment_evidence?: boolean
			message?: string
		} | null
	}>("/user/equity-contributions", {
		method: "POST",
		body: data,
	})
}

export async function verifyContributionPayment(provider: "paystack" | "remita" | "stripe", reference: string) {
	const query = new URLSearchParams({ provider, reference })
	return apiFetch<{
		success: boolean
		message?: string
		data?: unknown
	}>(`/payments/verify?${query.toString()}`, { method: "GET" })
}

export async function updateContributionAutoPaySetting(payload: {
	is_enabled: boolean
	payment_method?: "wallet" | "card"
	amount?: number | null
	day_of_month: number
	card_reference?: string | null
	metadata?: Record<string, unknown>
}) {
	const body: Record<string, unknown> = {
		is_enabled: payload.is_enabled,
		day_of_month: payload.day_of_month,
	}

	if (payload.payment_method) body.payment_method = payload.payment_method
	if (payload.amount !== undefined) body.amount = payload.amount
	if (payload.card_reference !== undefined) body.card_reference = payload.card_reference
	if (payload.metadata !== undefined) body.metadata = payload.metadata

	return apiFetch<{
		success: boolean
		message: string
		setting: {
			is_enabled: boolean
			payment_method: "wallet" | "card"
			amount: number | null
			day_of_month: number
			card_reference?: string | null
			metadata?: Record<string, unknown>
			last_run_at?: string | null
			next_run_at?: string | null
		}
	}>("/user/contributions/auto-pay", {
		method: "PUT",
		body,
	})
}

export async function initializeMemberSubscription(data: {
	package_id: string
	payment_method: string
	notes?: string
	payer_name?: string
	payer_phone?: string
	account_details?: string
	payment_evidence?: string[]
}) {
	return apiFetch<{
		success: boolean
		paymentUrl?: string
		reference?: string
		subscription_id?: string
		requires_approval?: boolean
		message?: string
	}>("/user/member-subscriptions/initialize", {
		method: "POST",
		body: data,
	})
}

// Upload payment evidence file
export async function uploadPaymentEvidence(file: File): Promise<string> {
	const formData = new FormData()
	formData.append('file', file)
	formData.append('type', 'payment_evidence')
	
	// Check if user is admin to use the correct endpoint
	let isAdmin = false
	try {
		const userData = localStorage.getItem('user_data')
		if (userData) {
			const parsed = JSON.parse(userData)
			const role = parsed.role || (parsed.roles && parsed.roles[0])
			isAdmin = role === 'admin' || role === 'super_admin' || role === 'super-admin'
		}
	} catch {
		// If we can't parse user data, default to user endpoint
		isAdmin = false
	}
	
	const endpoint = isAdmin 
		? '/api/admin/payment-evidence/upload'
		: '/api/user/profile/upload-payment-evidence'
	
	const token = localStorage.getItem('auth_token')
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${endpoint}`, {
		method: "POST",
		body: formData,
		headers: {
			'Authorization': `Bearer ${token}`,
			'X-Tenant-Slug': localStorage.getItem('tenant_slug') || '',
		},
	})
	
	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || 'Failed to upload file')
	}
	
	const data = await response.json()
	return data.url || data.path
}

export async function verifyMemberSubscription(provider: string, reference: string) {
	return apiFetch<{
		success: boolean
		message: string
	}>("/user/member-subscriptions/verify", {
		method: "POST",
		body: { provider, reference },
	})
}

// Super Admin Member Subscription Approval
export async function approveMemberSubscription(subscriptionId: string) {
	return apiFetch<{
		success: boolean
		message: string
		subscription: any
	}>(`/super-admin/member-subscriptions/${subscriptionId}/approve`, {
		method: "POST",
	})
}

export async function rejectMemberSubscription(subscriptionId: string, rejectionReason: string) {
	return apiFetch<{
		success: boolean
		message: string
		subscription: any
	}>(`/super-admin/member-subscriptions/${subscriptionId}/reject`, {
		method: "POST",
		body: { rejection_reason: rejectionReason },
	})
}

export interface SubmitPropertyPaymentPayload {
	method: PropertyFundingOption
	amount: number
	notes?: string
	payer_name?: string
	payer_phone?: string
	payment_date?: string
	reference?: string
	metadata?: Record<string, unknown>
}

export async function submitPropertyPayment(propertyId: string, payload: SubmitPropertyPaymentPayload | FormData) {
	const isFormData = payload instanceof FormData

	return apiFetch<{ success: boolean; data: PropertyPaymentSetup; message?: string; transaction?: { id: string; status: string; reference: string } }>(
		`/properties/${propertyId}/payments`,
		{
			method: "POST",
			body: payload,
			headers: isFormData ? {} : undefined,
		},
	)
}

export interface SearchedMember {
	id: string
	member_number: string
	name: string
	email: string | null
	phone_number: string | null
	active_loans: number
	outstanding_balance: number
}

export async function searchMembers(query: string) {
	if (!query || query.length < 2) {
		return { success: true, data: [] as SearchedMember[] }
	}

	return apiFetch<{ success: boolean; data: SearchedMember[]; message?: string }>(
		`/admin/loan-repayments/members?query=${encodeURIComponent(query)}`,
		{ method: "GET" },
	)
}

export interface ApprovedPropertyInterest {
	id: string
	property_id: string
	member_id: string
	status: string
	property: {
		id: string
		title: string
		location?: string | null
		address?: string | null
		price?: number | null
	}
	created_at: string
}

export async function getApprovedPropertyInterests(memberId: string) {
	return apiFetch<{ success: boolean; data: ApprovedPropertyInterest[]; pagination?: { current_page: number; last_page: number; per_page: number; total: number } }>(
		`/admin/property-payment-plans/pending-interests?member_id=${memberId}&per_page=100`,
		{ method: "GET" },
	)
}

export interface PropertyPaymentPlanDetails {
	property: {
		id: string
		title: string
	}
	cooperative_amount: number | null
	mortgage_amount: number | null
	funding_option: string
	selected_methods: string[]
}

export async function getPropertyPaymentPlanDetails(propertyId: string, memberId: string) {
	return apiFetch<{ success: boolean; data: PropertyPaymentPlanDetails }>(
		`/admin/property-payment-plans/details?property_id=${propertyId}&member_id=${memberId}`,
		{ method: "GET" },
	)
}

// Get repayment schedule for a loan
export async function getLoanRepaymentSchedule(loanId: string) {
	return apiFetch<{ success: boolean; data: RepaymentSchedule }>(
		`/loans/${loanId}/schedule`,
		{ method: "GET" },
	)
}

// Get repayment schedule for a mortgage
export async function getMortgageRepaymentSchedule(mortgageId: string) {
	return apiFetch<{ success: boolean; data: RepaymentSchedule }>(
		`/admin/mortgages/${mortgageId}/repayment-schedule`,
		{ method: "GET" },
	)
}

export interface NextPaymentDetails {
	principal_paid: number
	interest_paid: number
	total_amount: number
	due_date: string
	remaining_principal: number
	payment_method: string
}

export async function getMortgageNextPayment(mortgageId: string) {
	return apiFetch<{ success: boolean; data: NextPaymentDetails; message?: string }>(
		`/admin/mortgages/${mortgageId}/next-payment`,
		{ method: "GET" },
	)
}

// Get repayment schedule for an internal mortgage plan
export async function getInternalMortgageRepaymentSchedule(planId: string) {
	return apiFetch<{ success: boolean; data: RepaymentSchedule }>(
		`/admin/internal-mortgages/${planId}/repayment-schedule`,
		{ method: "GET" },
	)
}

export async function getInternalMortgageNextPayment(planId: string) {
	return apiFetch<{ success: boolean; data: NextPaymentDetails; message?: string }>(
		`/admin/internal-mortgages/${planId}/next-payment`,
		{ method: "GET" },
	)
}

// Approve mortgage repayment schedule
export async function approveMortgageSchedule(mortgageId: string) {
	return apiFetch<{ success: boolean; message: string; data: { mortgage: any } }>(
		`/properties/mortgages/${mortgageId}/approve-schedule`,
		{ method: "POST" },
	)
}

// Approve internal mortgage repayment schedule
export async function approveInternalMortgageSchedule(planId: string) {
	return apiFetch<{ success: boolean; message: string; data: { plan: any } }>(
		`/properties/internal-mortgages/${planId}/approve-schedule`,
		{ method: "POST" },
	)
}

// Record a mortgage repayment (admin)
export interface RepayMortgagePayload {
	amount: number
	principal_paid: number
	interest_paid: number
	due_date: string
	payment_method: "monthly" | "yearly" | "bi-yearly"
	notes?: string
}

export async function repayMortgage(mortgageId: string, payload: RepayMortgagePayload) {
	return apiFetch<{ success: boolean; message: string; data?: unknown }>(
		`/admin/mortgages/${mortgageId}/repay`,
		{
			method: "POST",
			body: payload,
		},
	)
}

// Record an internal mortgage repayment (admin)
export interface RepayInternalMortgagePayload {
	amount: number
	principal_paid: number
	interest_paid: number
	due_date: string
	payment_method: "monthly" | "yearly" | "bi-yearly"
	notes?: string
}

export async function repayInternalMortgage(planId: string, payload: RepayInternalMortgagePayload) {
	return apiFetch<{ success: boolean; message: string; data?: unknown }>(
		`/admin/internal-mortgages/${planId}/repay`,
		{
			method: "POST",
			body: payload,
		},
	)
}

// Download bulk mortgage repayment template
export async function downloadMortgageRepaymentTemplate() {
	const response = await fetch(`${getApiBaseUrl()}/admin/bulk/mortgage-repayments/template`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
			"X-Tenant-Slug": getTenantSlug() || "",
		},
	})
	if (!response.ok) throw new Error("Failed to download template")
	const blob = await response.blob()
	const url = window.URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = "mortgage_repayments_template.csv"
	a.click()
	window.URL.revokeObjectURL(url)
}

// Upload bulk mortgage repayments
export async function uploadBulkMortgageRepayments(file: File) {
	const formData = new FormData()
	formData.append("file", file)
	return apiFetch<{ success: boolean; message: string; data?: { successful: number; failed: number; errors?: unknown[] } }>(
		"/admin/bulk/mortgage-repayments/upload",
		{
			method: "POST",
			body: formData,
		},
	)
}

// Download bulk internal mortgage repayment template
export async function downloadInternalMortgageRepaymentTemplate() {
	const response = await fetch(`${getApiBaseUrl()}/admin/bulk/internal-mortgage-repayments/template`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
			"X-Tenant-Slug": getTenantSlug() || "",
		},
	})
	if (!response.ok) throw new Error("Failed to download template")
	const blob = await response.blob()
	const url = window.URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = "internal_mortgage_repayments_template.csv"
	a.click()
	window.URL.revokeObjectURL(url)
}

// Upload bulk internal mortgage repayments
export async function uploadBulkInternalMortgageRepayments(file: File) {
	const formData = new FormData()
	formData.append("file", file)
	return apiFetch<{ success: boolean; message: string; data?: { successful: number; failed: number; errors?: unknown[] } }>(
		"/admin/bulk/internal-mortgage-repayments/upload",
		{
			method: "POST",
			body: formData,
		},
	)
}

// Mail/Messaging API Functions
export interface MailMessage {
	id: string
	sender_id: string
	recipient_id: string | null
	subject: string
	body: string
	type: string
	status: "draft" | "sent" | "delivered" | "failed"
	category?: string | null
	folder?: string | null
	is_starred: boolean
	is_read: boolean
	is_unread: boolean
	has_attachment: boolean
	sent_at?: string | null
	read_at?: string | null
	delivered_at?: string | null
	parent_id?: string | null
	cc?: string[]
	bcc?: string[]
	sender: {
		id: string
		name: string
		email: string
	}
	recipient: {
		id: string
		name: string
		email: string
	} | null
	attachments: Array<{
		id: string
		file_name: string
		file_path: string
		file_size: number
		mime_type: string
		download_url: string
	}>
	from?: string | null
	fromEmail?: string | null
	to?: string | null
	toEmail?: string | null
	preview: string
	date: string
	created_at: string
	updated_at: string
}

export interface MailListResponse {
	success: boolean
	messages: MailMessage[]
	pagination: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export interface ComposeMailPayload {
	recipient_id?: string
	subject?: string
	body?: string
	type?: "internal" | "system" | "notification"
	status?: "draft" | "sent"
	save_as_draft?: boolean
	cc?: string[]
	bcc?: string[]
	category?: string
	attachments?: File[]
}

// Get inbox messages (member-facing)
export async function getMemberInboxMessages(params?: { filter?: "all" | "unread" | "read"; search?: string; starred?: boolean; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.filter) query.set("filter", params.filter)
	if (params?.search) query.set("search", params.search)
	if (params?.starred) query.set("starred", "true")
	if (params?.page) query.set("page", params.page.toString())
	if (params?.per_page) query.set("per_page", params.per_page.toString())
	return apiFetch<MailListResponse>(`/communication/mail/inbox?${query.toString()}`, { method: "GET" })
}

// Get sent messages (member-facing)
export async function getMemberSentMessages(params?: { search?: string; category?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.category) query.set("category", params.category)
	if (params?.page) query.set("page", params.page.toString())
	if (params?.per_page) query.set("per_page", params.per_page.toString())
	return apiFetch<MailListResponse>(`/communication/mail/sent?${query.toString()}`, { method: "GET" })
}

// Get outbox messages (member-facing)
export async function getMemberOutboxMessages(params?: { search?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", params.page.toString())
	if (params?.per_page) query.set("per_page", params.per_page.toString())
	return apiFetch<MailListResponse>(`/communication/mail/outbox?${query.toString()}`, { method: "GET" })
}

// Get draft messages (member-facing)
export async function getMemberDraftMessages(params?: { search?: string; page?: number; per_page?: number }) {
	const query = new URLSearchParams()
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", params.page.toString())
	if (params?.per_page) query.set("per_page", params.per_page.toString())
	return apiFetch<MailListResponse>(`/communication/mail/drafts?${query.toString()}`, { method: "GET" })
}

// Get single mail message
export async function getMailMessage(mailId: string) {
	return apiFetch<{ success: boolean; mail: MailMessage }>(`/communication/mail/${mailId}`, { method: "GET" })
}

// Compose and send mail
export async function composeMail(payload: ComposeMailPayload) {
	const formData = new FormData()
	if (payload.recipient_id) formData.append("recipient_id", payload.recipient_id)
	if (payload.subject) formData.append("subject", payload.subject)
	if (payload.body) formData.append("body", payload.body)
	if (payload.type) formData.append("type", payload.type)
	if (payload.status) formData.append("status", payload.status)
	if (payload.save_as_draft) formData.append("save_as_draft", "true")
	if (payload.category) formData.append("category", payload.category)
	if (payload.cc && payload.cc.length > 0) {
		payload.cc.forEach((id) => formData.append("cc[]", id))
	}
	if (payload.bcc && payload.bcc.length > 0) {
		payload.bcc.forEach((id) => formData.append("bcc[]", id))
	}
	if (payload.attachments && payload.attachments.length > 0) {
		payload.attachments.forEach((file) => formData.append("attachments[]", file))
	}
	return apiFetch<{ success: boolean; message: string; mail: MailMessage }>("/communication/mail", {
		method: "POST",
		body: formData,
	})
}

// Mark mail as read
export async function markMailAsRead(mailId: string) {
	return apiFetch<{ success: boolean; message: string }>(`/communication/mail/${mailId}/read`, { method: "POST" })
}

// Mark mail as unread
export async function markMailAsUnread(mailId: string) {
	return apiFetch<{ success: boolean; message: string }>(`/communication/mail/${mailId}/unread`, { method: "POST" })
}

// Toggle star status
export async function toggleMailStar(mailId: string) {
	return apiFetch<{ success: boolean; message: string; is_starred: boolean }>(`/communication/mail/${mailId}/star`, { method: "POST" })
}

// Delete mail
export async function deleteMail(mailId: string) {
	return apiFetch<{ success: boolean; message: string }>(`/communication/mail/${mailId}`, { method: "DELETE" })
}

// Bulk delete mails
export async function bulkDeleteMails(ids: string[]) {
	return apiFetch<{ success: boolean; message: string }>("/communication/mail/bulk-delete", {
		method: "POST",
		body: { ids },
	})
}

// Bulk mark as read
export async function bulkMarkMailsAsRead(ids: string[]) {
	return apiFetch<{ success: boolean; message: string }>("/communication/mail/bulk-mark-read", {
		method: "POST",
		body: { ids },
	})
}

// Reply to mail
export async function replyToMail(mailId: string, payload: { subject: string; body: string }) {
	return apiFetch<{ success: boolean; message: string; mail: MailMessage }>(`/communication/mail/${mailId}/reply`, {
		method: "POST",
		body: payload,
	})
}

// Get available recipients (users/admins for dropdown)
export async function getAvailableRecipients(search?: string) {
	const query = new URLSearchParams()
	if (search) query.set("search", search)
	return apiFetch<{ success: boolean; users: Array<{ id: string; name: string; email: string; role: string }> }>(
		`/communication/mail/recipients?${query.toString()}`,
		{ method: "GET" }
	)
}

// Member Reports API
export interface ContributionReport {
	success: boolean
	stats: {
		total_contributions: number
		this_month: number
		average_monthly: number
		total_payments: number
		monthly_change: number
	}
	contributions: Array<{
		id: string
		date: string
		amount: number
		type: string
		status: string
		reference: string
		plan: string | null
	}>
}

export interface EquityContributionReport {
	success: boolean
	stats: {
		total_contributions: number
		this_month: number
		total_payments: number
	}
	equity_contributions: Array<{
		id: string
		date: string
		amount: number
		status: string
		reference: string
		plan: string | null
	}>
}

export interface InvestmentReport {
	success: boolean
	stats: {
		total_invested: number
		current_value: number
		total_roi: number
		roi_percentage: number
		active_investments: number
	}
	investments: Array<{
		id: string
		name: string
		type: string
		amount: number
		current_value: number
		roi: number
		status: string
		date: string
	}>
}

export interface LoanReport {
	success: boolean
	stats: {
		total_borrowed: number
		total_repaid: number
		outstanding_balance: number
		interest_paid: number
	}
	loans: Array<{
		id: string
		reference: string
		type: string
		amount: number
		repaid: number
		balance: number
		interest_rate: number
		status: string
		due_date: string | null
		progress: number
	}>
}

export interface PropertyReport {
	success: boolean
	stats: {
		total_properties: number
		completed_properties: number
		ongoing_properties: number
		total_invested: number
		total_value: number
		payment_progress: number
	}
	properties: Array<{
		id: string
		name: string
		type: string
		location: string
		size: string
		total_cost: number
		amount_paid: number
		payment_status: string
		subscription_date: string
		last_payment: string | null
		payment_method: string
	}>
}

export interface FinancialSummaryReport {
	success: boolean
	financial_data: {
		total_contributions: number
		total_investments: number
		total_loans: number
		total_properties: number
		wallet_balance: number
		loan_balance: number
		investment_returns: number
		property_equity: number
	}
	net_worth: number
	total_assets: number
	total_liabilities: number
	monthly_data: Array<{
		month: string
		income: number
		expenses: number
	}>
}

export interface MortgageReport {
	success: boolean
	stats: {
		total_mortgages: number
		total_mortgage_amount: number
		total_repaid: number
		outstanding_balance: number
		interest_paid: number
	}
	mortgages: Array<{
		id: string
		type: "mortgage" | "internal"
		reference: string
		provider: string
		amount: number
		repaid: number
		balance: number
		interest_rate: number
		monthly_payment: number
		status: string
		progress: number
		created_at: string
	}>
}

export async function getContributionReport(params?: {
	date_from?: string
	date_to?: string
	status?: string
	period?: string
}) {
	const query = new URLSearchParams()
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	if (params?.status) query.set("status", params.status)
	if (params?.period) query.set("period", params.period)
	return apiFetch<ContributionReport>(`/user/reports/contributions?${query.toString()}`, { method: "GET" })
}

export async function getEquityContributionReport(params?: {
	date_from?: string
	date_to?: string
	status?: string
}) {
	const query = new URLSearchParams()
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	if (params?.status) query.set("status", params.status)
	return apiFetch<EquityContributionReport>(`/user/reports/equity-contributions?${query.toString()}`, { method: "GET" })
}

export async function getInvestmentReport(params?: {
	date_from?: string
	date_to?: string
	type?: string
	status?: string
}) {
	const query = new URLSearchParams()
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	if (params?.type) query.set("type", params.type)
	if (params?.status) query.set("status", params.status)
	return apiFetch<InvestmentReport>(`/user/reports/investments?${query.toString()}`, { method: "GET" })
}

export async function getLoanReport(params?: {
	date_from?: string
	date_to?: string
	status?: string
	loan_type?: string
}) {
	const query = new URLSearchParams()
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	if (params?.status) query.set("status", params.status)
	if (params?.loan_type) query.set("loan_type", params.loan_type)
	return apiFetch<LoanReport>(`/user/reports/loans?${query.toString()}`, { method: "GET" })
}

export async function getPropertyReport(params?: {
	property_type?: string
	payment_status?: string
	date_from?: string
	date_to?: string
}) {
	const query = new URLSearchParams()
	if (params?.property_type) query.set("property_type", params.property_type)
	if (params?.payment_status) query.set("payment_status", params.payment_status)
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	return apiFetch<PropertyReport>(`/user/reports/properties?${query.toString()}`, { method: "GET" })
}

export async function getFinancialSummaryReport(params?: {
	date_from?: string
	date_to?: string
}) {
	const query = new URLSearchParams()
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	return apiFetch<FinancialSummaryReport>(`/user/reports/financial-summary?${query.toString()}`, { method: "GET" })
}

export async function getMortgageReport(params?: {
	date_from?: string
	date_to?: string
	mortgage_type?: string
}) {
	const query = new URLSearchParams()
	if (params?.date_from) query.set("date_from", params.date_from)
	if (params?.date_to) query.set("date_to", params.date_to)
	if (params?.mortgage_type) query.set("mortgage_type", params.mortgage_type)
	return apiFetch<MortgageReport>(`/user/reports/mortgages?${query.toString()}`, { method: "GET" })
}

export interface AIRecommendation {
	type: "property" | "investment_plan"
	id: string
	title: string
	location?: string
	price?: number
	type_label?: string
	description?: string
	min_amount?: number
	max_amount?: number
	expected_return_rate?: number
	reasoning: string
	risk_level: "low" | "medium" | "high"
	projected_roi: string
	confidence: number
	min_investment: string
	time_horizon: string
	image_url?: string | null
}

export interface AIRecommendationsResponse {
	success: boolean
	investment_profile: {
		risk_tolerance: "conservative" | "moderate" | "aggressive"
		risk_score: number
		investment_capacity: number
		recommended_allocation: number
	}
	recommendations: AIRecommendation[]
	financial_summary: {
		total_assets: number
		available_capital: number
		current_investments: number
		property_equity: number
	}
	note?: string
}

export async function getAIRecommendations() {
	return apiFetch<AIRecommendationsResponse>("/ai/recommendations", { method: "GET" })
}

export interface BlockchainTransaction {
	id: string
	hash: string
	reference: string | null
	type: "contribution" | "loan" | "investment" | "payment" | "transfer"
	amount: number
	currency: string
	status: "pending" | "confirmed" | "failed"
	metadata: Record<string, any> | null
	confirmed_at: string | null
	failed_at: string | null
	failure_reason: string | null
	created_at: string
	updated_at: string
	user?: {
		id: string
		name: string
		email: string
	}
}

export interface BlockchainStats {
	total_transactions: number
	pending_transactions: number
	confirmed_transactions: number
	failed_transactions: number
	total_volume: number
	network_info?: {
		network: string
		network_type: string
		last_sync: string
	}
}

export interface BlockchainTransactionsResponse {
	transactions: BlockchainTransaction[]
	pagination: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export interface PropertyOwnershipRecord {
	property_id: string
	property_title: string
	property_type: string
	property_location: string
	property_price: number
	ownership_percentage: number
	amount_paid: number
	blockchain_hash: string | null
	certificate_date: string
	is_verified: boolean
	transactions: Array<{
		hash: string
		amount: number
		status: string
		date: string
		confirmed_at: string | null
	}>
}

export interface PropertyOwnershipResponse {
	success: boolean
	ownership_records: PropertyOwnershipRecord[]
}

export async function getBlockchainTransactions(params?: {
	type?: string
	status?: string
	search?: string
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.type) query.set("type", params.type)
	if (params?.status) query.set("status", params.status)
	if (params?.search) query.set("search", params.search)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	return apiFetch<BlockchainTransactionsResponse>(`/blockchain/transactions?${query.toString()}`, { method: "GET" })
}

export async function getBlockchainStats() {
	return apiFetch<{ stats: BlockchainStats }>("/blockchain/stats", { method: "GET" })
}

export async function getPropertyOwnership() {
	return apiFetch<PropertyOwnershipResponse>("/blockchain/property-ownership", { method: "GET" })
}

export async function verifyBlockchainTransaction(hash: string) {
	return apiFetch<{ valid: boolean; transaction: BlockchainTransaction }>(`/blockchain/verify/${hash}`, {
		method: "POST",
	})
}

export interface UserSettings {
	id: string
	user_id: string
	email_notifications: boolean
	sms_notifications: boolean
	payment_reminders: boolean
	loan_updates: boolean
	investment_updates: boolean
	property_updates: boolean
	contribution_updates: boolean
	language: string
	timezone: string
	two_factor_enabled: boolean
	two_factor_secret: string | null
	two_factor_recovery_codes: string[] | null
	profile_visible: boolean
	show_email: boolean
	show_phone: boolean
	preferences: Record<string, any> | null
	created_at: string
	updated_at: string
}

export interface UserSettingsResponse {
	success: boolean
	settings: UserSettings
	message?: string
}

export interface UserProfile {
	id: string
	first_name: string
	last_name: string
	email: string
	phone: string | null
	avatar_url: string | null
	role: string
	roles: string[]
	status: string
	email_verified_at: string | null
	last_login: string | null
	created_at: string
	updated_at: string
	member?: any
}

export interface UserProfileResponse {
	user: UserProfile
}

export async function getUserProfile() {
	return apiFetch<UserProfileResponse>("/user/profile", { method: "GET" })
}

export async function updateUserProfile(data: {
	first_name?: string
	last_name?: string
	phone?: string
	date_of_birth?: string
	gender?: string
	marital_status?: string
	nationality?: string
	state_of_origin?: string
	lga?: string
	residential_address?: string
	city?: string
	state?: string
	staff_id?: string
	ippis_number?: string
	rank?: string
	department?: string
	command_state?: string
	employment_date?: string
	next_of_kin_name?: string
	next_of_kin_relationship?: string
	next_of_kin_phone?: string
	next_of_kin_email?: string
	next_of_kin_address?: string
}) {
	return apiFetch<{ success: boolean; message: string; user: UserProfile }>("/user/profile", {
		method: "PUT",
		body: data,
	})
}

export async function getUserSettings() {
	return apiFetch<UserSettingsResponse>("/user/settings", { method: "GET" })
}

export async function updateUserSettings(data: {
	email_notifications?: boolean
	sms_notifications?: boolean
	payment_reminders?: boolean
	loan_updates?: boolean
	investment_updates?: boolean
	property_updates?: boolean
	contribution_updates?: boolean
	language?: string
	timezone?: string
	profile_visible?: boolean
	show_email?: boolean
	show_phone?: boolean
}) {
	return apiFetch<UserSettingsResponse>("/user/settings", {
		method: "PUT",
		body: data,
	})
}

export async function changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }) {
	return apiFetch<{ success: boolean; message: string }>("/user/settings/change-password", {
		method: "POST",
		body: data,
	})
}

export async function toggleTwoFactor(enabled: boolean) {
	return apiFetch<{
		success: boolean
		message: string
		two_factor_enabled: boolean
		two_factor_secret: string | null
		recovery_codes: string[] | null
	}>("/user/settings/two-factor", {
		method: "POST",
		body: { enabled },
	})
}

// ==================== Refund Requests (Ticket-based) ====================

export interface RefundRequest {
	id: string
	member_id: string
	request_type: "refund" | "stoppage_of_deduction" | "building_plan" | "tdp" | "change_of_ownership" | "other"
	status: "pending" | "approved" | "rejected" | "processing" | "completed"
	source?: "wallet" | "contribution" | "investment_return" | "equity_wallet"
	amount: number
	reason: string
	message?: string
	admin_response?: string
	rejection_reason?: string
	ticket_number: string
	reference?: string
	requested_by?: string
	approved_by?: string
	rejected_by?: string
	processed_by?: string
	requested_at?: string
	approved_at?: string
	rejected_at?: string
	processed_at?: string
	completed_at?: string
	created_at: string
	updated_at: string
	member?: {
		id: string
		user?: {
			id: string
			first_name: string
			last_name: string
			email: string
		}
	}
	requestedBy?: {
		id: string
		first_name: string
		last_name: string
	}
	approvedBy?: {
		id: string
		first_name: string
		last_name: string
	}
	rejectedBy?: {
		id: string
		first_name: string
		last_name: string
	}
}

export interface RefundRequestsResponse {
	success: boolean
	refunds: RefundRequest[]
	pagination: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export interface RefundStats {
	total_requests: number
	pending: number
	approved: number
	rejected: number
	processing: number
	completed: number
	total_refunded: number
	by_type?: {
		refund: number
		stoppage_of_deduction: number
		building_plan: number
		tdp: number
		change_of_ownership: number
		other: number
	}
}

export interface RefundStatsResponse {
	success: boolean
	stats: RefundStats
}

export interface CreateRefundRequestPayload {
	request_type: "refund" | "stoppage_of_deduction" | "building_plan" | "tdp" | "change_of_ownership" | "other"
	source?: "wallet" | "contribution" | "investment_return" | "equity_wallet"
	amount?: number
	reason: string
	message: string
}

export interface RefundRequestResponse {
	success: boolean
	message: string
	refund: RefundRequest
}

// User/Member Refund Request Functions
export async function getUserRefundRequests(params?: {
	status?: string
	request_type?: string
	page?: number
	per_page?: number
}) {
	const queryParams = new URLSearchParams()
	if (params?.status) queryParams.set("status", params.status)
	if (params?.request_type) queryParams.set("request_type", params.request_type)
	if (params?.page) queryParams.set("page", String(params.page))
	if (params?.per_page) queryParams.set("per_page", String(params.per_page))

	return apiFetch<RefundRequestsResponse>(`/refunds?${queryParams.toString()}`, { method: "GET" })
}

export async function getUserRefundStats() {
	return apiFetch<RefundStatsResponse>("/refunds/stats", { method: "GET" })
}

export async function createRefundRequest(payload: CreateRefundRequestPayload) {
	return apiFetch<RefundRequestResponse>("/refunds", {
		method: "POST",
		body: payload,
	})
}

export async function getUserRefundRequest(id: string) {
	return apiFetch<{ success: boolean; refund: RefundRequest }>(`/refunds/${id}`, { method: "GET" })
}

// Admin Refund Request Functions
export async function getAdminRefundRequests(params?: {
	status?: string
	request_type?: string
	search?: string
	page?: number
	per_page?: number
}) {
	const queryParams = new URLSearchParams()
	if (params?.status) queryParams.set("status", params.status)
	if (params?.request_type) queryParams.set("request_type", params.request_type)
	if (params?.search) queryParams.set("search", params.search)
	if (params?.page) queryParams.set("page", String(params.page))
	if (params?.per_page) queryParams.set("per_page", String(params.per_page))

	return apiFetch<RefundRequestsResponse>(`/admin/refunds?${queryParams.toString()}`, { method: "GET" })
}

export async function getAdminRefundStats() {
	return apiFetch<RefundStatsResponse>("/admin/refunds/stats", { method: "GET" })
}

export async function getAdminRefundRequest(id: string) {
	return apiFetch<{ success: boolean; refund: RefundRequest }>(`/admin/refunds/${id}`, { method: "GET" })
}

export async function approveRefundRequest(id: string, data?: { admin_response?: string; process_immediately?: boolean }) {
	return apiFetch<RefundRequestResponse>(`/admin/refunds/${id}/approve`, {
		method: "POST",
		body: data || {},
	})
}

export async function rejectRefundRequest(id: string, rejection_reason: string) {
	return apiFetch<RefundRequestResponse>(`/admin/refunds/${id}/reject`, {
		method: "POST",
		body: { rejection_reason },
	})
}