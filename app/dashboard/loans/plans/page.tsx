"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Info } from "lucide-react"
import Link from "next/link"

export default function LoanPlansPage() {
  const [memberStatus] = useState<"member" | "non-member">("member")

  const loanPlans = [
    {
      name: "Personal Loan",
      maxAmount: "₦5,000,000",
      memberInterestRate: "5%",
      nonMemberInterestRate: "8%",
      tenure: "12-60 months",
      description: "Quick personal loans",
      eligibility: "both", // both, member-only, non-member-only
    },
    {
      name: "Housing Loan",
      maxAmount: "₦20,000,000",
      memberInterestRate: "7%",
      nonMemberInterestRate: "10%",
      tenure: "60-240 months",
      description: "Long-term housing finance",
      eligibility: "both",
    },
    {
      name: "Emergency Loan",
      maxAmount: "₦1,000,000",
      memberInterestRate: "3%",
      nonMemberInterestRate: "6%",
      tenure: "6-12 months",
      description: "Fast emergency funding",
      eligibility: "both",
    },
    {
      name: "Development Loan",
      maxAmount: "₦10,000,000",
      memberInterestRate: "6%",
      nonMemberInterestRate: "9%",
      tenure: "24-120 months",
      description: "Property development financing",
      eligibility: "both",
    },
    {
      name: "Member Exclusive Loan",
      maxAmount: "₦15,000,000",
      memberInterestRate: "4%",
      nonMemberInterestRate: "N/A",
      tenure: "12-180 months",
      description: "Special rates for members only",
      eligibility: "member-only",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Plans</h1>
        <p className="text-muted-foreground">View available loan products and their terms</p>
        <div className="mt-2">
          <Badge variant={memberStatus === "member" ? "default" : "secondary"}>
            {memberStatus === "member" ? "FRSC Member" : "Non-Member"}
          </Badge>
        </div>
      </div>

      {memberStatus === "non-member" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">Non-Member Interest Rates Apply</p>
            <p className="text-amber-700 mt-1">
              As a non-member, higher interest rates apply to your loans. Become a member to enjoy lower rates and
              exclusive benefits.
            </p>
          </div>
        </div>
      )}

      {/* Loan Products */}
      <div className="grid gap-6 md:grid-cols-2">
        {loanPlans.map((plan) => {
          const isAvailable =
            plan.eligibility === "both" ||
            (plan.eligibility === "member-only" && memberStatus === "member") ||
            (plan.eligibility === "non-member-only" && memberStatus === "non-member")

          const interestRate = memberStatus === "member" ? plan.memberInterestRate : plan.nonMemberInterestRate

          return (
            <div key={plan.name} className={`rounded-lg border bg-card p-6 ${!isAvailable ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.eligibility === "member-only" && (
                  <Badge variant="default" className="text-xs">
                    Members Only
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maximum Amount</span>
                  <span className="text-sm font-medium">{plan.maxAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Interest Rate</span>
                  <span className="text-sm font-medium text-primary">{interestRate}</span>
                </div>
                {memberStatus === "non-member" && plan.memberInterestRate !== "N/A" && (
                  <div className="text-xs text-muted-foreground">Member rate: {plan.memberInterestRate}</div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tenure</span>
                  <span className="text-sm font-medium">{plan.tenure}</span>
                </div>
              </div>
              {isAvailable ? (
                <Link href="/dashboard/loans/apply">
                  <Button className="w-full">Apply for Loan</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  Not Available
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Loan Requirements */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">General Requirements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">For Members:</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
              <li>Must be an active member for at least 6 months</li>
              <li>Regular contribution history</li>
              <li>Valid FRSC identification</li>
              <li>Proof of income (recent pay slip)</li>
              <li>Guarantors (as required by loan type)</li>
              <li>No outstanding loan defaults</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">For Non-Members:</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
              <li>Valid government-issued ID (Driver's License, NIN, Passport, FRSC ID)</li>
              <li>Proof of income or employment</li>
              <li>Bank statements (last 6 months)</li>
              <li>Guarantors (minimum 2 required)</li>
              <li>Higher interest rates apply</li>
              <li>Limited loan products available</li>
            </ul>
          </div>
        </div>
      </div>

      {memberStatus === "non-member" && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
          <h2 className="text-xl font-semibold mb-2">Become a Member</h2>
          <p className="text-muted-foreground mb-4">
            Enjoy lower interest rates, exclusive loan products, and more benefits by becoming an FRSC Housing
            Cooperative member.
          </p>
          <Link href="/dashboard/subscriptions">
            <Button>Upgrade to Member</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
