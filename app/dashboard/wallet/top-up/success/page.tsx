"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { ReceiptDownloadButton } from "@/components/payments/receipt-download-button"

export default function TopUpSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? "TXN-2024-001234"
  const amountParam = searchParams.get("amount")
  const amount = amountParam ? Number(amountParam) : 50000
  const method = searchParams.get("method") ?? "Bank Transfer"
  const issuedAt = useMemo(() => new Date(), [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Top-Up Submitted Successfully!</h1>
        <p className="text-muted-foreground mb-8">
          Your wallet top-up request has been received and is being processed.
        </p>

        <Card className="p-6 bg-muted/50 text-left mb-6">
          <h3 className="font-semibold mb-4">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-medium">{reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ₦{Number.isFinite(amount) ? Number(amount).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{issuedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-yellow-600">Pending Verification</span>
            </div>
          </div>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Your payment evidence is being reviewed. Funds will be credited to your wallet within 24 hours after
            verification.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/wallet" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Button>
          </Link>
          <ReceiptDownloadButton
            className="flex-1"
            data={{
              title: "Wallet Top-Up Receipt",
              subtitle: "Top-Up Submitted",
              amount,
              currency: "NGN",
              status: "Pending Verification",
              paymentMethod: method,
              reference,
              date: issuedAt.toISOString(),
              items: [
                { label: "Issued On", value: issuedAt.toLocaleString() },
                { label: "Current Status", value: "Pending verification" },
              ],
              footerNote:
                "Your proof of payment is under review. Funds will appear in your wallet once verification is complete.",
            }}
          />
        </div>
      </Card>
    </div>
  )
}
