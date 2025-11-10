"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { ReceiptDownloadButton } from "@/components/payments/receipt-download-button"

export default function TransferSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? "TXN-2024-001235"
  const recipient = searchParams.get("recipient") ?? "FRSC-HMS-12345"
  const amountParam = searchParams.get("amount")
  const amount = amountParam ? Number(amountParam) : 25000
  const issuedAt = useMemo(() => new Date(), [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Transfer Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your funds have been successfully transferred to the recipient's wallet.
        </p>

        <Card className="p-6 bg-muted/50 text-left mb-6">
          <h3 className="font-semibold mb-4">Transfer Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-medium">{reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recipient ID</span>
              <span className="font-medium">{recipient}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Transferred</span>
              <span className="font-medium">
                ₦{Number.isFinite(amount) ? Number(amount).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{issuedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </Card>

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
              title: "Wallet Transfer Receipt",
              subtitle: `Sent to ${recipient}`,
              amount,
              currency: "NGN",
              status: "Successful",
              paymentMethod: "Wallet Transfer",
              reference,
              date: issuedAt.toISOString(),
              items: [
                { label: "Recipient", value: recipient },
                { label: "Issued On", value: issuedAt.toLocaleString() },
              ],
              footerNote:
                "Wallet transfers are instant and irreversible. Please contact support immediately if you suspect an error.",
            }}
          />
        </div>
      </Card>
    </div>
  )
}
