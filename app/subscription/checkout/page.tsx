"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Building2, Smartphone, Wallet, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const packageId = searchParams.get("package")
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [isProcessing, setIsProcessing] = useState(false)

  const packages = {
    "1": { name: "Weekly Basic", price: 500, duration: "7 days" },
    "2": { name: "Monthly Standard", price: 1500, duration: "30 days" },
    "3": { name: "Quarterly Premium", price: 4000, duration: "90 days" },
    "4": { name: "Yearly Elite", price: 15000, duration: "365 days" },
  }

  const selectedPackage = packages[packageId as keyof typeof packages]

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id", // TODO: Get from auth context
          packageId,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (paymentMethod === "wallet") {
          // Wallet payment is instant
          toast.success("Payment successful!")
          router.push("/subscription/success")
        } else {
          // Redirect to payment gateway
          if (data.paymentUrl) {
            window.location.href = data.paymentUrl
          } else {
            toast.error("Payment URL not provided")
          }
        }
      } else {
        toast.error(data.error || "Payment initialization failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("An error occurred during payment")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!selectedPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Package</CardTitle>
            <CardDescription>The selected package could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/subscription">
              <Button>View Packages</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/subscription">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
            <p className="text-muted-foreground">Choose your payment method and subscribe</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <Label htmlFor="paystack" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Paystack</div>
                        <div className="text-sm text-muted-foreground">Pay with card via Paystack</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="remita" id="remita" />
                    <Label htmlFor="remita" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Remita</div>
                        <div className="text-sm text-muted-foreground">Pay via Remita gateway</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-muted-foreground">Direct bank transfer</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="ussd" id="ussd" />
                    <Label htmlFor="ussd" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">USSD</div>
                        <div className="text-sm text-muted-foreground">Pay with USSD code</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Wallet</div>
                        <div className="text-sm text-muted-foreground">Pay from your wallet balance</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Package</div>
                  <div className="font-medium">{selectedPackage.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{selectedPackage.duration}</div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-bold">₦{selectedPackage.price.toLocaleString()}</span>
                  </div>
                  <Button onClick={handlePayment} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Payment"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
