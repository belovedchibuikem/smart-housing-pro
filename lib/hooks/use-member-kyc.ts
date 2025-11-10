'use client'

import { useCallback, useEffect, useState } from "react"
import { fetchMemberKyc, submitMemberKyc, uploadMemberKycDocument } from "@/lib/api/user-profile"

export type UseMemberKycResult = {
	status: "pending" | "submitted" | "verified" | "rejected"
	submitted_at?: string | null
	verified_at?: string | null
	rejection_reason?: string | null
	documents: Array<{ type: string; path: string; uploaded_at?: string | null }>
	requiredDocuments: string[]
	nextOfKin: {
		name?: string | null
		relationship?: string | null
		phone?: string | null
		email?: string | null
		address?: string | null
	}
	isLoading: boolean
	error: string | null
	refresh: () => void
	resubmit: () => Promise<void>
	uploadDocument: (type: string, file: File) => Promise<void>
}

const DEFAULT_KYC_STATE = {
	status: "pending" as const,
	submitted_at: null,
	verified_at: null,
	rejection_reason: null,
	documents: [] as Array<{ type: string; path: string; uploaded_at?: string | null }>,
	requiredDocuments: ["passport", "national_id", "drivers_license", "utility_bill", "bank_statement"],
	nextOfKin: {
		name: null as string | null,
		relationship: null as string | null,
		phone: null as string | null,
		email: null as string | null,
		address: null as string | null,
	},
}

export function useMemberKyc(): UseMemberKycResult {
	const [kycState, setKycState] = useState(DEFAULT_KYC_STATE)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [reloadToken, setReloadToken] = useState(0)

	const loadKyc = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const response = await fetchMemberKyc()
			setKycState({
				status: response.kyc.status,
				submitted_at: response.kyc.submitted_at ?? null,
				verified_at: response.kyc.verified_at ?? null,
				rejection_reason: response.kyc.rejection_reason ?? null,
				documents: response.kyc.documents ?? [],
				requiredDocuments: response.kyc.required_documents ?? DEFAULT_KYC_STATE.requiredDocuments,
				nextOfKin: {
					name: response.kyc.next_of_kin?.name ?? null,
					relationship: response.kyc.next_of_kin?.relationship ?? null,
					phone: response.kyc.next_of_kin?.phone ?? null,
					email: response.kyc.next_of_kin?.email ?? null,
					address: response.kyc.next_of_kin?.address ?? null,
				},
			})
		} catch (err: any) {
			console.error("Failed to fetch member KYC", err)
			setError(err?.message ?? "Unable to load KYC status.")
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadKyc()
	}, [loadKyc, reloadToken])

	const refresh = useCallback(() => {
		setReloadToken((token) => token + 1)
	}, [])

	const resubmit = useCallback(async () => {
		await submitMemberKyc()
		refresh()
	}, [refresh])

	const uploadDocument = useCallback(
		async (type: string, file: File) => {
			await uploadMemberKycDocument(type, file)
			refresh()
		},
		[refresh],
	)

	return {
		...kycState,
		isLoading,
		error,
		refresh,
		resubmit,
		uploadDocument,
	}
}

