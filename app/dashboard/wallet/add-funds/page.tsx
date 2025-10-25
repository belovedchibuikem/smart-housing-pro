"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreditCard, Building2, Smartphone, ArrowLeft, CheckCircle2, Wallet, Copy, Check } from "lucide-react"
import { toast } from "sonner"

export default function AddFundsPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank")
  const [loading, setLoading] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const quickAmounts = [5000, 10000, 25000, 50000, 100000]

  // Cooperative bank account details
  const bankDetails = {
    bankName: "First Bank of Nigeria",
    accountName: "FRSC Housing Cooperative Society",
    accountNumber: "2034567890",
    sortCode: "011",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(`${field} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) {
      toast.error("Please enter an amount")
      return
    }

    if (paymentMethod === "bank") {
      setShowBankDetails(true)
      return
    }

    // For other payment methods, proceed with payment
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push("/dashboard/wallet?success=true")
    }, 2000)
  }

  const handleConfirmPayment = () => {
    setShowBankDetails(false)
    setShowConfirmation(true)
  }

  const handleFinalConfirmation = () => {
    setLoading(true)
    // Simulate submission to accounts department
    setTimeout(() => {
      setLoading(false)
      setShowConfirmation(false)
      toast.success("Payment confirmation submitted! Awaiting verification from accounts department.")
      router.push("/dashboard/wallet")
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Wallet
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Funds</h1>
        <p className="text-muted-foreground mt-2">Top up your wallet balance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Amount</CardTitle>
            <CardDescription>How much would you like to add to your wallet?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant={amount === quickAmount.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to fund your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label htmlFor="paystack" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Paystack</p>
                      <p className="text-sm text-muted-foreground">Pay with card via Paystack</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="remita" id="remita" />
                  <Label htmlFor="remita" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Remita</p>
                      <p className="text-sm text-muted-foreground">Pay via Remita gateway</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Debit/Credit Card</p>
                      <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or Verve</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Bank Transfer (Recommended)</p>
                      <p className="text-sm text-muted-foreground">Transfer to cooperative account</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="ussd" id="ussd" />
                  <Label htmlFor="ussd" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">USSD</p>
                      <p className="text-sm text-muted-foreground">Pay using your phone</p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {paymentMethod === "bank" && (
              <Alert className="mt-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  You will receive the cooperative bank account details to complete your transfer. After payment, you
                  can confirm to trigger receipt issuance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Your payment is secure and encrypted. Funds will be credited to your wallet after verification by the
            accounts department.
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={!amount || loading} className="flex-1">
            {loading ? "Processing..." : "Continue"}
          </Button>
        </div>
      </form>

      <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Transfer Details</DialogTitle>
            <DialogDescription>
              Transfer ₦{amount ? Number.parseInt(amount).toLocaleString() : "0"} to the account below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-semibold">{bankDetails.bankName}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}>
                    {copiedField === "Bank Name" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-semibold">{bankDetails.accountName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                  >
                    {copiedField === "Account Name" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-semibold text-lg">{bankDetails.accountNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                  >
                    {copiedField === "Account Number" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount to Transfer</p>
                    <p className="font-bold text-xl text-primary">
                      ₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                After making the transfer, click "I have paid" to notify the accounts department for verification.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowBankDetails(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} className="w-full sm:w-auto">
              I have paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please confirm that you have completed the bank transfer of ₦
              {amount ? Number.parseInt(amount).toLocaleString() : "0"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                By confirming, you are notifying the accounts department that you have made the payment. They will
                verify and issue a receipt once confirmed.
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Transferred:</span>
                    <span className="font-semibold">₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-semibold">{bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-semibold">{bankDetails.accountNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalConfirmation} disabled={loading}>
              {loading ? "Submitting..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
