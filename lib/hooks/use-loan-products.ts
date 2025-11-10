import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchLoanProducts, LoanProduct } from "@/lib/api/loans"

interface UseLoanProductsResult {
	products: LoanProduct[]
	isLoading: boolean
	error: string | null
	refresh: () => void
}

export function useLoanProducts(): UseLoanProductsResult {
	const [products, setProducts] = useState<LoanProduct[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [reloadToken, setReloadToken] = useState(0)

	const refresh = useCallback(() => {
		setReloadToken((token) => token + 1)
	}, [])

	useEffect(() => {
		let cancelled = false

		const loadProducts = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetchLoanProducts()
				if (!cancelled) {
					setProducts(response)
				}
			} catch (err: any) {
				if (!cancelled) {
					console.error("[useLoanProducts] Failed to load loan products", err)
					setError(err?.message ?? "Unable to load loan products")
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadProducts()

		return () => {
			cancelled = true
		}
	}, [reloadToken])

	const memoizedProducts = useMemo(() => products, [products])

	return {
		products: memoizedProducts,
		isLoading,
		error,
		refresh,
	}
}

