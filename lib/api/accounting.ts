import { apiFetch, apiFetchBlob, getAuthToken, getTenantSlug } from "@/lib/api/client"
import { getApiBaseUrl } from "@/lib/api/config"

type Query = Record<string, string | number | boolean | undefined | null>

function toQuery(params?: Query): string {
	if (!params) return ""
	const q = new URLSearchParams()
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
	})
	const s = q.toString()
	return s ? `?${s}` : ""
}

async function postBlob(path: string, body: Record<string, unknown>): Promise<Blob> {
	const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/octet-stream",
	}
	const token = getAuthToken()
	if (token) headers.Authorization = `Bearer ${token}`
	if (typeof window !== "undefined") {
		headers["X-Forwarded-Host"] = window.location.host
		const slug = getTenantSlug()
		if (slug) headers["X-Tenant-Slug"] = slug
	}
	const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) })
	if (!response.ok) {
		const err = await response.json().catch(() => ({ message: "Export failed" }))
		throw new Error(err.message || "Export failed")
	}
	return response.blob()
}

export async function bootstrapAccounting() {
	return apiFetch<{ success: boolean; message?: string; data: Record<string, unknown> }>(
		"/admin/accounting/bootstrap",
		{ method: "POST" }
	)
}

export async function getAccountingDashboard(params?: { from?: string; to?: string }) {
	return apiFetch<{ success: boolean; data: Record<string, any> }>(
		`/admin/accounting/dashboard${toQuery(params)}`
	)
}

export async function getChartOfAccounts(params?: { type?: string; active_only?: boolean }) {
	return apiFetch<{ success: boolean; data: any[] }>(
		`/admin/accounting/accounts${toQuery(params as Query)}`
	)
}

export async function createChartAccount(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: any }>("/admin/accounting/accounts", {
		method: "POST",
		body,
	})
}

export async function updateChartAccount(id: string, body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/accounts/${id}`, {
		method: "PUT",
		body,
	})
}

export async function getPostingRules() {
	return apiFetch<{ success: boolean; data: any[] }>("/admin/accounting/posting-rules")
}

export async function updatePostingRule(id: string, body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/posting-rules/${id}`, {
		method: "PUT",
		body,
	})
}

export async function getFinancialYears() {
	return apiFetch<{ success: boolean; data: any[] }>("/admin/accounting/financial-years")
}

export async function ensureFinancialYear(date?: string) {
	return apiFetch<{ success: boolean; data: any }>("/admin/accounting/financial-years/ensure", {
		method: "POST",
		body: date ? { date } : {},
	})
}

export async function closeAccountingPeriod(id: string, lock = true) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/periods/${id}/close`, {
		method: "POST",
		body: { lock },
	})
}

export async function reopenAccountingPeriod(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/periods/${id}/reopen`, {
		method: "POST",
	})
}

export async function closeFinancialYear(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/financial-years/${id}/close`, {
		method: "POST",
	})
}

export async function getJournalEntries(params?: Query) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/journals${toQuery(params)}`
	)
}

export async function getJournalEntry(id: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/journals/${id}`)
}

export async function postManualJournal(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: any }>("/admin/accounting/journals", {
		method: "POST",
		body,
	})
}

export async function reverseJournal(id: string, reason?: string) {
	return apiFetch<{ success: boolean; data: any }>(`/admin/accounting/journals/${id}/reverse`, {
		method: "POST",
		body: { reason },
	})
}

export async function getTrialBalance(params?: { as_of?: string; period_id?: string }) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/reports/trial-balance${toQuery(params)}`
	)
}

export async function getIncomeExpenditure(params?: { from?: string; to?: string }) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/reports/income-expenditure${toQuery(params)}`
	)
}

export async function getBalanceSheet(params?: { as_of?: string }) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/reports/balance-sheet${toQuery(params)}`
	)
}

export async function getCashFlowReport(params?: { from?: string; to?: string }) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/reports/cash-flow${toQuery(params)}`
	)
}

export async function getAgingReport(params: { bucket: string; as_of?: string }) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/reports/aging${toQuery(params)}`
	)
}

export async function generateMemberStatement(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: any }>("/admin/accounting/statements", {
		method: "POST",
		body,
	})
}

export async function downloadMemberStatementPdf(id: string) {
	return apiFetchBlob(`/admin/accounting/statements/${id}/download`)
}

export async function exportMemberStatementCsv(body: Record<string, unknown>) {
	return postBlob("/admin/accounting/statements/export", body)
}

export async function getMemberAccountingLedger(memberId: string, params?: Query) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/members/${memberId}/ledger${toQuery(params)}`
	)
}

export async function getPropertyFinancialLedger(params: Query) {
	return apiFetch<{ success: boolean; data: any }>(
		`/admin/accounting/property-ledger${toQuery(params)}`
	)
}

/** Member portal */
export async function getMemberFinancialSummary() {
	return apiFetch<{ success: boolean; data: Record<string, number> }>(
		"/member/financial/summary"
	)
}

export async function getMemberFinancialLedger(params?: Query) {
	return apiFetch<{ success: boolean; data: any }>(
		`/member/financial/ledger${toQuery(params)}`
	)
}

export async function getMemberPropertyFinancialLedger(params: Query) {
	return apiFetch<{ success: boolean; data: any }>(
		`/member/financial/property-ledger${toQuery(params)}`
	)
}

export async function getMemberStatements(params?: Query) {
	return apiFetch<{ success: boolean; data: any }>(
		`/member/financial/statements${toQuery(params)}`
	)
}

export async function generateOwnStatement(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: any }>("/member/financial/statements", {
		method: "POST",
		body,
	})
}

export async function downloadOwnStatementPdf(id: string) {
	return apiFetchBlob(`/member/financial/statements/${id}/download`)
}
