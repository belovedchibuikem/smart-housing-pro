import { apiFetch, apiFetchBlob } from "@/lib/api/client"

export interface ValuationRow {
	id: string
	property_id?: string | null
	land_id?: string | null
	asset_type?: string
	current_value?: number
	estimated_value?: number
	purchase_price?: number | null
	gain_loss?: number | null
	appreciation_percent?: number | null
	confidence_score?: number | null
	market_confidence?: number | null
	valuation_method?: string
	market_index?: number | null
	predicted_growth?: number | null
	ai_recommendation?: string | null
	status?: string
	valuation_date?: string | null
	predictions?: {
		six_month?: number | null
		one_year?: number | null
		three_year?: number | null
		five_year?: number | null
	}
	comparable_properties?: Array<Record<string, unknown>>
}

export async function searchValuations(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{
		success: boolean
		data: ValuationRow[]
		meta: { current_page: number; last_page: number; per_page: number; total: number }
	}>(`/admin/valuations?${qs.toString()}`)
}

export async function getLatestPropertyValuation(propertyId: string) {
	return apiFetch<{ success: boolean; valuation: ValuationRow; history: ValuationRow[] }>(
		`/admin/valuations/properties/${propertyId}/latest`,
	)
}

export async function runPropertyValuation(propertyId: string, body?: { purchase_price?: number }) {
	return apiFetch<{ success: boolean; message: string; valuation: ValuationRow }>(
		`/admin/valuations/properties/${propertyId}/run`,
		{ method: "POST", body: JSON.stringify(body || {}) },
	)
}

export async function runLandValuation(landId: string, body?: { purchase_price?: number }) {
	return apiFetch<{ success: boolean; message: string; valuation: ValuationRow }>(
		`/admin/valuations/lands/${landId}/run`,
		{ method: "POST", body: JSON.stringify(body || {}) },
	)
}

export async function getValuationSettings() {
	return apiFetch<{ success: boolean; settings: Record<string, unknown>; weights: Record<string, number> }>(
		"/admin/valuations/settings",
	)
}

export async function updateValuationSettings(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; settings: Record<string, unknown>; weights: Record<string, number> }>(
		"/admin/valuations/settings",
		{ method: "PUT", body: JSON.stringify(body) },
	)
}

export async function requestValuationOverride(
	valuationId: string,
	body: { new_value: number; reason: string },
) {
	return apiFetch<{ success: boolean; override: Record<string, unknown> }>(
		`/admin/valuations/${valuationId}/override`,
		{ method: "POST", body: JSON.stringify(body) },
	)
}

export async function downloadValuationReport(valuationId: string) {
	return apiFetchBlob(`/admin/valuations/${valuationId}/report`)
}

export async function publicValueProperty(propertyId: string, body?: { purchase_price?: number }) {
	return apiFetch<{ success: boolean; valuation: ValuationRow; can_save?: boolean }>(
		`/public/properties/${propertyId}/value`,
		{ method: "POST", body: JSON.stringify(body || {}) },
	)
}

export async function publicValueLand(landId: string, body?: { purchase_price?: number }) {
	return apiFetch<{ success: boolean; valuation: ValuationRow; can_save?: boolean }>(
		`/public/lands/${landId}/value`,
		{ method: "POST", body: JSON.stringify(body || {}) },
	)
}

export async function publicShowPropertyValuation(propertyId: string) {
	return apiFetch<{ success: boolean; valuation: ValuationRow | null; property: Record<string, unknown> }>(
		`/public/properties/${propertyId}/valuation`,
	)
}
