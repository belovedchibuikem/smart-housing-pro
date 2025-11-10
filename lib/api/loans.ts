import { apiFetch } from "./client"

export type InterestType = "simple" | "compound" | string

export interface LoanProduct {
	id: string
	name: string
	description?: string | null
	min_amount: number
	max_amount?: number | null
	interest_rate: number
	min_tenure_months: number
	max_tenure_months: number
	interest_type: InterestType
	eligibility_criteria?: string[] | null
	required_documents?: string[] | null
	processing_fee_percentage?: number | null
	late_payment_fee?: number | null
	is_active: boolean
	created_at?: string
	updated_at?: string
}

export interface LoanProductSummary {
	id: string
	name: string
	description?: string | null
	interest_rate?: number | null
	min_amount?: number | null
	max_amount?: number | null
	min_tenure_months?: number | null
	max_tenure_months?: number | null
}

export interface LoanRepayment {
	id: string
	amount: number
	due_date?: string | null
	status?: string | null
	paid_at?: string | null
	payment_method?: string | null
	reference?: string | null
	created_at?: string | null
	updated_at?: string | null
}

export interface LoanMemberSummary {
	id: string
	member_number?: string | null
	full_name?: string | null
	user?: {
		id: string
		email?: string | null
		phone?: string | null
	}
}

export interface LoanResource {
	id: string
	member_id: string
	product_id?: string | null
	amount: number
	interest_rate: number
	duration_months: number
	type: string
	purpose?: string | null
	status: string
	application_date?: string | null
	approved_at?: string | null
	approved_by?: string | null
	rejection_reason?: string | null
	rejected_at?: string | null
	rejected_by?: string | null
	total_amount: number
	monthly_payment: number
	interest_amount?: number | null
	processing_fee?: number | null
	required_documents?: string[] | null
	application_metadata?: Record<string, unknown> | null
	member?: LoanMemberSummary | null
	product?: LoanProductSummary | null
	repayments?: LoanRepayment[]
	created_at?: string | null
	updated_at?: string | null
}

