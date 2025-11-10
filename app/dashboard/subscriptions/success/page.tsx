"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { verifyMemberSubscription } from "@/lib/api/client"
import { ReceiptDownloadButton } from "@/components/payments/receipt-download-button"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')
  const provider = searchParams.get('provider') || 'paystack'
  const plan = searchParams.get("plan") ?? "Subscription Plan"
  const amountParam = searchParams.get("amount")
  const amount = amountParam ? Number(amountParam) : undefined
  const issuedAt = useMemo(() => new Date(), [])
  
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found")
      setIsVerifying(false)
      return
    }

    // Verify the payment (skip for wallet and manual payments)
    const verify = async () => {
      if (provider === 'wallet' || provider === 'manual') {
        // Wallet and manual payments don't need verification
        setIsSuccess(true)
        setIsVerifying(false)
        return
      }

      try {
        const response = await verifyMemberSubscription(provider, reference)
        if (response.success) {
          setIsSuccess(true)
        } else {
          setError(response.message || "Payment verification failed")
        }
      } catch (err: any) {
        console.error("Verification error:", err)
        setError(err.message || "Failed to verify payment")
      } finally {
        setIsVerifying(false)
      }
    }

    verify()
  }, [reference, provider])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Payment</CardTitle>
          <CardDescription>Processing your subscription payment</CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying your payment...</p>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground text-center mb-6">
                Your subscription has been activated successfully. You now have access to all features.
              </p>
              <div className="w-full mb-6">
                <ReceiptDownloadButton
                  variant="outline"
                  className="w-full justify-center"
                  disabled={!reference}
                  data={{
                    title: "Subscription Payment Receipt",
                    subtitle: plan,
                    amount,
                    currency: "NGN",
                    status: "Successful",
                    paymentMethod: provider.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
                    reference: reference ?? "Pending",
                    date: issuedAt.toISOString(),
                    items: [
                      { label: "Plan", value: plan },
                      { label: "Issued On", value: issuedAt.toLocaleString() },
                    ],
                    footerNote:
                      "Keep this receipt as proof of your subscription payment. Contact support if you need assistance with your plan.",
                  }}
                />
              </div>
              <div className="flex gap-4">
                <Link href="/dashboard/subscriptions">
                  <Button>View My Subscriptions</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <p className="text-muted-foreground text-center mb-6">
                We couldn't process your payment. Please try again or contact support if the issue persists.
              </p>
              <div className="flex gap-4">
                <Link href="/subscription">
                  <Button>Try Again</Button>
                </Link>
                <Link href="/dashboard/subscriptions">
                  <Button variant="outline">View Subscriptions</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

