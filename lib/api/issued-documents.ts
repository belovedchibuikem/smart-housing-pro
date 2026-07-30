import { apiFetch, apiFetchBlob } from "@/lib/api/client"

export type IssuedDocumentType =
	| "provisional_offer_letter"
	| "payment_completion_confirmation"
	| "memorandum_of_acceptance"
	| "allocation_letter"
	| "payment_receipt"
	| string

export interface IssuedDocumentRow {
	id: string
	document_type: IssuedDocumentType
	title: string
	subject?: string | null
	document_number: string
	reference_number?: string | null
	verification_number: string
	status: string
	version_number: number
	property_allocation_id?: string | null
	land_subscription_id?: string | null
	member_id?: string | null
	member_name?: string
	issued_by?: string | null
	issued_at?: string | null
	revoked_at?: string | null
	revocation_reason?: string | null
	has_pdf?: boolean
	verification_count?: number
	created_at?: string | null
	resolved_variables?: Record<string, string>
	member_signed_at?: string | null
	download_url?: string | null
	is_receipt?: boolean
	payment_amount?: string | null
	payment_category?: string | null
	payment_method?: string | null
	payment_date?: string | null
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
	provisional_offer_letter: "Provisional Offer Letter",
	payment_completion_confirmation: "Payment Completion Confirmation",
	memorandum_of_acceptance: "Memorandum of Acceptance",
	allocation_letter: "Allocation Letter",
	payment_receipt: "Payment Receipt",
}

export async function getIssuedDocumentsDashboard() {
	return apiFetch<{
		success: boolean
		stats: {
			total: number
			issued: number
			pending_approval: number
			signed_pending?: number
			revoked: number
			by_type: Record<string, number>
		}
		pending_queue?: IssuedDocumentRow[]
		signed_queue?: IssuedDocumentRow[]
		recent: IssuedDocumentRow[]
		verification_analytics?: {
			total_scans: number
			success_scans: number
			failed_scans: number
			by_device?: Record<string, number>
			by_status?: Record<string, number>
		}
		document_types: string[]
	}>("/admin/issued-documents/dashboard")
}

export async function listAllocationIssuedDocuments(allocationId: string) {
	return apiFetch<{
		success: boolean
		data: IssuedDocumentRow[]
		meta?: { total: number }
	}>(`/admin/property-subscriptions/${allocationId}/issued-documents`)
}

export async function previewAllocationDocument(
	allocationId: string,
	body: { document_type: string; overrides?: Record<string, unknown> },
) {
	return apiFetch<{ success: boolean; preview: { preview_html: string; subject: string; body_html: string } }>(
		`/admin/property-subscriptions/${allocationId}/issued-documents/preview`,
		{ method: "POST", body },
	)
}

export async function issueAllocationDocument(
	allocationId: string,
	body: { document_type: string; overrides?: Record<string, unknown>; require_approval?: boolean },
) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/property-subscriptions/${allocationId}/issued-documents`,
		{ method: "POST", body },
	)
}

export async function listLandSubscriptionIssuedDocuments(subscriptionId: string) {
	return apiFetch<{
		success: boolean
		data: IssuedDocumentRow[]
		meta?: { total: number }
	}>(`/admin/land-subscriptions/${subscriptionId}/issued-documents`)
}

export async function previewLandSubscriptionDocument(
	subscriptionId: string,
	body: { document_type: string; overrides?: Record<string, unknown> },
) {
	return apiFetch<{ success: boolean; preview: { preview_html: string; subject: string; body_html: string } }>(
		`/admin/land-subscriptions/${subscriptionId}/issued-documents/preview`,
		{ method: "POST", body },
	)
}

export async function issueLandSubscriptionDocument(
	subscriptionId: string,
	body: { document_type: string; overrides?: Record<string, unknown>; require_approval?: boolean },
) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/land-subscriptions/${subscriptionId}/issued-documents`,
		{ method: "POST", body },
	)
}

export async function approveIssuedDocument(id: string) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/issued-documents/${id}/approve`,
		{ method: "POST" },
	)
}

export async function rejectIssuedDocument(id: string, reason: string) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/issued-documents/${id}/reject`,
		{ method: "POST", body: { reason } },
	)
}

