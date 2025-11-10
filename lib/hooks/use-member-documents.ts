"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchMemberDocuments, type DocumentItem } from "@/lib/api/documents"

export interface UseMemberDocumentsOptions {
	type?: string
	status?: string
	page?: number
	per_page?: number
	autoRefresh?: boolean
}

export interface UseMemberDocumentsResult {
	documents: DocumentItem[]
	isLoading: boolean
	error: string | null
	refresh: () => void
	pagination?: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export function useMemberDocuments(options?: UseMemberDocumentsOptions): UseMemberDocumentsResult {
	const [documents, setDocuments] = useState<DocumentItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [pagination, setPagination] = useState<UseMemberDocumentsResult["pagination"]>()
	const [reloadToken, setReloadToken] = useState(0)

	const refresh = useCallback(() => {
		setReloadToken((token) => token + 1)
	}, [])

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const response = await fetchMemberDocuments({
					type: options?.type,
					status: options?.status,
					page: options?.page,
					per_page: options?.per_page ?? 50,
				})
				if (!cancelled) {
					setDocuments(response.documents)
					setPagination(response.pagination)
				}
			} catch (err: any) {
				if (!cancelled) {
					console.error("Failed to load member documents", err)
					setError(err?.message ?? "Unable to load documents.")
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		load()

		return () => {
			cancelled = true
		}
	}, [options?.type, options?.status, options?.page, options?.per_page, reloadToken])

	useEffect(() => {
		if (!options?.autoRefresh) return
		const interval = setInterval(refresh, 60_000)
		return () => clearInterval(interval)
	}, [options?.autoRefresh, refresh])

	return { documents, isLoading, error, refresh, pagination }
}

