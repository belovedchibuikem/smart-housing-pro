"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Building2, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"

export function NewContributionForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank")

  const quickAmounts = [50000, 100000, 200000, 500000]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implement actual payment processing
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/contributions/success")
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount</Label>
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
                    <p className="text-sm text-muted-foreground">Transfer from your bank account</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-4">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Debit/Credit Card (Paystack)</p>
                    <p className="text-sm text-muted-foreground">Pay with your card</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-4">
                <RadioGroupItem value="remita" id="remita" />
                <Label htmlFor="remita" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Remita</p>
                    <p className="text-sm text-muted-foreground">Pay via Remita gateway</p>
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

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea id="note" placeholder="Add a note for this contribution" />
          </div>
        </div>
      </Card>

      {amount && (
        <Card className="p-6 bg-muted/50">
          <div className="space-y-3">
            <h3 className="font-semibold">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contribution Amount</span>
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

      <Button type="submit" className="w-full" size="lg" disabled={isLoading || !amount}>
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </Button>
    </form>
  )
}