export interface LoanListResponse {
	loans: LoanResource[]
	pagination?: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export interface LoanRepaymentScheduleEntry {
	installment: number
	due_date: string
	amount: number
	status?: string
}

export interface LoanRepaymentScheduleResponse {
	loan: {
		id: string
		total_amount: number
		monthly_payment: number
		duration_months: number
		interest_rate: number
	}
	repayment_summary: {
		total_repaid: number
		remaining_amount: number
		remaining_installments: number
	}
	schedule: LoanRepaymentScheduleEntry[]
}

export interface LoanApplicationPayload {
	product_id: string
	amount: number
	tenure_months: number
	purpose: string
	net_pay: number
	employment_status: "employed" | "self_employed" | "retired"
	guarantor_name: string
	guarantor_phone: string
	guarantor_relationship: string
	guarantor_address?: string
	additional_info?: string
}

export interface LoanApplicationResponse {
	success: boolean
	message: string
	loan: LoanResource
	loan_details?: {
		amount: number
		interest_rate: number
		tenure_months: number
		monthly_payment: number
		total_amount: number
		interest_amount: number
		processing_fee?: number
	}
}

export interface LoanPaymentMethod {
	id: "wallet" | "card" | "bank_transfer"
	name: string
	description: string
	icon?: string
	is_enabled: boolean
	configuration?: Record<string, unknown> | null
}

export interface LoanRepaymentPayload {
	amount: number
	payment_method: "wallet" | "card" | "bank_transfer"
	notes?: string
	payer_name?: string
	payer_phone?: string
	transaction_reference?: string
	bank_account_id?: string
	payment_evidence?: string[]
}

export interface LoanRepaymentResponse {
	success: boolean
	message: string
	payment?: {
		id: string
		amount: number
		reference: string
		status: string
	}
	loan_details?: {
		loan_id: string
		total_amount: number
		total_repaid: number
		remaining_amount: number
	}
	payment_data?: Record<string, unknown> | null
}

type LoanListResponseRaw = {
	loans?: {
		data?: any[]
		meta?: {
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
		links?: Record<string, unknown>
	}
	pagination?: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

type LoanDetailsResponseRaw = {
	loan: any
}

const toNumber = (value: unknown): number => {
	if (value === null || value === undefined || value === "") {
		return 0
	}
	const numeric = Number(value)
	return Number.isFinite(numeric) ? numeric : 0
}

const deserializeProduct = (raw: any): LoanProduct => ({
	id: raw?.id ?? "",
	name: raw?.name ?? "",
	description: raw?.description ?? raw?.details ?? null,
	min_amount: toNumber(raw?.min_amount),
	max_amount: raw?.max_amount !== undefined ? toNumber(raw.max_amount) : null,
	interest_rate: toNumber(raw?.interest_rate),
	min_tenure_months: Number(raw?.min_tenure_months ?? 0),
	max_tenure_months: Number(raw?.max_tenure_months ?? 0),
	interest_type: raw?.interest_type ?? "simple",
	eligibility_criteria: raw?.eligibility_criteria ?? null,
	required_documents: raw?.required_documents ?? null,
	processing_fee_percentage:
		raw?.processing_fee_percentage !== undefined ? toNumber(raw.processing_fee_percentage) : null,
	late_payment_fee: raw?.late_payment_fee !== undefined ? toNumber(raw.late_payment_fee) : null,
	is_active: Boolean(raw?.is_active ?? true),
	created_at: raw?.created_at ?? undefined,
	updated_at: raw?.updated_at ?? undefined,
})

const deserializeRepayment = (raw: any): LoanRepayment => ({
	id: raw?.id ?? "",
	amount: toNumber(raw?.amount),
	due_date: raw?.due_date ?? null,
	status: raw?.status ?? null,
	paid_at: raw?.paid_at ?? null,
	payment_method: raw?.payment_method ?? null,
	reference: raw?.reference ?? null,
	created_at: raw?.created_at ?? null,
	updated_at: raw?.updated_at ?? null,
})

const deserializeLoan = (raw: any): LoanResource => ({
	id: raw?.id ?? "",
	member_id: raw?.member_id ?? "",
	product_id: raw?.product_id ?? null,
	amount: toNumber(raw?.amount),
	interest_rate: toNumber(raw?.interest_rate),
	duration_months: Number(raw?.duration_months ?? 0),
	type: raw?.type ?? "",
	purpose: raw?.purpose ?? null,
	status: raw?.status ?? "",
	application_date: raw?.application_date ?? null,
	approved_at: raw?.approved_at ?? null,
	approved_by: raw?.approved_by ?? null,
	rejection_reason: raw?.rejection_reason ?? null,
	rejected_at: raw?.rejected_at ?? null,
	rejected_by: raw?.rejected_by ?? null,
	total_amount: toNumber(raw?.total_amount ?? raw?.amount),
	monthly_payment: toNumber(raw?.monthly_payment ?? 0),
	interest_amount: raw?.interest_amount !== undefined ? toNumber(raw.interest_amount) : null,
	processing_fee: raw?.processing_fee !== undefined ? toNumber(raw.processing_fee) : null,
	required_documents: raw?.required_documents ?? null,
	application_metadata: raw?.application_metadata ?? null,
	member: raw?.member ?? null,
	product: raw?.product
		? {
				...raw.product,
				interest_rate: raw.product?.interest_rate !== undefined ? toNumber(raw.product.interest_rate) : null,
				min_amount: raw.product?.min_amount !== undefined ? toNumber(raw.product.min_amount) : null,
				max_amount: raw.product?.max_amount !== undefined ? toNumber(raw.product.max_amount) : null,
				min_tenure_months: raw.product?.min_tenure_months ?? null,
				max_tenure_months: raw.product?.max_tenure_months ?? null,
		  }
		: null,
	repayments: Array.isArray(raw?.repayments) ? raw.repayments.map(deserializeRepayment) : undefined,
	created_at: raw?.created_at ?? null,
	updated_at: raw?.updated_at ?? null,
})

export async function fetchLoanProducts(): Promise<LoanProduct[]> {
	const response = await apiFetch<{ products?: any[] }>("/loans/products", { method: "GET" })
	const items = response?.products ?? []
	return items.map(deserializeProduct)
}

export async function fetchMemberLoans(params?: {
	page?: number
	per_page?: number
	status?: string
	type?: string
}): Promise<LoanListResponse> {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))
	if (params?.status && params.status !== "all") query.set("status", params.status)
	if (params?.type) query.set("type", params.type)

	const path = `/loans/my-applications${query.toString() ? `?${query.toString()}` : ""}`
	const response = await apiFetch<LoanListResponseRaw>(path, { method: "GET" })

	const rawLoans = response?.loans ?? []
	return {
		loans: Array.isArray(rawLoans) ? rawLoans.map(deserializeLoan) : [],
		pagination: response?.pagination,
	}
}

export async function fetchLoanDetails(loanId: string): Promise<LoanResource> {
	const response = await apiFetch<{ loan: any }>(`/loans/${loanId}`, { method: "GET" })
	return deserializeLoan(response.loan)
}

export async function fetchLoanApplicationStatus(loanId: string): Promise<LoanResource> {
	const response = await apiFetch<{ loan: any }>(`/loans/application/${loanId}/status`, { method: "GET" })
	return deserializeLoan(response.loan)
}

export async function submitLoanApplication(payload: LoanApplicationPayload): Promise<LoanApplicationResponse> {
	const response = await apiFetch<LoanApplicationResponse>("/loans/apply", {
		method: "POST",
		body: payload,
	})

	if (response?.loan) {
		response.loan = deserializeLoan(response.loan)
	}

	return response
}

export async function repayLoan(loanId: string, payload: LoanRepaymentPayload): Promise<LoanRepaymentResponse> {
	const response = await apiFetch<LoanRepaymentResponse>(`/loans/${loanId}/repay`, {
		method: "POST",
		body: payload,
	})
	return response
}

export async function fetchLoanPaymentMethods(): Promise<LoanPaymentMethod[]> {
	const response = await apiFetch<{ payment_methods?: LoanPaymentMethod[] }>("/loans/payment-methods", {
		method: "GET",
	})

	return (response.payment_methods ?? []).map((method) => ({
		...method,
		configuration: method.configuration ?? null,
	}))
}

export async function fetchLoanRepaymentSchedule(loanId: string): Promise<LoanRepaymentScheduleResponse> {
	const response = await apiFetch<LoanRepaymentScheduleResponse>(`/loans/${loanId}/repayment-schedule`, {
		method: "GET",
	})

	response.loan.total_amount = toNumber(response.loan.total_amount)
	response.loan.monthly_payment = toNumber(response.loan.monthly_payment)

	response.repayment_summary.total_repaid = toNumber(response.repayment_summary.total_repaid)
	response.repayment_summary.remaining_amount = toNumber(response.repayment_summary.remaining_amount)

	response.schedule = response.schedule.map((entry) => ({
		...entry,
		amount: toNumber(entry.amount),
	}))

	return response
}

export async function fetchLoanRepaymentHistory(loanId: string, params?: {
	page?: number
	per_page?: number
}) {
	const query = new URLSearchParams()
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))

	const path = `/loans/${loanId}/repayment-history${query.toString() ? `?${query.toString()}` : ""}`
	const response = await apiFetch<{
		repayments: {
			data: any[]
			current_page: number
			last_page: number
			per_page: number
			total: number
		}
	}>(path, { method: "GET" })

	return {
		repayments: (response?.repayments?.data ?? []).map(deserializeRepayment),
		pagination: {
			current_page: response?.repayments?.current_page ?? 1,
			last_page: response?.repayments?.last_page ?? 1,
			per_page: response?.repayments?.per_page ?? 15,
			total: response?.repayments?.total ?? 0,
		},
	}
}

