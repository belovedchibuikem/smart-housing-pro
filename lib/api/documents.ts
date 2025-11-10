import { apiFetch } from "./client"

export interface DocumentItem {
	id: string
	type: string
	title: string
	description?: string | null
	file_size: number
	file_size_human?: string
	mime_type?: string
	status: string
	approved_at?: string | null
	rejection_reason?: string | null
	created_at: string
	updated_at: string
}

export interface DocumentListResponse {
	documents: DocumentItem[]
	pagination?: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

type RawDocumentListResponse = {
	documents:
		| DocumentListResponse["documents"]
		| {
				data: DocumentListResponse["documents"]
		  }
	pagination?: DocumentListResponse["pagination"]
}

export async function fetchMemberDocuments(params?: {
	type?: string
	status?: string
	page?: number
	per_page?: number
}): Promise<DocumentListResponse> {
	const query = new URLSearchParams()
	if (params?.type) query.set("type", params.type)
	if (params?.status) query.set("status", params.status)
	if (params?.page) query.set("page", String(params.page))
	if (params?.per_page) query.set("per_page", String(params.per_page))

	const response = await apiFetch<RawDocumentListResponse>(`/documents${query.toString() ? `?${query.toString()}` : ""}`)
	const rawDocuments = Array.isArray(response.documents)
		? response.documents
		: "data" in response.documents
		? response.documents.data
		: []

	return {
		documents: rawDocuments,
		pagination: response.pagination,
	}
}

export async function downloadDocument(documentId: string) {
	return apiFetch<{
		download_url: string
		filename?: string
		mime_type?: string
	}>(`/documents/${documentId}/download`, { method: "GET" })
}

