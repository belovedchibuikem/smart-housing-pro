"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"
import { verifyWalletFunding } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { ReceiptDownloadButton } from "@/components/payments/receipt-download-button"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const reference = searchParams.get('reference')
  const provider = searchParams.get('provider')
  const amountParam = searchParams.get('amount')
  const amount = amountParam ? Number(amountParam) : undefined
  const issuedAt = useMemo(() => new Date(), [])
  const paymentMethodLabel = useMemo(() => {
    if (!provider) return "Not specified"
    return provider.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  }, [provider])
  
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Only verify for gateway payments (not wallet or manual)
    if (provider && provider !== 'wallet' && provider !== 'manual' && reference) {
      setVerifying(true)
      verifyWalletFunding(provider, reference)
        .then((response) => {
          setVerified(response.success)
          setMessage(response.message || 'Payment verified successfully')
          if (response.success) {
            toast({
              title: "Success",
              description: "Wallet funded successfully!",
            })
          }
        })
        .catch((error: any) => {
          setVerified(false)
          setMessage(error.message || 'Payment verification failed')
        })
        .finally(() => {
          setVerifying(false)
        })
    } else if (provider === 'manual') {
      setVerified(true)
      setMessage("Your payment request has been submitted. It will be reviewed and your wallet will be credited once approved.")
    } else if (provider === 'wallet') {
      setVerified(true)
      setMessage("Wallet funded successfully!")
    }
  }, [reference, provider, toast])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link href="/dashboard/wallet">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallet
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Payment Status</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          {verifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Verifying Payment...</h3>
              <p className="text-muted-foreground text-center">
                Please wait while we verify your payment
              </p>
            </div>
          ) : verified === true ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground text-center mb-4">
                {message}
              </p>
              {reference && (
                <p className="text-sm text-muted-foreground">
                  Reference: {reference}
                </p>
              )}
              <div className="mt-6 w-full">
                <ReceiptDownloadButton
                  className="w-full justify-center"
                  variant="outline"
                  disabled={!reference && amount === undefined}
                  data={{
                    title: "Wallet Funding Receipt",
                    subtitle: "Wallet Credit Confirmation",
                    amount,
                    currency: "NGN",
                    paymentMethod: paymentMethodLabel,
                    status: provider === "manual" ? "Pending Verification" : "Successful",
                    reference: reference ?? "Pending",
                    date: issuedAt.toISOString(),
                    items: [
                      { label: "Provider", value: paymentMethodLabel },
                      { label: "Issued On", value: issuedAt.toLocaleString() },
                    ],
                    footerNote:
                      provider === "manual"
                        ? "Your payment evidence is under review. Funds will appear in your wallet once verification is complete."
                        : "Thank you for funding your wallet. Keep this receipt as proof of payment or present it to support if required.",
                  }}
                  buttonLabel="Download Receipt"
                />
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link href="/dashboard/wallet">
                    <Wallet className="h-4 w-4 mr-2" />
                    View Wallet
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/wallet/fund">
                    Fund Again
                  </Link>
                </Button>
              </div>
            </div>
          ) : verified === false ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription>
                {message || "Your payment could not be verified. Please contact support if you have already made the payment."}
              </AlertDescription>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/wallet/fund">
                    Try Again
                  </Link>
                </Button>
              </div>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default function WalletFundSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}




