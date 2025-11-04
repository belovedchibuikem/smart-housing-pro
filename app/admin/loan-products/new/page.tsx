"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

export default function NewLoanProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_amount: "",
    max_amount: "",
    interest_rate: "",
    min_tenure_months: "",
    max_tenure_months: "",
    interest_type: "simple",
    processing_fee_percentage: "",
    late_payment_fee: "",
    eligibility_criteria: [] as string[],
    required_documents: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiFetch<{ success: boolean; message?: string; data?: any }>(
        '/admin/loan-products',
        {
          method: 'POST',
          body: {
            ...formData,
            min_amount: parseFloat(formData.min_amount),
            max_amount: parseFloat(formData.max_amount),
            interest_rate: parseFloat(formData.interest_rate),
            min_tenure_months: parseInt(formData.min_tenure_months),
            max_tenure_months: parseInt(formData.max_tenure_months),
            processing_fee_percentage: formData.processing_fee_percentage ? parseInt(formData.processing_fee_percentage) : null,
            late_payment_fee: formData.late_payment_fee ? parseFloat(formData.late_payment_fee) : null,
            is_active: isActive,
          }
        }
      )

      if (response.success) {
        sonnerToast.success("Loan Product Created", {
          description: response.message || "Loan product has been created successfully",
        })
        router.push("/admin/loan-products")
      }
    } catch (error: any) {
      console.error('Error creating loan product:', error)
      sonnerToast.error("Failed to create loan product", {
        description: error.message || "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <Link href="/admin/loan-products">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Loan Products
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Create Loan Product</h1>
              <p className="text-muted-foreground mt-1">Configure a new loan product for members</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>General details about the loan product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Housing Loan"
                required
              />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the loan product"
                rows={3}
              />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="active">Active Status</Label>
                      <p className="text-sm text-muted-foreground">Make this product available to members</p>
                    </div>
                    <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </CardContent>
              </Card>

              {/* Loan Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>Loan Terms</CardTitle>
                  <CardDescription>Configure the financial terms of the loan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Amount (₦) *</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  placeholder="e.g., 500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Maximum Amount (₦) *</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  placeholder="e.g., 10000000"
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  placeholder="e.g., 10"
                  required
                />
                <p className="text-sm text-muted-foreground">Annual interest rate</p>
                    </div>
                    <div className="space-y-2">
                <Label htmlFor="interestType">Interest Type *</Label>
                <Select value={formData.interest_type} onValueChange={(value) => setFormData({ ...formData, interest_type: value })}>
                  <SelectTrigger id="interestType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Interest</SelectItem>
                    <SelectItem value="compound">Compound Interest</SelectItem>
                  </SelectContent>
                </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                <Label htmlFor="minTenure">Minimum Tenure (months) *</Label>
                <Input
                  id="minTenure"
                  type="number"
                  value={formData.min_tenure_months}
                  onChange={(e) => setFormData({ ...formData, min_tenure_months: e.target.value })}
                  placeholder="e.g., 1"
                  required
                />
                    </div>
                    <div className="space-y-2">
                <Label htmlFor="maxTenure">Maximum Tenure (months) *</Label>
                <Input
                  id="maxTenure"
                  type="number"
                  value={formData.max_tenure_months}
                  onChange={(e) => setFormData({ ...formData, max_tenure_months: e.target.value })}
                  placeholder="e.g., 12"
                  required
                />
                    </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processingFee">Processing Fee (%)</Label>
                <Input
                  id="processingFee"
                  type="number"
                  step="0.1"
                  value={formData.processing_fee_percentage}
                  onChange={(e) => setFormData({ ...formData, processing_fee_percentage: e.target.value })}
                  placeholder="e.g., 1"
                />
                  </div>
                  <div className="space-y-2">
                <Label htmlFor="latePaymentFee">Late Payment Fee (₦)</Label>
                <Input
                  id="latePaymentFee"
                  type="number"
                  value={formData.late_payment_fee}
                  onChange={(e) => setFormData({ ...formData, late_payment_fee: e.target.value })}
                  placeholder="e.g., 5000"
                />
              </div>
                  </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repayment Calculation</CardTitle>
            <CardDescription>How monthly repayments are calculated</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Repayment Calculation ({formData.interest_type === 'simple' ? 'Simple' : 'Compound'} Interest):</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Total Interest = Loan Amount × Interest Rate × (Tenure / 12)</li>
                      <li>• Total Repayment = Loan Amount + Total Interest</li>
                      <li>• Monthly Repayment = Total Repayment ÷ Tenure</li>
                      <li className="font-medium text-foreground pt-2">
                        • Qualification: Net Pay must be ≥ 200% of Monthly Repayment
                      </li>
                    </ul>
                    <div className="pt-2 border-t mt-2">
                      <p className="text-sm font-medium">Example:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                        <li>• Loan: ₦200,000 at 10% for 4 months</li>
                  <li>• Interest: ₦200,000 × 10% × (4/12) = ₦6,667</li>
                  <li>• Total: ₦206,667</li>
                  <li>• Monthly: ₦206,667 ÷ 4 = ₦51,667</li>
                  <li className="font-medium text-foreground">• Required Net Pay: ₦51,667 × 2 = ₦103,334</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                  Cancel
                </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || !formData.name || !formData.min_amount || !formData.max_amount || !formData.interest_rate || !formData.min_tenure_months || !formData.max_tenure_months}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Loan Product"
            )}
                </Button>
              </div>
            </form>
    </div>
  )
}
