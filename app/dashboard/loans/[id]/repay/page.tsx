"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Building2, Smartphone, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoanRepaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [amount, setAmount] = useState("125000")
  const [isLoading, setIsLoading] = useState(false)

  const monthlyPayment = 125000
  const outstandingBalance = 4375000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Initialize payment
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          email: "user@example.com", // TODO: Get from user session
          paymentMethod,
          reference: `LOAN-REPAY-${params.id}-${Date.now()}`,
          metadata: {
            loanId: params.id,
            type: "loan_repayment",
            description: `Loan repayment for loan ${params.id}`,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (paymentMethod === "card" && data.data.authorizationUrl) {
          // Redirect to Paystack payment page
          window.location.href = data.data.authorizationUrl
        } else if (paymentMethod === "wallet" || paymentMethod === "bank") {
          // Redirect to success page for wallet/bank payments
          router.push(`/dashboard/loans/${params.id}/repay/success`)
        } else if (paymentMethod === "remita" && data.data.rrr) {
          // Show RRR to user for Remita payment
          alert(`Your RRR is: ${data.data.rrr}. Please complete payment using this RRR.`)
          router.push(`/dashboard/loans/${params.id}/repay/success`)
        }
      } else {
        alert(data.message || "Payment initialization failed")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      alert("An error occurred while processing your payment")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/dashboard/loans/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loan Details
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Make Loan Payment</h1>
        <p className="text-muted-foreground mt-1">Loan ID: {params.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Amount</CardTitle>
            <CardDescription>Enter the amount you want to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAmount(monthlyPayment.toString())}>
                Monthly Payment (₦{monthlyPayment.toLocaleString()})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(outstandingBalance.toString())}
              >
                Full Balance (₦{outstandingBalance.toLocaleString()})
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding Balance</span>
                <span className="font-medium">₦{outstandingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold">New Balance</span>
                <span className="font-bold">₦{(outstandingBalance - Number(amount)).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to make this payment</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Debit/Credit Card (Paystack)</div>
                      <div className="text-sm text-muted-foreground">Pay with your card via Paystack</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="remita" id="remita" />
                  <Label htmlFor="remita" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Remita</div>
                      <div className="text-sm text-muted-foreground">Pay via Remita payment gateway</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-muted-foreground">Transfer to cooperative account</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Wallet Balance</div>
                      <div className="text-sm text-muted-foreground">Pay from your wallet (₦250,000 available)</div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {paymentMethod === "bank" && (
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
                <p className="text-sm font-medium">Bank Transfer Details:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-medium">First Bank of Nigeria</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-medium">1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-medium">FRSC Housing Cooperative</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="evidence">Upload Payment Evidence</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload receipt or screenshot</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG (max 5MB)</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || !amount}>
            {isLoading ? "Processing..." : "Make Payment"}
          </Button>
        </div>
      </form>
    </div>
  )
}
