/** Shared helpers for house/land repayment history display after rollback. */

export type RepaymentStatusLike = {
	is_reversed?: boolean | null
	status?: string | null
	void_reason?: string | null
	reversed_at?: string | null
	metadata?: { voided?: boolean; void_reason?: string; voided_at?: string } | null
}

export function isRepaymentReversed(entry: RepaymentStatusLike | null | undefined): boolean {
	if (!entry) return false
	if (entry.is_reversed === true) return true
	const status = String(entry.status ?? "").toLowerCase()
	if (status === "reversed" || status === "voided") return true
	if (entry.metadata?.voided === true) return true
	return false
}

export function repaymentStatusLabel(entry: RepaymentStatusLike | null | undefined): string {
	if (isRepaymentReversed(entry)) return "Reversed"
	const status = String(entry?.status ?? "completed").replace(/_/g, " ")
	if (!status) return "Completed"
	return status.charAt(0).toUpperCase() + status.slice(1)
}
