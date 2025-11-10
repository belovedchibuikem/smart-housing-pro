"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchLoanDetails } from "@/lib/api/loans"
import { ReceiptDownloadButton } from "@/components/payments/receipt-download-button"

const currency = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

export default function LoanRepaymentSuccessPage() {
	const params = useParams<{ id: string }>()
	const searchParams = useSearchParams()
	const loanId = params?.id ?? ""

	const amount = Number(searchParams.get("amount") ?? 0)
	const method = searchParams.get("method") ?? "wallet"
	const reference = searchParams.get("reference") ?? ""

	const [outstandingBalance, setOutstandingBalance] = useState<number | null>(null)
	const [issuedAt] = useState(() => new Date())

	useEffect(() => {
		let mounted = true

		const loadLoan = async () => {
			try {
				const loan = await fetchLoanDetails(loanId)
				if (!mounted) return
				const repayments = loan.repayments ?? []
				const totalRepaid = repayments.reduce((sum, repayment) => sum + (repayment.amount ?? 0), 0)
				const balance = Math.max((loan.total_amount ?? loan.amount ?? 0) - totalRepaid, 0)
				setOutstandingBalance(balance)
			} catch (err) {
				console.error("Unable to refresh loan balance", err)
			}
		}

		if (loanId) {
			loadLoan()
		}

		return () => {
			mounted = false
		}
	}, [loanId])

	const paymentMethodLabel: Record<string, string> = {
		wallet: "Wallet Balance",
		card: "Debit/Credit Card",
		bank_transfer: "Bank Transfer",
	}

  return (
		<div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-8 text-center">
				<div className="mb-6 flex justify-center">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

				<h1 className="text-3xl font-bold">Payment Successful</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Your loan repayment has been recorded successfully.
				</p>

				<div className="mt-8 space-y-3 rounded-lg bg-muted p-6 text-left text-sm">
					<h3 className="text-base font-semibold">Payment Details</h3>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Loan ID</span>
						<span className="font-medium">{loanId}</span>
          </div>
					{reference ? (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Reference</span>
							<span className="font-medium">{reference}</span>
          </div>
					) : null}
					<div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid</span>
						<span className="font-medium">{currency.format(amount)}</span>
          </div>
					<div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
						<span className="font-medium capitalize">{paymentMethodLabel[method] ?? method}</span>
          </div>
					<div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
						<span className="font-medium">{new Date().toLocaleString()}</span>
          </div>
					<div className="flex justify-between border-t pt-3 text-base font-semibold">
						<span>Outstanding Balance</span>
						<span>{outstandingBalance !== null ? currency.format(outstandingBalance) : "Updating..."}</span>
          </div>
        </div>

				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<ReceiptDownloadButton
						variant="outline"
						className="flex-1 bg-transparent"
						data={{
							title: "Loan Repayment Receipt",
							subtitle: `Loan #${loanId}`,
							amount,
							currency: "NGN",
							status: "Successful",
							paymentMethod: paymentMethodLabel[method] ?? method,
							reference,
							date: issuedAt.toISOString(),
							items: [
								{ label: "Loan ID", value: loanId },
								{
									label: "Outstanding Balance",
									value:
										outstandingBalance !== null
											? currency.format(outstandingBalance)
											: "Updating balance...",
								},
							],
							footerNote:
								"Thank you for staying committed to your repayment schedule. Keep this receipt for your records.",
						}}
						buttonLabel="Download Receipt"
					/>
					<Link href={`/dashboard/loans/${loanId}`} className="flex-1">
            <Button className="w-full">
							<ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loan Details
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
