import { useCallback, useEffect, useMemo, useState } from "react"
import {
	fetchLoanApplicationStatus,
	fetchLoanDetails,
	fetchMemberLoans,
	LoanRepayment,
	LoanResource,
} from "@/lib/api/loans"

export interface LoanWithMetrics extends LoanResource {
	totalRepaid: number
	outstandingBalance: number
	progressPercent: number
	nextRepayment?: LoanRepayment | null
}

export interface UseMemberLoansResult {
	loans: LoanWithMetrics[]
	isLoading: boolean
	isRefreshing: boolean
	error: string | null
	refresh: () => void
	pagination?: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

const sumRepayments = (repayments?: LoanRepayment[]): number => {
	if (!repayments?.length) return 0
	return repayments.reduce((sum, repayment) => sum + (repayment?.amount ?? 0), 0)
}

const calculateMetrics = (loan: LoanResource): Pick<LoanWithMetrics, "totalRepaid" | "outstandingBalance" | "progressPercent" | "nextRepayment"> => {
	const repayments = loan.repayments ?? []
	const totalRepaid = sumRepayments(repayments)
	const outstandingBalance = Math.max((loan.total_amount ?? 0) - totalRepaid, 0)
	const progressPercent = loan.total_amount ? Math.min(100, (totalRepaid / loan.total_amount) * 100) : 0
	const nextRepayment =
		repayments.find((repayment) => repayment.status !== "paid" && repayment.status !== "completed") ?? null

	return {
		totalRepaid,
		outstandingBalance,
		progressPercent,
		nextRepayment,
	}
}

export function useMemberLoans(options?: { autoRefresh?: boolean }): UseMemberLoansResult {
	const [loans, setLoans] = useState<LoanWithMetrics[]>([])
	const [pagination, setPagination] = useState<UseMemberLoansResult["pagination"]>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [reloadToken, setReloadToken] = useState(0)

	const refresh = useCallback(() => {
		setReloadToken((token) => token + 1)
	}, [])

	useEffect(() => {
		let cancelled = false

		const loadLoans = async () => {
			setError(null)
			setIsLoading((prev) => prev === false && loans.length === 0)
			setIsRefreshing(loans.length > 0)

			try {
				const response = await fetchMemberLoans({ per_page: 100 })
				if (cancelled) return

				setPagination(response.pagination)

				const enrichedLoans = await Promise.all(
					response.loans.map(async (loan) => {
						try {
							const [detailResult, applicationResult] = await Promise.allSettled([
								fetchLoanDetails(loan.id),
								fetchLoanApplicationStatus(loan.id),
							])

							const detail =
								detailResult.status === "fulfilled" && detailResult.value ? detailResult.value : loan
							const application =
								applicationResult.status === "fulfilled" && applicationResult.value
									? applicationResult.value
									: null

							const mergedLoan: LoanResource = {
								...detail,
								product: application?.product ?? detail.product ?? loan.product ?? null,
								repayments: detail.repayments ?? loan.repayments,
							}

							const metrics = calculateMetrics(mergedLoan)

							return {
								...mergedLoan,
								...metrics,
							}
						} catch (detailError) {
							console.warn("[useMemberLoans] Failed to enrich loan detail", detailError)
							const metrics = calculateMetrics(loan)
							return {
								...loan,
								...metrics,
							}
						}
					})
				)

				if (!cancelled) {
					setLoans(enrichedLoans)
				}
			} catch (err: any) {
				if (cancelled) return
				console.error("[useMemberLoans] Failed to load loans", err)
				setError(err?.message ?? "Unable to load loans at this time")
			} finally {
				if (!cancelled) {
					setIsLoading(false)
					setIsRefreshing(false)
				}
			}
		}

		setIsLoading(loans.length === 0)
		loadLoans()

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reloadToken])

	useEffect(() => {
		if (!options?.autoRefresh) return
		const interval = setInterval(() => {
			refresh()
		}, 60_000)
		return () => clearInterval(interval)
	}, [options?.autoRefresh, refresh])

	const memoizedLoans = useMemo(() => loans, [loans])

	return {
		loans: memoizedLoans,
		isLoading,
		isRefreshing,
		error,
		refresh,
		pagination,
	}
}

