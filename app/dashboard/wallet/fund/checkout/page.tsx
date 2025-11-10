"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CreditCard, Building2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { initializeWalletFunding } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')
  
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!amount || !method) {
      router.push('/dashboard/wallet/fund')
    }
  }, [amount, method, router])

  const handlePayment = async () => {
    if (!amount || !method) {
      setError("Missing payment information")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await initializeWalletFunding({
        amount: parseFloat(amount),
        payment_method: method!,
        notes: notes || undefined,
      })

      if (response.success) {
        if (response.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = response.paymentUrl
        } else {
          setError("Payment URL not received. Please try again.")
          setIsProcessing(false)
        }
      } else {
        setError(response.message || "Failed to initialize payment")
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error("Error initializing payment:", err)
      setError(err.message || "Failed to process payment")
      setIsProcessing(false)
    }
  }

  const getMethodInfo = () => {
    switch (method) {
      case 'paystack':
        return {
          name: 'Paystack',
          description: 'Pay with card, bank transfer, or USSD',
          icon: CreditCard,
        }
      case 'remita':
        return {
          name: 'Remita',
          description: 'Pay via Remita payment gateway',
          icon: Building2,
        }
      case 'stripe':
        return {
          name: 'Stripe',
          description: 'Pay with Stripe payment gateway',
          icon: CreditCard,
        }
      default:
        return {
          name: 'Payment Gateway',
          description: 'Complete your payment',
          icon: CreditCard,
        }
    }
  }

  const methodInfo = getMethodInfo()
  const Icon = methodInfo.icon

  if (!amount || !method) {
    return null
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link href="/dashboard/wallet/fund">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Complete Payment</h1>
        <p className="text-muted-foreground">Review and confirm your payment details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{methodInfo.name}</CardTitle>
              <CardDescription>{methodInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount to Fund:</span>
              <span className="text-2xl font-bold">{formatCurrency(parseFloat(amount))}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium">{methodInfo.name}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Instructions */}
          {method === 'paystack' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to Paystack to complete your payment. You can pay with your debit card, bank transfer, or USSD.
              </AlertDescription>
            </Alert>
          )}

          {method === 'remita' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to Remita to complete your payment. Follow the instructions on the Remita page.
              </AlertDescription>
            </Alert>
          )}

          {method === 'stripe' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to Stripe to complete your payment. You can pay with your card or other supported methods.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to {methodInfo.name}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WalletFundCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}




