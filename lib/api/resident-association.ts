import { apiFetch } from "@/lib/api/client"

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

export type RaPagination = {
	current_page: number
	last_page: number
	per_page: number
	total: number
}

export type RaListResponse<T> = {
	success: boolean
	message?: string
	data: T
	pagination?: RaPagination
}

export type RaItemResponse<T> = {
	success: boolean
	message?: string
	data: T
	error?: string
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function listRaAssociations(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/associations${toQuery(params)}`)
}

export async function getRaAssociation(id: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/associations/${id}`)
}

export async function createRaAssociation(body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>("/admin/resident-association/associations", {
		method: "POST",
		body,
	})
}

export async function updateRaAssociation(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/associations/${id}`, {
		method: "PUT",
		body,
	})
}

export async function assignRaAssociationEstates(id: string, estate_ids: string[]) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/associations/${id}/estates`, {
		method: "POST",
		body: { estate_ids },
	})
}

export async function assignRaAssociationUsers(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/associations/${id}/users`, {
		method: "POST",
		body,
	})
}

export async function registerRaExecutive(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any> & { executive?: any }>(
		`/admin/resident-association/associations/${id}/executives`,
		{
			method: "POST",
			body,
		},
	)
}

export async function removeRaExecutive(id: string, userId: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/associations/${id}/executives/${userId}`, {
		method: "DELETE",
	})
}

export async function listRaEstates(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/estates${toQuery(params)}`)
}

export async function getRaEstate(id: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/estates/${id}`)
}

export async function createRaEstate(body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>("/admin/resident-association/estates", {
		method: "POST",
		body,
	})
}

export async function updateRaEstate(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/estates/${id}`, {
		method: "PUT",
		body,
	})
}

export async function getRaEstateDashboard(
	estateId: string,
	params?: { from?: string; to?: string; year?: string | number }
) {
	return apiFetch<RaItemResponse<any>>(
		`/admin/resident-association/estates/${estateId}/dashboard${toQuery(params)}`
	)
}

export async function listRaHouses(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/houses${toQuery(params)}`)
}

export async function listRaHouseLots(propertyId: string) {
	return apiFetch<RaItemResponse<any[]>>(`/admin/resident-association/houses/${propertyId}/lots`)
}

export async function createRaHouseLot(propertyId: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/houses/${propertyId}/lots`, {
		method: "POST",
		body,
	})
}

export async function listRaHouseOccupants(propertyId: string) {
	return apiFetch<RaItemResponse<any[]>>(`/admin/resident-association/houses/${propertyId}/occupants`)
}

export async function createRaHouseOccupant(propertyId: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/houses/${propertyId}/occupants`, {
		method: "POST",
		body,
	})
}

export async function listRaBankAccounts(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/bank-accounts${toQuery(params)}`)
}

export async function createRaBankAccount(body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>("/admin/resident-association/bank-accounts", {
		method: "POST",
		body,
	})
}

export async function updateRaBankAccount(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/bank-accounts/${id}`, {
		method: "PUT",
		body,
	})
}

export async function deleteRaBankAccount(id: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/bank-accounts/${id}`, {
		method: "DELETE",
	})
}

export async function listRaCharges(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/charges${toQuery(params)}`)
}

export async function getRaCharge(id: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/charges/${id}`)
}

export async function createRaCharge(body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>("/admin/resident-association/charges", {
		method: "POST",
		body,
	})
}

export async function updateRaCharge(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/charges/${id}`, {
		method: "PUT",
		body,
	})
}

export async function generateRaChargeObligations(id: string, body?: { period_key?: string }) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/charges/${id}/generate-obligations`, {
		method: "POST",
		body: body ?? {},
	})
}

export async function listRaPayments(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/payments${toQuery(params)}`)
}

export async function getRaPayment(id: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/payments/${id}`)
}

export async function verifyRaPayment(
	id: string,
	body?: { reason?: string; allocations?: Array<{ obligation_id: string; amount: number }> }
) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/payments/${id}/verify`, {
		method: "POST",
		body: body ?? {},
	})
}

export async function rejectRaPayment(id: string, body: { reason?: string; rejection_reason?: string }) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/payments/${id}/reject`, {
		method: "POST",
		body,
	})
}

export async function listRaDiscrepancies(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/discrepancies${toQuery(params)}`)
}

export async function listRaExpenditures(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/expenditures${toQuery(params)}`)
}

export async function createRaExpenditure(body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>("/admin/resident-association/expenditures", {
		method: "POST",
		body,
	})
}

export async function updateRaExpenditure(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/expenditures/${id}`, {
		method: "PUT",
		body,
	})
}

export async function listRaNotices(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/admin/resident-association/notices${toQuery(params)}`)
}

export async function createRaNotice(body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>("/admin/resident-association/notices", {
		method: "POST",
		body,
	})
}

export async function updateRaNotice(id: string, body: Record<string, unknown>) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/notices/${id}`, {
		method: "PUT",
		body,
	})
}

export async function publishRaNotice(id: string) {
	return apiFetch<RaItemResponse<any>>(`/admin/resident-association/notices/${id}/publish`, {
		method: "POST",
		body: {},
	})
}

// ── Member ─────────────────────────────────────────────────────────────────

export async function getMemberRaDashboard(params?: { estate_id?: string; year?: string }) {
	return apiFetch<RaItemResponse<any>>(`/resident-association/dashboard${toQuery(params)}`)
}

export async function getMemberRaHouses() {
	return apiFetch<RaItemResponse<any[]>>("/resident-association/houses")
}

export async function getMemberRaBankInstructions(estate_id: string) {
	return apiFetch<RaItemResponse<{ association: any; accounts: any[] }>>(
		`/resident-association/bank-instructions${toQuery({ estate_id })}`
	)
}

export async function declareMemberRaPayment(body: {
	estate_id: string
	amount: number
	payment_date?: string
	bank_reference?: string
	description?: string
	property_id?: string
	evidence?: unknown
	period_from?: string
	period_to?: string
	charge_id?: string
	obligation_ids?: string[]
	property_allocation_id?: string
	idempotency_key?: string
}) {
	return apiFetch<RaItemResponse<any>>("/resident-association/payments/declare", {
		method: "POST",
		body,
	})
}

export async function getMemberRaPayments(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/resident-association/payments${toQuery(params)}`)
}

export async function getMemberRaCalendar(params: {
	estate_id: string
	property_id?: string
	year?: string
}) {
	return apiFetch<RaItemResponse<any[]>>(`/resident-association/calendar${toQuery(params)}`)
}

export async function getMemberRaReceipts(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/resident-association/receipts${toQuery(params)}`)
}

export async function getMemberRaNotices(params?: Query) {
	return apiFetch<RaListResponse<any[]>>(`/resident-association/notices${toQuery(params)}`)
}

export async function reportMemberRaDiscrepancy(body: {
	estate_id: string
	message: string
	property_id?: string
	charge_id?: string
	declaration_id?: string
	amount?: number
	payment_date?: string
	bank_reference?: string
	evidence?: unknown
}) {
	return apiFetch<RaItemResponse<any>>("/resident-association/discrepancies", {
		method: "POST",
		body,
	})
}
