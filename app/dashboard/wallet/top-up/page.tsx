"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Building2, Smartphone, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function WalletTopUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank")
  const [paymentEvidence, setPaymentEvidence] = useState<File | null>(null)

  const quickAmounts = [10000, 25000, 50000, 100000]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentEvidence(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const generatedReference = `WALLET-TOPUP-${Date.now()}`
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
          reference: generatedReference,
          metadata: {
            type: "wallet_topup",
            description: `Wallet top-up of ₦${Number(amount).toLocaleString()}`,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (paymentMethod === "card" && data.data.authorizationUrl) {
          // Redirect to Paystack payment page
          window.location.href = data.data.authorizationUrl
        } else if (paymentMethod === "bank") {
          // For bank transfer, redirect to success page
          const params = new URLSearchParams()
          params.set("reference", generatedReference)
          params.set("method", paymentMethod)
          const numericAmount = Number(amount)
          if (Number.isFinite(numericAmount) && numericAmount > 0) {
            params.set("amount", String(numericAmount))
          }
          router.push(`/dashboard/wallet/top-up/success?${params.toString()}`)
        } else if (paymentMethod === "remita" && data.data.rrr) {
          // Show RRR to user for Remita payment
          alert(`Your RRR is: ${data.data.rrr}. Please complete payment using this RRR.`)
          const params = new URLSearchParams()
          params.set("reference", data.data.rrr)
          params.set("method", paymentMethod)
          const numericAmount = Number(amount)
          if (Number.isFinite(numericAmount) && numericAmount > 0) {
            params.set("amount", String(numericAmount))
          }
          router.push(`/dashboard/wallet/top-up/success?${params.toString()}`)
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Top Up Wallet</h1>
          <p className="text-muted-foreground mt-1">Add funds to your wallet for contributions and payments</p>
        </div>
        <Link href="/dashboard/contributions">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Top-Up Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Transfer to cooperative account</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Debit/Credit Card (Paystack)</p>
                      <p className="text-sm text-muted-foreground">Pay instantly with your card</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="remita" id="remita" />
                  <Label htmlFor="remita" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Remita</p>
                      <p className="text-sm text-muted-foreground">Pay via Remita payment gateway</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="ussd" id="ussd" />
                  <Label htmlFor="ussd" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">USSD</p>
                      <p className="text-sm text-muted-foreground">Pay via USSD code</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "bank" && (
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
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
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please upload payment evidence after making the transfer
                  </p>
                </div>
              </Card>
            )}

            {paymentMethod === "bank" && (
              <div className="space-y-2">
                <Label htmlFor="evidence">Payment Evidence (Required for Bank Transfer)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {paymentEvidence ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">{paymentEvidence.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPaymentEvidence(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload bank transfer receipt or screenshot</p>
                      <Input
                        id="evidence"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="max-w-xs mx-auto"
                        required={paymentMethod === "bank"}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea id="note" placeholder="Add a note for this transaction" />
            </div>
          </div>
        </Card>

        {amount && (
          <Card className="p-6 bg-muted/50">
            <div className="space-y-3">
              <h3 className="font-semibold">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top-Up Amount</span>
                  <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium">₦0</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₦{Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !amount || (paymentMethod === "bank" && !paymentEvidence)}
        >
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </Button>
      </form>
    </div>
  )
}
