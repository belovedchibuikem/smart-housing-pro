import { apiFetch, apiFetchBlob } from "@/lib/api/client"

export interface PaymentReceiptRow {
	id: string
	document_type: string
	title: string
	document_number: string
	reference_number?: string | null
	verification_number: string
	status: string
	version_number: number
	member_id?: string | null
	member_name?: string
	property_allocation_id?: string | null
	land_subscription_id?: string | null
	property_id?: string | null
	payment_amount?: string | null
	payment_category?: string | null
	payment_method?: string | null
	payment_reference?: string | null
	estate_name?: string | null
	plot_number?: string | null
	issued_at?: string | null
	issued_by?: string | null
	has_pdf?: boolean
	verification_count?: number
	content_hash_prefix?: string | null
	download_url?: string | null
	resolved_variables?: Record<string, string>
}

export interface PaymentReceiptSettings {
	receipt_prefix: string
	receipt_number_format: string
	receipt_serial_padding: number
	receipt_enable_public_verification: boolean
	receipt_watermark_opacity: number
	receipt_theme_color: string
	receipt_footer_text: string
	receipt_auto_notify_admin: boolean
	tenant_name?: string
}

export async function getPaymentReceiptsDashboard() {
	return apiFetch<{
		success: boolean
		stats: {
			total: number
			today: number
			this_month: number
			this_year: number
			active: number
			revoked: number
		}
		recent: PaymentReceiptRow[]
	}>("/admin/payment-receipts/dashboard")
}

export async function getPaymentReceiptSettings() {
	return apiFetch<{
		success: boolean
		settings: PaymentReceiptSettings
		categories: string[]
	}>("/admin/payment-receipts/settings")
}

export async function updatePaymentReceiptSettings(body: Partial<PaymentReceiptSettings>) {
	return apiFetch<{ success: boolean; settings: PaymentReceiptSettings }>("/admin/payment-receipts/settings", {
		method: "PUT",
		body: JSON.stringify(body),
	})
}

export async function searchPaymentReceipts(params: Record<string, string | number | undefined>) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{
		success: boolean
		data: PaymentReceiptRow[]
		meta: { current_page: number; last_page: number; per_page: number; total: number }
	}>(`/admin/payment-receipts?${qs.toString()}`)
}

export async function verifyPaymentReceipt(query: string) {
	return apiFetch<{
		success: boolean
		status: string
		document: Record<string, unknown> | null
	}>("/admin/payment-receipts/verify", {
		method: "POST",
		body: JSON.stringify({ query }),
	})
}

export async function downloadPaymentReceipt(id: string) {
	return apiFetchBlob(`/admin/payment-receipts/${id}/download`)
}

export async function voidPaymentReceipt(id: string, reason: string, notes?: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/payment-receipts/${id}/void`, {
		method: "POST",
		body: JSON.stringify({ reason, notes }),
	})
}

export async function reissuePaymentReceipt(id: string) {
	return apiFetch<{ success: boolean; receipt: PaymentReceiptRow }>(`/admin/payment-receipts/${id}/reissue`, {
		method: "POST",
	})
}

export async function bulkReissuePaymentReceipts(limit = 10, offset = 0) {
	return apiFetch<{
		success: boolean
		message: string
		data: {
			reissued: number
			regenerated?: number
			failed: number
			has_more: boolean
			next_offset?: number
			total?: number
			processed_through?: number
			failures: Array<{ id: string; message: string }>
		}
	}>("/admin/payment-receipts/bulk-reissue", {
		method: "POST",
		body: { confirm: true, limit, offset },
	})
}

export async function resendPaymentReceipt(id: string) {
	return apiFetch<{ success: boolean; message: string }>(`/admin/payment-receipts/${id}/resend`, {
		method: "POST",
	})
}

export async function exportPaymentReceipts(format: "csv" | "json" = "csv", filters?: Record<string, string>) {
	const qs = new URLSearchParams({ format })
	if (filters) {
		for (const [k, v] of Object.entries(filters)) {
			if (v) qs.set(k, v)
		}
	}
	return apiFetchBlob(`/admin/payment-receipts/export?${qs.toString()}`)
}

export async function listPropertyPaymentReceipts(allocationId: string) {
	return apiFetch<{ success: boolean; data: PaymentReceiptRow[] }>(
		`/admin/payment-receipts/property/${allocationId}`,
	)
}

export async function listLandPaymentReceipts(subscriptionId: string) {
	return apiFetch<{ success: boolean; data: PaymentReceiptRow[] }>(
		`/admin/payment-receipts/land/${subscriptionId}`,
	)
}
