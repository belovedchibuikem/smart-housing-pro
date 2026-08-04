import { apiFetch } from "@/lib/api/client"

export async function requestEmailChange(email: string) {
	return apiFetch<{
		success: boolean
		message: string
		request_id: string
		expires_at?: string
	}>("/user/email-change/request", {
		method: "POST",
		body: JSON.stringify({ email }),
	})
}

export async function confirmEmailChange(otp: string) {
	return apiFetch<{
		success: boolean
		message: string
		user: { id: string; email: string; email_verified_at?: string | null }
	}>("/user/email-change/confirm", {
		method: "POST",
		body: JSON.stringify({ otp }),
	})
}
