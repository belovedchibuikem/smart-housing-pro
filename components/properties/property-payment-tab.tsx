"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, CreditCard, Building2, Users, Receipt, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function PropertyPaymentTab() {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [fundingType, setFundingType] = useState<string>("single")

  // Mock data
  const property = {
    price: 25000000,
    name: "Luxury 3-Bedroom Apartment",
  }

  const paymentHistory = [
    { id: 1, date: "2024-01-15", amount: 10000000, method: "Cash", status: "Verified", receipt: "RCP-001" },
    { id: 2, date: "2024-02-15", amount: 5000000, method: "Cooperative", status: "Verified", receipt: "RCP-002" },
    { id: 3, date: "2024-03-15", amount: 5000000, method: "Cash", status: "Pending", receipt: "RCP-003" },
  ]

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = property.price - totalPaid
  const progress = (totalPaid / property.price) * 100

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Track your payment progress for {property.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Price</div>
              <div className="text-2xl font-bold">₦{property.price.toLocaleString()}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Amount Paid</div>
              <div className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-2xl font-bold text-orange-600">₦{balance.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {progress === 100 && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Payment Complete!</div>
                <div className="text-sm text-green-700">
                  Your certificate of payment completion is ready for download.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Make Payment */}
      {balance > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>Choose your payment method and funding type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Funding Type */}
            <div className="space-y-3">
              <Label>Funding Type</Label>
              <RadioGroup value={fundingType} onValueChange={setFundingType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer">
                    Single Payment Method
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed" className="font-normal cursor-pointer">
                    Mixed Funding (Cash + Cooperative Deduction)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                    <CreditCard className="h-4 w-4" />
                    Cash Payment (with evidence upload)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="mortgage" id="mortgage" />
                  <Label htmlFor="mortgage" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                    <Building2 className="h-4 w-4" />
                    Mortgage
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="cooperative" id="cooperative" />
                  <Label htmlFor="cooperative" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                    <Users className="h-4 w-4" />
                    Cooperative Deduction
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Forms */}
            {paymentMethod === "cash" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input id="amount" type="number" placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evidence">Upload Payment Evidence</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Click to upload payment evidence (receipt, bank statement, etc.)
                    </div>
                  </div>
                </div>
                <Button className="w-full">Submit Payment Evidence</Button>
              </div>
            )}

            {paymentMethod === "mortgage" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="mortgage-house">Mortgage House</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mortgage provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fmbn">Federal Mortgage Bank of Nigeria</SelectItem>
                      <SelectItem value="abbey">Abbey Mortgage Bank</SelectItem>
                      <SelectItem value="infinity">Infinity Trust Mortgage Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input id="interest-rate" type="number" placeholder="e.g., 12.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Loan Duration (Years)</Label>
                  <Input id="duration" type="number" placeholder="e.g., 20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down Payment</Label>
                  <Input id="down-payment" type="number" placeholder="Enter down payment amount" />
                </div>
                <Button className="w-full">Apply for Mortgage</Button>
              </div>
            )}

            {paymentMethod === "cooperative" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="monthly-deduction">Monthly Deduction Amount</Label>
                  <Input id="monthly-deduction" type="number" placeholder="Enter monthly deduction" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration-months">Duration (Months)</Label>
                  <Input id="duration-months" type="number" placeholder="e.g., 24" />
                </div>
                <Button className="w-full">Setup Cooperative Deduction</Button>
              </div>
            )}

            {fundingType === "mixed" && (
              <div className="p-4 border-2 border-dashed rounded-lg bg-blue-50">
                <div className="text-sm font-semibold mb-2">Mixed Funding Setup</div>
                <div className="text-sm text-muted-foreground mb-4">
                  You can combine cash payment with cooperative deduction. Set up both payment methods above.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Cash Portion</Label>
                    <Input type="number" placeholder="Amount" />
                  </div>
                  <div>
                    <Label className="text-xs">Cooperative Portion</Label>
                    <Input type="number" placeholder="Amount" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All your payment transactions for this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">₦{payment.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.method} • {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={payment.status === "Verified" ? "default" : "secondary"}>{payment.status}</Badge>
                  <Button variant="outline" size="sm">
                    View Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
