import { apiFetch } from "@/lib/api/client"

export type OwnershipType = "SOLE" | "JOINT"

export interface JointOwner {
	id: string
	member_id: string
	user_id?: string | null
	name?: string | null
	email?: string | null
	ownership_percentage: number
	ownership_role: "PRIMARY" | "CO_OWNER" | string
	status: string
	verified_at?: string | null
}

export interface JointOwnershipDashboard {
	ownership_type: OwnershipType | string
	property?: { id: string; title?: string }
	land?: { id: string; title?: string }
	slot?: { id: string; label?: string; slot_number?: number } | null
	primary_owner?: JointOwner | null
	co_owners: JointOwner[]
	owners: JointOwner[]
	verification_status: string
	pending_requests: ChangeRequest[]
	ownership_history: OwnershipAuditRow[]
}

export interface ChangeRequestApproval {
	id: string
	member_id: string
	decision: string
	comment?: string | null
	auth_method?: string | null
	decided_at?: string | null
	member?: { user?: { name?: string; email?: string } }
}

export interface ChangeRequest {
	id: string
	request_number: string
	asset_type: string
	property_id?: string | null
	land_id?: string | null
	action_type: string
	old_values?: Record<string, unknown> | null
	new_values?: Record<string, unknown> | null
	status: string
	notes?: string | null
	expires_at?: string | null
	executed_at?: string | null
	created_at?: string
	approvals?: ChangeRequestApproval[]
	property?: { id: string; title?: string }
	land?: { id: string; land_title?: string }
	requested_by_member?: { user?: { name?: string } }
}

export interface OwnershipAuditRow {
	id: string
	reference_number: string
	action: string
	previous_value?: Record<string, unknown> | null
	new_value?: Record<string, unknown> | null
	created_at?: string
	ip_address?: string | null
	device?: string | null
}

export async function getAdminJointPropertyOwnership(propertyId: string, slotId?: string) {
	const qs = slotId ? `?slot_id=${encodeURIComponent(slotId)}` : ""
	return apiFetch<{ success: boolean; data: JointOwnershipDashboard }>(
		`/admin/properties/${propertyId}/joint-ownership${qs}`,
	)
}

export async function getAdminJointLandOwnership(landId: string, slotId?: string) {
	const qs = slotId ? `?slot_id=${encodeURIComponent(slotId)}` : ""
	return apiFetch<{ success: boolean; data: JointOwnershipDashboard }>(
		`/admin/lands/${landId}/joint-ownership${qs}`,
	)
}

export async function syncAdminPropertyOwners(
	propertyId: string,
	body: {
		property_slot_id?: string
		property_allocation_id?: string
		owners: Array<{ member_id: string; ownership_percentage: number; ownership_role?: string }>
		force?: boolean
	},
) {
	return apiFetch<{ success: boolean; data: JointOwner[] }>(`/admin/properties/${propertyId}/owners`, {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function listAdminChangeRequests(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{ success: boolean; data: { data: ChangeRequest[]; current_page: number; last_page: number; total: number } }>(
		`/admin/change-requests?${qs.toString()}`,
	)
}

export async function getAdminChangeRequest(id: string) {
	return apiFetch<{ success: boolean; data: ChangeRequest; timeline: Array<Record<string, unknown>> }>(
		`/admin/change-requests/${id}`,
	)
}

export async function createAdminChangeRequest(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: ChangeRequest }>(`/admin/change-requests`, {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function cancelAdminChangeRequest(id: string, reason?: string) {
	return apiFetch<{ success: boolean; data: ChangeRequest }>(`/admin/change-requests/${id}/cancel`, {
		method: "POST",
		body: JSON.stringify({ reason }),
	})
}

export async function backfillOwnershipPrimaries() {
	return apiFetch<{
		success: boolean
		message: string
		data: { property_owners: number; land_owners: number }
	}>(`/admin/ownership/backfill-primaries`, {
		method: "POST",
		body: "{}",
	})
}

export async function getOwnershipSettings() {
	return apiFetch<{ success: boolean; data: Record<string, unknown>; definitions: Record<string, unknown> }>(
		`/admin/ownership/settings`,
	)
}

export async function updateOwnershipSettings(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: Record<string, unknown> }>(`/admin/ownership/settings`, {
		method: "PUT",
		body: JSON.stringify(body),
	})
}

export async function getMemberOwnershipAssets() {
	return apiFetch<{ success: boolean; data: { properties: unknown[]; lands: unknown[] } }>(
		`/member/ownership/assets`,
	)
}

export async function getMemberPendingApprovals() {
	return apiFetch<{ success: boolean; data: ChangeRequestApproval[] }>(`/member/ownership/pending-approvals`)
}

export async function getMemberChangeRequests(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{ success: boolean; data: { data: ChangeRequest[] } }>(
		`/member/ownership/change-requests?${qs.toString()}`,
	)
}

export async function createMemberChangeRequest(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; data: ChangeRequest }>(`/member/ownership/change-requests`, {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function decideMemberChangeRequest(
	id: string,
	body: { decision: string; comment?: string; auth_method?: string; otp?: string; pin?: string },
) {
	return apiFetch<{ success: boolean; data: ChangeRequest }>(`/member/ownership/change-requests/${id}/decide`, {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function getMemberPropertyOwnership(propertyId: string, slotId?: string) {
	const qs = slotId ? `?slot_id=${encodeURIComponent(slotId)}` : ""
	return apiFetch<{ success: boolean; data: JointOwnershipDashboard }>(
		`/member/ownership/properties/${propertyId}${qs}`,
	)
}
