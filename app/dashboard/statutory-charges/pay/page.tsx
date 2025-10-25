"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Building2, FileText } from "lucide-react"
import Link from "next/link"

export default function PayStatutoryChargePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedType = searchParams.get("type")

  const [formData, setFormData] = useState({
    chargeType: preselectedType || "",
    propertyId: "",
    amount: "",
    paymentMethod: "card",
    description: "",
  })

  const chargeTypes = [
    { id: "1", name: "Title Document Processing (TDP)", amount: 50000 },
    { id: "2", name: "Building Plan Approval", amount: 75000 },
    { id: "3", name: "Building Alteration Fee", amount: 35000 },
    { id: "4", name: "Property Survey Fee", amount: 45000 },
    { id: "5", name: "Development Levy", amount: 100000 },
  ]

  const selectedCharge = chargeTypes.find((c) => c.id === formData.chargeType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle payment submission
    console.log("Payment submitted:", formData)
    router.push("/dashboard/statutory-charges/history")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/statutory-charges">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pay Statutory Charge</h1>
          <p className="text-muted-foreground mt-1">Complete payment for statutory charges</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Charge Details</CardTitle>
            <CardDescription>Select the type of charge you want to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chargeType">Charge Type *</Label>
              <Select
                value={formData.chargeType}
                onValueChange={(value) => setFormData({ ...formData, chargeType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  {chargeTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - ₦{type.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCharge && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount to Pay</span>
                  <span className="text-2xl font-bold text-primary">₦{selectedCharge.amount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID (Optional)</Label>
              <Input
                id="propertyId"
                placeholder="Enter property ID if applicable"
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional notes"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Card Payment</div>
                    <div className="text-sm text-muted-foreground">Pay with debit/credit card</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Building2 className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Wallet Balance</div>
                    <div className="text-sm text-muted-foreground">Pay from your wallet</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">Transfer to our account</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/dashboard/statutory-charges">Cancel</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={!formData.chargeType}>
            Proceed to Payment
          </Button>
        </div>
      </form>
    </div>
  )
}
