"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Home } from "lucide-react"
import { ReceiptDownloadButton } from "@/components/payments/receipt-download-button"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
})

export default function ContributionSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const amountParam = searchParams.get("amount")
  const methodParam = searchParams.get("method")
  const statusParam = searchParams.get("status")
  const infoParam = searchParams.get("info")

  const amount = amountParam ? Number(amountParam) : null
  const hasAmount = amount !== null && Number.isFinite(amount)
  const formattedAmount = hasAmount ? currencyFormatter.format(amount!) : "Pending"
  const method =
    methodParam?.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Not specified"
  const status = statusParam ?? "success"
  const awaitingApproval = status === "awaiting_approval"

  const issuedAt = useMemo(() => new Date(), [])
  const timestamp = issuedAt.toLocaleString()
  const description = awaitingApproval
    ? infoParam ?? "Your payment has been submitted and is awaiting confirmation by the administrator."
    : "Thank you! Your contribution has been received successfully."

  return (
    <div className="min-h-[60vh] bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl space-y-8 p-8 md:p-12">
        <div className="flex justify-center">
          <div
            className={[
              "h-20 w-20 rounded-full flex items-center justify-center",
              awaitingApproval
                ? "bg-amber-100 dark:bg-amber-900/20"
                : "bg-green-100 dark:bg-green-900/20",
            ].join(" ")}
          >
            {awaitingApproval ? (
              <Clock className="h-10 w-10 text-amber-600 dark:text-amber-500" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {awaitingApproval ? "Payment Submitted" : "Contribution Recorded"}
          </h1>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction Reference</span>
            <span className="font-medium">{reference ?? "Will be available shortly"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">{method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span
              className={
                awaitingApproval ? "font-medium text-amber-600" : "font-medium text-green-600"
              }
            >
              {awaitingApproval ? "Awaiting admin confirmation" : "Completed"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{timestamp}</span>
          </div>
        </div>

        <ReceiptDownloadButton
          variant="outline"
          className="w-full justify-center"
          disabled={!reference && !hasAmount}
          data={{
            title: "Contribution Receipt",
            subtitle: awaitingApproval ? "Payment Submitted" : "Contribution Payment",
            amount: hasAmount ? amount ?? undefined : undefined,
            currency: "NGN",
            paymentMethod: method,
            status: awaitingApproval ? "Pending Confirmation" : "Successful",
            reference: reference ?? "Pending",
            date: issuedAt.toISOString(),
            items: [
              { label: "Status", value: awaitingApproval ? "Awaiting admin confirmation" : "Completed" },
              { label: "Issued On", value: timestamp },
            ],
            footerNote:
              "Thank you for supporting our cooperative. This receipt confirms your contribution and can be presented to finance for verification.",
          }}
        />

        <div className="space-y-3">
          <Link href="/dashboard/contributions" className="block">
            <Button className="w-full" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Contributions
            </Button>
          </Link>
          <Link href="/dashboard" className="block">
            <Button variant="ghost" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
