"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Download, FileText, Loader2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchLoanApplicationStatus, fetchLoanDetails } from "@/lib/api/loans"
import type { LoanResource, LoanRepayment } from "@/lib/api/loans"
import { useMemberDocuments } from "@/lib/hooks/use-member-documents"
import { downloadDocument } from "@/lib/api/documents"

type LoanViewModel = LoanResource & {
	totalRepaid: number
	outstandingBalance: number
	progressPercent: number
	nextRepayment?: LoanRepayment | null
}

const currency = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

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

const computeMetrics = (loan: LoanResource): LoanViewModel => {
	const repayments = loan.repayments ?? []
	const totalRepaid = repayments.reduce((sum, repayment) => sum + (repayment.amount ?? 0), 0)
	const outstandingBalance = Math.max((loan.total_amount ?? loan.amount ?? 0) - totalRepaid, 0)
	const progressPercent = loan.total_amount ? Math.min(100, (totalRepaid / loan.total_amount) * 100) : 0
	const nextRepayment =
		repayments.find((repayment) => repayment.status !== "paid" && repayment.status !== "completed") ?? null

	return {
		...loan,
		totalRepaid,
		outstandingBalance,
		progressPercent,
		nextRepayment,
	}
}

export default function LoanDetailsPage() {
	const params = useParams<{ id: string }>()
	const loanId = params?.id ?? ""

	const [loan, setLoan] = useState<LoanViewModel | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(null)

	const {
		documents: memberDocuments,
		isLoading: isLoadingDocuments,
		error: documentsError,
	} = useMemberDocuments({ per_page: 100 })

	useEffect(() => {
		let isMounted = true

		const loadLoan = async () => {
			try {
				setIsLoading(true)
				setError(null)

				const [detailResult, statusResult] = await Promise.all([
					fetchLoanDetails(loanId),
					fetchLoanApplicationStatus(loanId).catch(() => null),
				])

				if (!isMounted) return

				const mergedLoan: LoanResource = {
					...detailResult,
					product: statusResult?.product ?? detailResult.product ?? null,
					purpose: statusResult?.purpose ?? detailResult.purpose,
					application_metadata: statusResult?.application_metadata ?? detailResult.application_metadata,
				}

				setLoan(computeMetrics(mergedLoan))
			} catch (err: any) {
				if (!isMounted) return
				console.error("Failed to load loan details", err)
				setError(err?.message ?? "Unable to load loan details at this time.")
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		if (loanId) {
			loadLoan()
		}

		return () => {
			isMounted = false
		}
	}, [loanId])

	const headerBadgeVariant = useMemo(() => {
		const status = loan?.status?.toLowerCase()
		switch (status) {
			case "approved":
				return "bg-blue-100 text-blue-700 hover:bg-blue-100"
			case "disbursed":
				return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
			case "completed":
				return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
			case "pending":
				return "bg-amber-100 text-amber-700 hover:bg-amber-100"
			case "rejected":
				return "bg-red-100 text-red-700 hover:bg-red-100"
			default:
				return "bg-slate-100 text-slate-700 hover:bg-slate-100"
		}
	}, [loan?.status])

	const relatedLoanDocuments = useMemo(() => {
		if (!memberDocuments.length) return []
		const haystackFilter = (doc: (typeof memberDocuments)[number]) => {
			const haystack = `${doc.title ?? ""} ${doc.type ?? ""} ${doc.description ?? ""}`.toLowerCase()
			return haystack.includes("loan")
		}

		const filteredByLoanId =
			loanId
				? memberDocuments.filter((doc) => {
						const haystack = `${doc.title ?? ""} ${doc.type ?? ""} ${doc.description ?? ""}`.toLowerCase()
						return haystack.includes("loan") && haystack.includes(loanId.toLowerCase())
				  })
				: []

		if (filteredByLoanId.length > 0) {
			return filteredByLoanId
		}

		return memberDocuments.filter(haystackFilter)
	}, [loanId, memberDocuments])

	const loanAgreementDocument = useMemo(
		() =>
			relatedLoanDocuments.find((doc) => {
				const content = `${doc.title} ${doc.type} ${doc.description ?? ""}`.toLowerCase()
				return content.includes("agreement")
			}) ?? null,
		[relatedLoanDocuments],
	)

	const paymentReceiptDocument = useMemo(
		() =>
			relatedLoanDocuments.find((doc) => {
				const content = `${doc.title} ${doc.type} ${doc.description ?? ""}`.toLowerCase()
				return content.includes("receipt") || content.includes("payment")
			}) ?? null,
		[relatedLoanDocuments],
	)

	const handleDocumentDownload = async (documentId: string, label: string) => {
		try {
			setDownloadingDocumentId(documentId)
			const result = await downloadDocument(documentId)
			if (!result.download_url) {
				throw new Error("Download link not provided.")
			}
			window.open(result.download_url, "_blank", "noopener,noreferrer")
			toast.success(`${label} download started.`)
		} catch (err: any) {
			console.error(`Failed to download ${label}`, err)
			toast.error(`Unable to download ${label}.`, {
				description: err?.message ?? "Please try again later.",
			})
		} finally {
			setDownloadingDocumentId(null)
		}
  }

  return (
		<div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Link href="/dashboard/loans">
          <Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loans
          </Button>
        </Link>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
						<h1 className="text-3xl font-bold">
							{isLoading ? "Loading loan..." : loan?.product?.name ?? loan?.type ?? "Loan Details"}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">Loan ID: {loanId}</p>
          </div>
					{loan ? <Badge className={headerBadgeVariant}>{loan.status ?? "Status Unknown"}</Badge> : null}
        </div>
      </div>

			{isLoading ? (
				<Card className="border-dashed p-12 text-center">
					<Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Fetching the latest loan information...</p>
				</Card>
			) : null}

			{error || documentsError ? (
				<Card className="border-red-200 bg-red-50 p-6">
					<p className="text-sm text-red-600">{error ?? documentsError}</p>
				</Card>
			) : null}

			{!isLoading && loan ? (
				<>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold">{currency.format(loan.amount ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Outstanding Balance
								</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold text-orange-600">
									{currency.format(loan.outstandingBalance ?? 0)}
								</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">Amount Repaid</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold text-green-600">
									{currency.format(loan.totalRepaid ?? 0)}
								</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold">
									{currency.format(loan.monthly_payment ?? loan.total_amount / (loan.duration_months || 1))}
								</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repayment Progress</CardTitle>
							<CardDescription>Track how much of the loan has been cleared so far.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
									<span className="font-medium">{loan.progressPercent.toFixed(1)}% Complete</span>
            </div>
								<Progress value={loan.progressPercent} className="h-3" />
          </div>

							<div className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Next Payment</p>
										<p className="text-sm font-medium">{formatDate(loan.nextRepayment?.due_date)}</p>
										<p className="text-xs text-muted-foreground">
											Amount: {currency.format(loan.nextRepayment?.amount ?? loan.monthly_payment ?? 0)}
										</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
										<p className="text-xs text-muted-foreground">Tenure</p>
										<p className="text-sm font-medium">
											{loan.duration_months} months ({loan.progressPercent.toFixed(1)}% complete)
										</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Interest Rate</p>
										<p className="text-sm font-medium">{loan.interest_rate ?? 0}% p.a.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

					<div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex justify-between border-b py-2">
									<span className="text-muted-foreground">Product</span>
									<span className="font-medium">{loan.product?.name ?? loan.type ?? "—"}</span>
            </div>
								<div className="flex justify-between border-b py-2">
									<span className="text-muted-foreground">Application Date</span>
									<span className="font-medium">{formatDate(loan.application_date)}</span>
            </div>
								<div className="flex justify-between border-b py-2">
									<span className="text-muted-foreground">Approval Date</span>
									<span className="font-medium">{formatDate(loan.approved_at)}</span>
            </div>
								<div className="flex justify-between border-b py-2">
									<span className="text-muted-foreground">Status</span>
									<span className="font-medium capitalize">{loan.status ?? "—"}</span>
            </div>
								<div className="flex justify-between border-b py-2">
									<span className="text-muted-foreground">Purpose</span>
									<span className="max-w-[240px] text-right font-medium">
										{loan.purpose ?? "Not provided"}
									</span>
            </div>
            <div className="flex justify-between py-2">
									<span className="text-muted-foreground">Tenure</span>
									<span className="font-medium">{loan.duration_months} months</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
								<CardDescription>Manage repayments and download your loan documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
								<Link href={`/dashboard/loans/${loanId}/repay`}>
              <Button className="w-full">Make Payment</Button>
            </Link>
								<Link href={`/dashboard/loans/${loanId}/schedule`}>
              <Button variant="outline" className="w-full bg-transparent">
                View Repayment Schedule
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full bg-transparent"
									disabled={!loanAgreementDocument || downloadingDocumentId === loanAgreementDocument?.id}
									onClick={() =>
										loanAgreementDocument &&
										handleDocumentDownload(loanAgreementDocument.id, "Loan agreement document")
									}
            >
									<Download className="mr-2 h-4 w-4" />
									{loanAgreementDocument
										? downloadingDocumentId === loanAgreementDocument.id
											? "Preparing Loan Agreement..."
											: "Download Loan Agreement"
										: isLoadingDocuments
										? "Loading Loan Agreement..."
										: "Loan Agreement Unavailable"}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
									disabled={!paymentReceiptDocument || downloadingDocumentId === paymentReceiptDocument?.id}
									onClick={() =>
										paymentReceiptDocument &&
										handleDocumentDownload(paymentReceiptDocument.id, "Payment receipt document")
									}
            >
									<Download className="mr-2 h-4 w-4" />
									{paymentReceiptDocument
										? downloadingDocumentId === paymentReceiptDocument.id
											? "Preparing Payment Receipt..."
											: "Download Payment Receipt"
										: isLoadingDocuments
										? "Loading Payment Receipt..."
										: "Payment Receipt Unavailable"}
								</Button>
								<Link href="/dashboard/documents">
									<Button variant="link" className="w-full px-0">
										Manage all documents in Documents Centre
            </Button>
								</Link>
          </CardContent>
        </Card>
      </div>
				</>
			) : null}
    </div>
  )
}
