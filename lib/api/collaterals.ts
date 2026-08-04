import { apiFetch } from "@/lib/api/client"

export interface CollateralRow {
	id: string
	name: string
	collateral_type: string
	description?: string | null
	estimated_value?: number | null
	market_value?: number | null
	currency?: string
	verification_status: string
	verification_notes?: string | null
	expires_at?: string | null
	owner_member_id?: string | null
	photos?: string[]
	insurance?: {
		policy_number?: string | null
		provider?: string | null
		coverage?: number | null
	}
	created_at?: string | null
}

export interface CollateralContractRow {
	id: string
	investment_id: string
	collateral_id: string
	status: string
	principal_amount?: number
	interest_rate?: number | null
	duration_months?: number | null
	collateral_decision?: string | null
	remaining_roi?: number | null
	default_risk?: string
	collateral?: CollateralRow | null
}

export async function searchCollaterals(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{
		success: boolean
		data: CollateralRow[]
		meta: { current_page: number; last_page: number; per_page: number; total: number }
	}>(`/admin/collaterals?${qs.toString()}`)
}

export async function createCollateral(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; collateral: CollateralRow }>("/admin/collaterals", {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function verifyCollateral(id: string, body: { status: string; notes?: string }) {
	return apiFetch<{ success: boolean; collateral: CollateralRow }>(`/admin/collaterals/${id}/verify`, {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function attachCollateral(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; contract: CollateralContractRow }>("/admin/collaterals/attach", {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function listCollateralContracts(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{
		success: boolean
		data: CollateralContractRow[]
		meta: { current_page: number; last_page: number; per_page: number; total: number }
	}>(`/admin/collaterals/contracts?${qs.toString()}`)
}

export async function acceptCollateralContract(contractId: string) {
	return apiFetch<{ success: boolean; contract: CollateralContractRow }>(
		`/admin/collaterals/contracts/${contractId}/accept`,
		{ method: "POST", body: JSON.stringify({}) },
	)
}

export async function resolveCollateralDefault(
	contractId: string,
	body: { decision: "recover_capital" | "acquire_collateral"; evidence?: Record<string, unknown> },
) {
	return apiFetch<{ success: boolean; contract: CollateralContractRow }>(
		`/admin/collaterals/contracts/${contractId}/resolve-default`,
		{ method: "POST", body: JSON.stringify(body) },
	)
}
