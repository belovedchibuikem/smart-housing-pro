"use client"

"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Loader2, TrendingUp, Wallet } from "lucide-react"
import type { LoanWithMetrics } from "@/lib/hooks/use-member-loans"

type ActiveLoansProps = {
	loans: LoanWithMetrics[]
	isLoading?: boolean
	isRefreshing?: boolean
	error?: string | null
	onRefresh?: () => void
}

const numberFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

const shortNumberFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 2,
})

const formatCurrency = (value: number) => numberFormatter.format(value || 0)

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

const statusVariant: Record<string, string> = {
	approved: "bg-blue-100 text-blue-700 hover:bg-blue-100",
	disbursed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
	pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
	completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
	rejected: "bg-red-100 text-red-700 hover:bg-red-100",
	default: "",
}

export function ActiveLoans({ loans, isLoading, isRefreshing, error, onRefresh }: ActiveLoansProps) {
	const activeLoans = useMemo(
		() =>
			(loans || []).filter((loan) =>
				["approved", "disbursed"].includes(loan.status?.toLowerCase() ?? "")
			),
		[loans]
	)

	const renderHeader = () => (
		<div className="flex items-center justify-between">
			<div>
				<h2 className="text-lg font-semibold">Active Loans</h2>
				<p className="text-sm text-muted-foreground">
					Overview of loans that are currently active or disbursed
				</p>
			</div>
			{onRefresh && (
				<Button variant="outline" size="sm" className="bg-transparent" onClick={onRefresh} disabled={isRefreshing}>
					{isRefreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
					Refresh
				</Button>
			)}
		</div>
	)

	if (isLoading) {
		return (
			<div className="space-y-6">
				{renderHeader()}
				<Card className="p-6 space-y-6">
					<Skeleton className="h-6 w-48" />
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
						))}
					</div>
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-10 w-full" />
				</Card>
			</div>
		)
  }

  return (
    <div className="space-y-6">
			{renderHeader()}

			{error ? (
				<Card className="p-8 border-red-200 bg-red-50">
					<h3 className="text-lg font-semibold text-red-700">Unable to load loans</h3>
					<p className="text-sm text-red-600 mt-2">{error}</p>
					{onRefresh && (
						<Button variant="outline" className="mt-4 bg-white" onClick={onRefresh}>
							Try again
						</Button>
					)}
				</Card>
			) : null}

			{!error && activeLoans.length === 0 ? (
				<Card className="p-12 text-center border-dashed">
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<Wallet className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="text-xl font-semibold mb-1">No active loans yet</h3>
					<p className="text-sm text-muted-foreground mb-6">
						Start your loan journey by submitting an application. Once approved, your loan will appear here.
					</p>
					<Link href="/dashboard/loans/apply">
						<Button>Request a Loan</Button>
					</Link>
				</Card>
			) : null}

			{activeLoans.map((loan) => {
				const statusKey = loan.status?.toLowerCase() ?? "default"
				const statusClass = statusVariant[statusKey] ?? statusVariant.default
				const totalAmount = loan.total_amount ?? loan.amount
				const monthlyPayment = loan.monthly_payment ?? 0
				const outstandingBalance = loan.outstandingBalance ?? Math.max(totalAmount - (loan.totalRepaid ?? 0), 0)
				const progress = Math.round(loan.progressPercent ?? 0)
				const tenureLabel = loan.duration_months ? `${loan.duration_months} months` : "—"
				const interestRateLabel = `${loan.interest_rate ?? 0}% p.a.`
				const nextPaymentAmount =
					loan.nextRepayment?.amount !== undefined
						? shortNumberFormatter.format(loan.nextRepayment.amount ?? monthlyPayment)
						: formatCurrency(monthlyPayment)

				return (
          <Card key={loan.id} className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
									<div className="flex items-center gap-2 flex-wrap">
										<h3 className="text-xl font-semibold">
											{loan.product?.name ?? loan.type ?? "Loan"}
										</h3>
										<Badge className={statusClass}>{loan.status ?? "—"}</Badge>
                  </div>
									<p className="text-xs text-muted-foreground uppercase tracking-wide">
										Loan ID: {loan.id}
									</p>
                </div>

								<div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/loans/${loan.id}`}>
										<Button variant="outline" className="bg-transparent">
											View Details
										</Button>
									</Link>
									<Link href={`/dashboard/loans/${loan.id}/repay`}>
										<Button>Make Payment</Button>
                </Link>
								</div>
              </div>

							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<div>
									<p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
									<p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
                </div>
								<div>
									<p className="text-xs text-muted-foreground uppercase tracking-wide">
										Outstanding Balance
									</p>
									<p className="text-lg font-semibold text-orange-600">
										{formatCurrency(outstandingBalance)}
									</p>
                </div>
								<div>
									<p className="text-xs text-muted-foreground uppercase tracking-wide">
										Monthly Payment
									</p>
									<p className="text-lg font-semibold">{formatCurrency(monthlyPayment)}</p>
                </div>
								<div>
									<p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Rate</p>
									<p className="text-lg font-semibold">{interestRateLabel}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Progress</span>
									<span className="font-medium">{progress}%</span>
                </div>
								<Progress value={progress} />
              </div>

							<div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
								<div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">Next Payment</p>
										<p className="font-medium">{formatDate(loan.nextRepayment?.due_date)}</p>
										<p className="text-xs text-muted-foreground">Amount: {nextPaymentAmount}</p>
									</div>
                </div>
								<div className="flex items-center gap-3 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">Tenure</p>
										<p className="font-medium">{tenureLabel}</p>
									</div>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<Wallet className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">Total Repaid</p>
										<p className="font-medium">
											{formatCurrency(loan.totalRepaid ?? 0)}
										</p>
									</div>
                </div>
              </div>

							<div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/dashboard/loans/${loan.id}/schedule`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Schedule
                  </Button>
                </Link>
								<Link href={`/dashboard/loans/${loan.id}/repay`} className="flex-1">
									<Button className="w-full">Make Payment</Button>
								</Link>
                </div>
            </div>
          </Card>
				)
			})}
    </div>
  )
}