export async function approveIssuedDocumentSignature(id: string) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/issued-documents/${id}/approve-signature`,
		{ method: "POST" },
	)
}

export async function searchIssuedDocuments(params: {
	q?: string
	status?: string
	document_type?: string
	property_allocation_id?: string
	land_subscription_id?: string
}) {
	const query = new URLSearchParams()
	Object.entries(params).forEach(([key, value]) => {
		if (value) query.set(key, value)
	})
	return apiFetch<{ success: boolean; data: IssuedDocumentRow[] }>(
		`/admin/issued-documents?${query.toString()}`,
	)
}

export async function getPropertyDocumentLedger(params: {
	property_allocation_id?: string
	land_subscription_id?: string
}) {
	const query = new URLSearchParams()
	Object.entries(params).forEach(([key, value]) => {
		if (value) query.set(key, value)
	})
	return apiFetch<{
		success: boolean
		ledger: {
			total_price: number
			amount_paid: number
			balance: number
			receipt_count: number
			last_payment_date?: string | null
			receipts: IssuedDocumentRow[]
		}
	}>(`/admin/issued-documents/ledger?${query.toString()}`)
}

export async function revokeIssuedDocument(id: string, reason: string, notes?: string) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/issued-documents/${id}/revoke`,
		{ method: "POST", body: { reason, notes } },
	)
}

export async function reissueIssuedDocument(id: string, overrides?: Record<string, unknown>) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/admin/issued-documents/${id}/reissue`,
		{ method: "POST", body: { overrides } },
	)
}

export async function downloadAdminIssuedDocument(id: string) {
	return apiFetchBlob(`/admin/issued-documents/${id}/download`)
}

export async function downloadAndSaveAdminIssuedDocument(id: string, filename: string) {
	const blob = await downloadAdminIssuedDocument(id)
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement("a")
	anchor.href = url
	anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
	document.body.appendChild(anchor)
	anchor.click()
	anchor.remove()
	URL.revokeObjectURL(url)
}

export async function getDocumentLetterhead() {
	return apiFetch<{ success: boolean; letterhead: Record<string, unknown> }>("/admin/document-letterhead")
}

export async function updateDocumentLetterhead(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; message: string; letterhead: Record<string, unknown> }>(
		"/admin/document-letterhead",
		{ method: "PUT", body },
	)
}

export async function uploadDocumentLetterheadAsset(field: "secondary_logo" | "official_seal" | "official_stamp", file: File) {
	const form = new FormData()
	form.append("field", field)
	form.append("file", file)
	return apiFetch<{ success: boolean; letterhead: Record<string, unknown> }>("/admin/document-letterhead/upload", {
		method: "POST",
		body: form,
		headers: {},
	})
}

export async function listDocumentTemplates() {
	return apiFetch<{
		success: boolean
		templates: Array<{
			id: string
			document_type: string
			name: string
			subject: string | null
			body_html: string | null
			version: number
			is_active: boolean
			is_system: boolean
		}>
	}>("/admin/document-templates")
}

export async function listDocumentTemplateVariables() {
	return apiFetch<{ success: boolean; variables: string[] }>("/admin/document-templates/variables")
}

export async function createDocumentTemplate(body: {
	document_type: string
	name: string
	subject?: string
	body_html?: string
}) {
	return apiFetch<{ success: boolean; template: Record<string, unknown> }>("/admin/document-templates", {
		method: "POST",
		body,
	})
}

export async function updateDocumentTemplate(
	id: string,
	body: { name?: string; subject?: string; body_html?: string; is_active?: boolean },
) {
	return apiFetch<{ success: boolean; template: Record<string, unknown> }>(`/admin/document-templates/${id}`, {
		method: "PUT",
		body,
	})
}

export async function adminVerifyDocument(query: string) {
	return apiFetch<{
		success: boolean
		status: string
		public: Record<string, unknown> | null
		document: IssuedDocumentRow | null
	}>("/admin/issued-documents/verify", { method: "POST", body: { query } })
}

export async function resetDocumentTemplate(id: string) {
	return apiFetch<{ success: boolean; template: Record<string, unknown> }>(
		`/admin/document-templates/${id}/reset`,
		{ method: "POST" },
	)
}

export async function listMemberHouseIssuedDocuments(allocationId: string) {
	return apiFetch<{ success: boolean; documents: IssuedDocumentRow[] }>(
		`/my-house-accounts/${allocationId}/issued-documents`,
	)
}

export async function listMemberLandIssuedDocuments(subscriptionId: string) {
	return apiFetch<{ success: boolean; documents: IssuedDocumentRow[] }>(
		`/my-lands/${subscriptionId}/issued-documents`,
	)
}

export async function downloadMemberIssuedDocument(id: string) {
	return apiFetchBlob(`/member/issued-documents/${id}/download`)
}

export async function uploadMemberSignedDocument(id: string, file: File) {
	const form = new FormData()
	form.append("signed_file", file)
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/member/issued-documents/${id}/upload-signed`,
		{ method: "POST", body: form, headers: {} },
	)
}

