"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewStatutoryChargePage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("online")
  const [selectedCharge, setSelectedCharge] = useState("")

  const charges = [
    { value: "tdp", label: "Title Document Processing (TDP)", amount: "₦150,000" },
    { value: "building", label: "Building Plan Approval", amount: "₦75,000" },
    { value: "alteration", label: "Property Alteration Fee", amount: "₦50,000" },
    { value: "development", label: "Development Levy", amount: "₦100,000" },
    { value: "survey", label: "Survey and Demarcation", amount: "₦200,000" },
    { value: "environmental", label: "Environmental Impact Assessment", amount: "₦300,000" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    router.push("/dashboard/statutory-charges")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/statutory-charges">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Statutory Payment</h1>
          <p className="text-muted-foreground mt-1">Make a payment for statutory charges</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Select the charge type and provide payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Charge Type */}
            <div className="space-y-2">
              <Label htmlFor="charge-type">Charge Type *</Label>
              <Select value={selectedCharge} onValueChange={setSelectedCharge} required>
                <SelectTrigger id="charge-type">
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  {charges.map((charge) => (
                    <SelectItem key={charge.value} value={charge.value}>
                      {charge.label} - {charge.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Reference */}
            <div className="space-y-2">
              <Label htmlFor="property-ref">Property Reference Number</Label>
              <Input id="property-ref" placeholder="e.g., PROP-2024-001" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description/Notes</Label>
              <Textarea id="description" placeholder="Add any additional information about this payment" rows={3} />
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method *</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="font-normal cursor-pointer">
                    Online Payment (Card/Bank Transfer)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="font-normal cursor-pointer">
                    Cash Payment (Upload Evidence)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                <Label htmlFor="payment-evidence">Payment Evidence *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload payment receipt</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
                  <Input id="payment-evidence" type="file" className="hidden" accept="image/*,.pdf" />
                </div>
                <p className="text-xs text-muted-foreground">Upload bank teller, receipt, or proof of payment</p>
              </div>
            )}

            {/* Amount Display */}
            {selectedCharge && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-primary">
                    {charges.find((c) => c.value === selectedCharge)?.amount}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {paymentMethod === "online" ? "Proceed to Payment" : "Submit for Verification"}
              </Button>
              <Link href="/dashboard/statutory-charges" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
