"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

export function LoanApplicationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loanAmount, setLoanAmount] = useState("")
  const [loanProduct, setLoanProduct] = useState("")
  const [lastNetPay, setLastNetPay] = useState("")
  const [tenure, setTenure] = useState("4")
  const [monthlyRepayment, setMonthlyRepayment] = useState(0)
  const [totalRepayment, setTotalRepayment] = useState(0)
  const [interestRate, setInterestRate] = useState(10) // Default 10% simple interest
  const [isQualified, setIsQualified] = useState(false)

  useEffect(() => {
    if (loanAmount && lastNetPay && tenure) {
      const principal = Number(loanAmount)
      const netPay = Number(lastNetPay)
      const months = Number(tenure)

      const totalInterest = principal * (interestRate / 100)
      const total = principal + totalInterest
      const monthly = total / months

      const requiredNetPay = monthly * 2
      const qualified = netPay >= requiredNetPay

      setTotalRepayment(total)
      setMonthlyRepayment(monthly)
      setIsQualified(qualified)
    }
  }, [loanAmount, lastNetPay, tenure, interestRate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isQualified) {
      alert("Your net pay does not meet the minimum requirement for this loan amount and tenure.")
      return
    }

    setIsLoading(true)

    // TODO: Implement actual loan application submission
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/loans/application-success")
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Loan Details</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Loan Product</Label>
            <Select value={loanProduct} onValueChange={setLoanProduct} required>
              <SelectTrigger id="product">
                <SelectValue placeholder="Select loan product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="housing-dev">Housing Development Loan</SelectItem>
                <SelectItem value="emergency">Emergency Loan</SelectItem>
                <SelectItem value="renovation">Home Renovation Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastNetPay">Last Net Pay (₦)</Label>
              <Input
                id="lastNetPay"
                type="number"
                placeholder="Enter your last net pay"
                value={lastNetPay}
                onChange={(e) => setLastNetPay(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Your most recent monthly net salary</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenure">Repayment Tenure (months)</Label>
            <Select value={tenure} onValueChange={setTenure} required>
              <SelectTrigger id="tenure">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="4">4 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {monthlyRepayment > 0 && (
            <div
              className={`p-4 rounded-lg ${isQualified ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Repayment:</span>
                  <span className="text-lg font-bold">
                    ₦{monthlyRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Repayment:</span>
                  <span className="font-medium">
                    ₦{totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Required Net Pay (200%):</span>
                  <span className="font-medium">
                    ₦{(monthlyRepayment * 2).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  {isQualified ? (
                    <p className="text-sm text-green-700 font-medium">✓ You qualify for this loan</p>
                  ) : (
                    <p className="text-sm text-red-700 font-medium">
                      ✗ Your net pay must be at least ₦{(monthlyRepayment * 2).toLocaleString()} (200% of monthly
                      repayment) to qualify
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Calculation: ₦{Number(loanAmount).toLocaleString()} + {interestRate}% interest (₦
                {(Number(loanAmount) * (interestRate / 100)).toLocaleString()}) = ₦{totalRepayment.toLocaleString()} ÷{" "}
                {tenure} months
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Loan</Label>
            <Textarea id="purpose" placeholder="Describe the purpose of this loan" required />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Employment Information</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employer">Employer</Label>
              <Input id="employer" defaultValue="Federal Road Safety Corps" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position/Rank</Label>
              <Input id="position" defaultValue="Route Commander" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Salary</Label>
              <Input id="salary" type="number" placeholder="Enter monthly salary" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employment-date">Employment Date</Label>
              <Input id="employment-date" type="date" required />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Guarantor Information</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guarantor-name">Full Name</Label>
              <Input id="guarantor-name" placeholder="Guarantor's full name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantor-phone">Phone Number</Label>
              <Input id="guarantor-phone" type="tel" placeholder="Guarantor's phone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantor-email">Email Address</Label>
              <Input id="guarantor-email" type="email" placeholder="Guarantor's email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantor-relationship">Relationship</Label>
              <Input id="guarantor-relationship" placeholder="e.g., Colleague, Friend" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guarantor-address">Address</Label>
            <Textarea id="guarantor-address" placeholder="Guarantor's residential address" required />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Supporting Documents</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary-slip">Recent Salary Slip</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (max 5MB)</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="id-card">Valid ID Card</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (max 5MB)</p>
            </div>
          </div>
        </div>
      </Card>

      {loanAmount && (
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-4">Loan Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Requested Amount</span>
              <span className="font-medium">₦{Number(loanAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate (Simple)</span>
              <span className="font-medium">{interestRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Repayment Tenure</span>
              <span className="font-medium">{tenure} months</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium">₦{(Number(loanAmount) * (interestRate / 100)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee (1%)</span>
              <span className="font-medium">₦{(Number(loanAmount) * 0.01).toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total Repayable</span>
              <span className="font-bold text-lg">
                ₦{(totalRepayment + Number(loanAmount) * 0.01).toLocaleString()}
              </span>
            </div>
            {monthlyRepayment > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Monthly Repayment</span>
                <span className="font-medium text-primary">
                  ₦{monthlyRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || !loanAmount || !loanProduct || !lastNetPay || !isQualified}
        >
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}
