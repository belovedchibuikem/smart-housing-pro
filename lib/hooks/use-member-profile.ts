'use client'

import { useCallback, useEffect, useState } from "react"
import { fetchUserProfile, updateUserProfile, type UpdateUserProfilePayload } from "@/lib/api/user-profile"
import type { Member, User } from "@/lib/types/user"

interface UseMemberProfileResult {
	user: User | null
	member: Member | null
	isLoading: boolean
	error: string | null
	refresh: () => void
	updateProfile: (payload: UpdateUserProfilePayload) => Promise<void>
}

export function useMemberProfile(): UseMemberProfileResult {
	const [user, setUser] = useState<User | null>(null)
	const [member, setMember] = useState<Member | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [reloadToken, setReloadToken] = useState(0)

	const loadProfile = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const response = await fetchUserProfile()
			setUser(response.user)
			setMember(response.user.member ?? null)
		} catch (err: any) {
			console.error("Failed to load member profile", err)
			setError(err?.message ?? "Unable to load profile information.")
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadProfile()
	}, [loadProfile, reloadToken])

	const refresh = useCallback(() => {
		setReloadToken((token) => token + 1)
	}, [])

	const updateProfile = useCallback(
		async (payload: UpdateUserProfilePayload) => {
			try {
				setIsLoading(true)
				const response = await updateUserProfile(payload)
				setUser(response.user)
				setMember(response.user.member ?? null)
			} catch (err: any) {
				console.error("Failed to update profile", err)
				throw err
			} finally {
				setIsLoading(false)
			}
		},
		[],
	)

	return {
		user,
		member,
		isLoading,
		error,
		refresh,
		updateProfile,
	}
}

