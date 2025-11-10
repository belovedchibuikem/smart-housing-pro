import { apiFetch } from "./client"
import type { Member, User } from "@/lib/types/user"

export type UserProfileResponse = {
	user: User
}

export type UpdateUserProfilePayload = Partial<{
	first_name: string
	last_name: string
	phone: string
	password: string
	staff_id: string | null
	ippis_number: string | null
	date_of_birth: string | null
	gender: string | null
	marital_status: string | null
	nationality: string | null
	state_of_origin: string | null
	lga: string | null
	residential_address: string | null
	city: string | null
	state: string | null
	rank: string | null
	department: string | null
	command_state: string | null
	employment_date: string | null
	years_of_service: number | null
	next_of_kin_name: string | null
	next_of_kin_relationship: string | null
	next_of_kin_phone: string | null
	next_of_kin_email: string | null
	next_of_kin_address: string | null
}>

export interface MemberKyc {
	member_id: string
	status: "pending" | "submitted" | "verified" | "rejected"
	submitted_at?: string | null
	verified_at?: string | null
	rejection_reason?: string | null
	documents: Array<{
		type: string
		path: string
		uploaded_at?: string | null
	}>
	required_documents: string[]
	next_of_kin?: {
		name?: string | null
		relationship?: string | null
		phone?: string | null
		email?: string | null
		address?: string | null
	}
}

export async function fetchUserProfile(): Promise<UserProfileResponse> {
	return apiFetch<UserProfileResponse>("/user/profile", { method: "GET" })
}

export async function updateUserProfile(payload: UpdateUserProfilePayload) {
	return apiFetch<UserProfileResponse>("/user/profile", {
		method: "PUT",
		body: payload,
	})
}

export async function fetchMemberKyc(): Promise<{ kyc: MemberKyc }> {
	return apiFetch<{ kyc: MemberKyc }>("/user/kyc", { method: "GET" })
}

export async function submitMemberKyc() {
	return apiFetch<{ success: boolean; message: string }>("/user/kyc/submit", {
		method: "POST",
		body: {},
	})
}

export async function uploadMemberKycDocument(type: string, file: File) {
	const formData = new FormData()
	formData.append("documents[]", file)
	formData.append("document_types[]", type)

	return apiFetch<{
		success: boolean
		message: string
		documents: Array<{ type: string; path: string; uploaded_at?: string }>
	}>("/user/kyc/documents", {
		method: "POST",
		body: formData,
		headers: {},
	})
}

