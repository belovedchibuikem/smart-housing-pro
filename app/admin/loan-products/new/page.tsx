"use client"

import type React from "react"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewLoanProductPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implement actual loan product creation
    setTimeout(() => {
      setIsLoading(false)
      router.push("/admin/loan-products")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex">
        <AdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 p-6 lg:p-8">
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
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" placeholder="e.g., Standard Housing Loan" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Brief description of the loan product" required />
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
                      <Label htmlFor="minAmount">Minimum Amount (₦)</Label>
                      <Input id="minAmount" type="number" placeholder="e.g., 500000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAmount">Maximum Amount (₦)</Label>
                      <Input id="maxAmount" type="number" placeholder="e.g., 10000000" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (% simple interest)</Label>
                      <Input id="interestRate" type="number" step="0.1" placeholder="e.g., 10" required />
                      <p className="text-sm text-muted-foreground">Simple interest rate applied to loan principal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processingFee">Processing Fee (%)</Label>
                      <Input id="processingFee" type="number" step="0.1" placeholder="e.g., 1" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTenure">Maximum Tenure (months)</Label>
                    <Input id="maxTenure" type="number" placeholder="e.g., 12" required />
                    <p className="text-sm text-muted-foreground">Maximum repayment period allowed for this loan</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Repayment Calculation (Simple Interest):</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Total Interest = Loan Amount × Interest Rate</li>
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
                        <li>• Interest: ₦200,000 × 10% = ₦20,000</li>
                        <li>• Total: ₦220,000</li>
                        <li>• Monthly: ₦220,000 ÷ 4 = ₦55,000</li>
                        <li className="font-medium text-foreground">• Required Net Pay: ₦55,000 × 2 = ₦110,000</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Repayment Calculation Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Repayment Calculation Parameters</CardTitle>
                  <CardDescription>Configure how monthly repayments and qualifications are calculated</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4"></CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                  <CardDescription>Set requirements for loan applicants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minContribution">Minimum Contribution (₦)</Label>
                    <Input id="minContribution" type="number" placeholder="e.g., 100000" required />
                    <p className="text-sm text-muted-foreground">Minimum contribution balance required to apply</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantors">Number of Guarantors Required</Label>
                    <Select required>
                      <SelectTrigger id="guarantors">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guarantor</SelectItem>
                        <SelectItem value="2">2 Guarantors</SelectItem>
                        <SelectItem value="3">3 Guarantors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documents">Required Documents</Label>
                    <Textarea id="documents" placeholder="e.g., Valid ID, Recent payslip, Proof of address" required />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Loan Product"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
