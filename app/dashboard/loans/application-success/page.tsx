"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchLoanDetails } from "@/lib/api/loans"
import type { LoanResource } from "@/lib/api/loans"

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 2,
	}).format(value || 0)

const formatDate = (value?: string | null) => {
	if (!value) return "—"
	try {
		return new Date(value).toLocaleDateString("en-NG", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
	} catch {
		return value
	}
}

const statusLabel = (status?: string) => {
	const normalized = (status || "").toLowerCase()
	if (normalized === "pending") return "Under Review"
	if (normalized === "approved") return "Approved"
	if (normalized === "rejected") return "Rejected"
	if (normalized === "disbursed" || normalized === "active") return "Active"
	return status ? status.replace(/_/g, " ") : "Under Review"
}

const statusClassName = (status?: string) => {
	const normalized = (status || "").toLowerCase()
	if (normalized === "pending") return "text-yellow-600"
	if (normalized === "approved" || normalized === "disbursed" || normalized === "active") return "text-green-600"
	if (normalized === "rejected") return "text-red-600"
	return "text-foreground"
}

function LoanApplicationSuccessContent() {
	const searchParams = useSearchParams()
	const loanId = searchParams.get("loanId") ?? ""

	const [loan, setLoan] = useState<LoanResource | null>(null)
	const [isLoading, setIsLoading] = useState(Boolean(loanId))
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let isMounted = true

		const loadLoan = async () => {
			if (!loanId) {
				setIsLoading(false)
				setError("Missing loan application reference.")
				return
			}

			try {
				setIsLoading(true)
				setError(null)
				const details = await fetchLoanDetails(loanId)
				if (!isMounted) return
				setLoan(details)
			} catch (err: any) {
				if (!isMounted) return
				console.error("Failed to load loan application", err)
				setError(err?.message ?? "Unable to load your application details.")
			} finally {
				if (isMounted) setIsLoading(false)
			}
		}

		loadLoan()

		return () => {
			isMounted = false
		}
	}, [loanId])

	const summary = useMemo(() => {
		if (!loan) return null

		const amount = Number(loan.amount) || 0
		const months = Number(loan.duration_months) || 0
		const interestRate = Number(loan.interest_rate) || 0
		const total = Number(loan.total_amount) || amount + amount * (interestRate / 100)
		const monthly = Number(loan.monthly_payment) || (months > 0 ? total / months : 0)

		return {
			applicationId: loan.loan_number || loan.id,
			loanType: loan.product?.name || loan.type || "Loan",
			amount,
			monthly,
			total,
			tenureMonths: months,
			interestRate,
			submittedAt: loan.application_date || loan.created_at,
			status: loan.status,
			purpose: loan.purpose,
		}
	}, [loan])

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
				<div className="flex justify-center">
					<div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
						<CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Application Submitted!</h1>
					<p className="text-muted-foreground text-lg">
						Your loan application has been received successfully
					</p>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
						<Loader2 className="h-5 w-5 animate-spin" />
						<span>Loading application details…</span>
					</div>
				) : error || !summary ? (
					<div className="bg-muted/50 rounded-lg p-6 space-y-2">
						<p className="text-sm text-muted-foreground">
							{error || "Application details are not available right now."}
						</p>
						{loanId ? (
							<p className="text-xs text-muted-foreground font-mono break-all">Ref: {loanId}</p>
						) : null}
					</div>
				) : (
					<div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Application ID</span>
							<span className="font-medium font-mono text-right break-all">{summary.applicationId}</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Loan Product</span>
							<span className="font-medium text-right">{summary.loanType}</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Requested Amount</span>
							<span className="font-medium">{formatCurrency(summary.amount)}</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Tenure</span>
							<span className="font-medium">
								{summary.tenureMonths} month{summary.tenureMonths === 1 ? "" : "s"}
							</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Interest</span>
							<span className="font-medium">{summary.interestRate}% for tenure</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Monthly Repayment</span>
							<span className="font-medium">{formatCurrency(summary.monthly)}</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Total Repayment</span>
							<span className="font-medium">{formatCurrency(summary.total)}</span>
						</div>
						{summary.purpose ? (
							<div className="flex justify-between text-sm gap-4">
								<span className="text-muted-foreground">Purpose</span>
								<span className="font-medium text-right">{summary.purpose}</span>
							</div>
						) : null}
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Submission Date</span>
							<span className="font-medium">{formatDate(summary.submittedAt)}</span>
						</div>
						<div className="flex justify-between text-sm gap-4">
							<span className="text-muted-foreground">Status</span>
							<span className={`font-medium capitalize ${statusClassName(summary.status)}`}>
								{statusLabel(summary.status)}
							</span>
						</div>
					</div>
				)}

				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						Your application will be reviewed within 5-7 business days. You will receive an email
						notification once a decision has been made.
					</p>
				</div>

				<div className="pt-4 space-y-3">
					<div className="flex gap-3">
						<Link href="/dashboard" className="flex-1">
							<Button size="lg" className="w-full">
								<Home className="h-4 w-4 mr-2" />
								Go to Dashboard
							</Button>
						</Link>
						{loanId ? (
							<Link href={`/dashboard/loans/${loanId}`} className="flex-1">
								<Button size="lg" variant="outline" className="w-full">
									<FileText className="h-4 w-4 mr-2" />
									View Application
								</Button>
							</Link>
						) : (
							<Button size="lg" variant="outline" className="flex-1" disabled>
								<FileText className="h-4 w-4 mr-2" />
								View Application
							</Button>
						)}
					</div>
					<Link href="/dashboard/loans" className="block">
						<Button variant="ghost" className="w-full">
							View All Loans
						</Button>
					</Link>
				</div>
			</Card>
		</div>
	)
}

export default function LoanApplicationSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center p-4 text-muted-foreground">
					<Loader2 className="h-5 w-5 mr-2 animate-spin" />
					Loading application details…
				</div>
			}
		>
			<LoanApplicationSuccessContent />
		</Suspense>
	)
}
