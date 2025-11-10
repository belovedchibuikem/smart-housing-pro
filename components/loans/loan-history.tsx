import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"
import type { LoanWithMetrics } from "@/lib/hooks/use-member-loans"

type LoanHistoryProps = {
	loans: LoanWithMetrics[]
	isLoading?: boolean
	error?: string | null
}

const iconClass: Record<string, { icon: React.ElementType; className: string }> = {
	approved: { icon: CheckCircle2, className: "text-blue-600" },
	disbursed: { icon: CheckCircle2, className: "text-emerald-600" },
	completed: { icon: CheckCircle2, className: "text-emerald-600" },
	pending: { icon: Clock, className: "text-amber-600" },
	rejected: { icon: XCircle, className: "text-red-600" },
  }

const badgeClass: Record<string, string> = {
	approved: "bg-blue-100 text-blue-700 hover:bg-blue-100",
	disbursed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
	completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
	pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
	rejected: "bg-red-100 text-red-700 hover:bg-red-100",
}

const currencyFormat = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

const formatDate = (value?: string | null) => {
	if (!value) return "—"
	try {
		const date = new Date(value)
		return date.toLocaleDateString("en-NG", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
	} catch {
		return value
	}
}

export function LoanHistory({ loans, isLoading, error }: LoanHistoryProps) {
	const sortedLoans = useMemo(() => {
		return [...(loans ?? [])].sort((a, b) => {
			const aDate = a.application_date ? new Date(a.application_date).getTime() : 0
			const bDate = b.application_date ? new Date(b.application_date).getTime() : 0
			return bDate - aDate
		})
	}, [loans])

  return (
		<Card className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Loan History</h2>
					<p className="text-sm text-muted-foreground">Track all previous loan requests and their status</p>
				</div>
				{isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
			</div>

			{error ? (
				<p className="text-sm text-red-600">We couldn't load your loan history right now. Please try again.</p>
			) : null}

			{!error && !isLoading && sortedLoans.length === 0 ? (
				<div className="rounded-lg border border-dashed bg-muted/40 p-8 text-center">
					<p className="text-sm text-muted-foreground">
						You haven't submitted any loan applications yet.
					</p>
				</div>
			) : null}

      <div className="space-y-4">
				{sortedLoans.map((loan) => {
					const statusKey = loan.status?.toLowerCase() ?? "pending"
					const iconMeta = iconClass[statusKey] ?? iconClass.pending
					const StatusIcon = iconMeta.icon

					const badgeVariant = badgeClass[statusKey] ?? "bg-slate-100 text-slate-700 hover:bg-slate-100"

					return (
          <div
            key={loan.id}
							className="flex flex-col gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
									<StatusIcon className={`h-5 w-5 ${iconMeta.className}`} />
              </div>
              <div className="space-y-1">
									<p className="font-medium leading-none">
										{loan.product?.name ?? loan.type ?? "Loan Application"}
									</p>
									<p className="text-xs uppercase tracking-wide text-muted-foreground">
										Loan ID: {loan.id}
									</p>
									<div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
										<span>Applied: {formatDate(loan.application_date)}</span>
										{loan.approved_at ? <span>Approved: {formatDate(loan.approved_at)}</span> : null}
										{loan.rejected_at ? <span>Rejected: {formatDate(loan.rejected_at)}</span> : null}
                </div>
              </div>
            </div>
							<div className="flex items-center gap-3 sm:flex-col sm:items-end">
								<p className="text-lg font-semibold">{currencyFormat.format(loan.amount ?? 0)}</p>
								<Badge className={badgeVariant}>{loan.status ?? "Pending"}</Badge>
            </div>
          </div>
					)
				})}
      </div>
    </Card>
  )
}
