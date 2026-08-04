import { apiFetch } from "@/lib/api/client"

export async function listPropertyImprovements(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{ success: boolean; data: { data: Array<Record<string, unknown>> }; types: string[] }>(
		`/admin/property-improvements?${qs.toString()}`,
	)
}

export async function createPropertyImprovement(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: Record<string, unknown> }>(`/admin/property-improvements`, {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function approvePropertyImprovement(id: string) {
	return apiFetch<{ success: boolean; data: Record<string, unknown> }>(
		`/admin/property-improvements/${id}/approve`,
		{ method: "POST", body: "{}" },
	)
}

export async function rejectPropertyImprovement(id: string, reason: string) {
	return apiFetch<{ success: boolean; data: Record<string, unknown> }>(
		`/admin/property-improvements/${id}/reject`,
		{ method: "POST", body: JSON.stringify({ reason }) },
	)
}