export async function eSignMemberDocument(id: string, signatureData: string) {
	return apiFetch<{ success: boolean; message: string; document: IssuedDocumentRow }>(
		`/member/issued-documents/${id}/e-sign`,
		{ method: "POST", body: { signature_data: signatureData } },
	)
}

export async function verifyDocumentPublic(query: string) {
	return apiFetch<{
		success: boolean
		status: string
		document: Record<string, unknown> | null
		branding?: Record<string, unknown>
	}>("/verify-document", {
		method: "POST",
		body: { query },
	})
}

export async function getVerifyDocumentBranding() {
	return apiFetch<{ success: boolean; branding: Record<string, unknown> }>("/verify-document/branding")
}

export async function verifyDocumentByToken(token: string) {
	return apiFetch<{
		success: boolean
		status: string
		document: Record<string, unknown> | null
		branding?: Record<string, unknown>
	}>(`/verify-document/${encodeURIComponent(token)}`)
}

export type BulkIssueCandidate = {
	row_key: string
	asset_type: "house" | "land"
	allocation_id: string | null
	subscription_id: string | null
	member_id: string
	member_number?: string | null
	member_name: string
	asset_label: string
	status?: string | null
}

export type BulkIssuePreviewRow = BulkIssueCandidate & {
	status: "will_issue" | "skip_already_issued" | "invalid" | string
	skip_reason?: string | null
	result?: "success" | "failed" | "skipped"
	message?: string
	issued_document_id?: string
	document_number?: string
	document_status?: string
}

export type BulkIssuePagination = {
	page: number
	per_page: number
	total: number
	last_page: number
	from?: number
	to?: number
}

export async function listBulkIssueCandidates(params: {
	search?: string
	asset_type?: string
	property_id?: string
	land_id?: string
	status?: string
	missing_document_type?: string
	page?: number
	per_page?: number
	keys_only?: boolean
}) {
	const qs = new URLSearchParams()
	if (params.search?.trim()) qs.set("search", params.search.trim())
	if (params.asset_type && params.asset_type !== "all") qs.set("asset_type", params.asset_type)
	if (params.property_id?.trim()) qs.set("property_id", params.property_id.trim())
	if (params.land_id?.trim()) qs.set("land_id", params.land_id.trim())
	if (params.status && params.status !== "all") qs.set("status", params.status)
	if (params.missing_document_type?.trim()) qs.set("missing_document_type", params.missing_document_type.trim())
	qs.set("page", String(params.page ?? 1))
	qs.set("per_page", String(params.per_page ?? 50))
	if (params.keys_only) qs.set("keys_only", "1")

	return apiFetch<{
		success: boolean
		data: {
			candidates: BulkIssueCandidate[]
			pagination: BulkIssuePagination
			meta?: {
				scanned_houses?: number
				scanned_lands?: number
				missing_document_type?: string | null
			}
		}
	}>(`/admin/bulk/issued-documents/candidates?${qs.toString()}`)
}

export async function previewBulkIssueDocuments(body: { keys: string[]; document_type: string }) {
	return apiFetch<{
		success: boolean
		data: {
			rows: BulkIssuePreviewRow[]
			will_issue_count: number
			skipped_count: number
			invalid_count: number
			document_type: string
		}
	}>("/admin/bulk/issued-documents/preview", {
		method: "POST",
		body,
	})
}

export async function executeBulkIssueDocuments(body: {
	keys: string[]
	document_type: string
	require_approval?: boolean
	notify_members?: boolean
}) {
	return apiFetch<{
		success: boolean
		message: string
		data: {
			issued: number
			skipped: number
			failed: number
			results: BulkIssuePreviewRow[]
			document_type: string
		}
	}>("/admin/bulk/issued-documents/execute", {
		method: "POST",
		body,
	})
}
