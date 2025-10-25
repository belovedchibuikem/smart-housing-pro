"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateMortgagePage() {
  const [formData, setFormData] = useState({
    memberId: "",
    propertyId: "",
    propertyValue: "",
    downPayment: "",
    loanAmount: "",
    interestRate: "",
    tenure: "",
    monthlyPayment: "",
    mortgageProvider: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating mortgage:", formData)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/mortgages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Mortgage</h1>
          <p className="text-muted-foreground mt-1">Set up a new mortgage agreement for a member</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Details</CardTitle>
            <CardDescription>Enter the mortgage information and terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID *</Label>
                <Input
                  id="memberId"
                  placeholder="FRSC/HMS/2024/001"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyId">Property ID *</Label>
                <Input
                  id="propertyId"
                  placeholder="PROP-2024-001"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyValue">Property Value (₦) *</Label>
                <Input
                  id="propertyValue"
                  type="number"
                  placeholder="15000000"
                  value={formData.propertyValue}
                  onChange={(e) => setFormData({ ...formData, propertyValue: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment (₦) *</Label>
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="3000000"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount (₦) *</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="12000000"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  placeholder="6.5"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure">Tenure *</Label>
                <Select value={formData.tenure} onValueChange={(value) => setFormData({ ...formData, tenure: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="25">25 years</SelectItem>
                    <SelectItem value="30">30 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyPayment">Monthly Payment (₦) *</Label>
                <Input
                  id="monthlyPayment"
                  type="number"
                  placeholder="250000"
                  value={formData.monthlyPayment}
                  onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mortgageProvider">Mortgage Provider</Label>
                <Input
                  id="mortgageProvider"
                  placeholder="Federal Mortgage Bank of Nigeria"
                  value={formData.mortgageProvider}
                  onChange={(e) => setFormData({ ...formData, mortgageProvider: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this mortgage..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/mortgages">Cancel</Link>
              </Button>
              <Button type="submit">Create Mortgage</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
