"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"
import { LoanProducts } from "@/components/loans/loan-products"
import { useLoanProducts } from "@/lib/hooks/use-loan-products"

type MemberStatus = "member" | "non-member"

export default function LoanPlansPage() {
	const [memberStatus] = useState<MemberStatus>("member")
	const { products, isLoading, error } = useLoanProducts()

  return (
    <div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Loan Plans</h1>
					<p className="text-sm text-muted-foreground">
						Browse available loan products and compare their terms before you apply.
					</p>
				</div>
          <Badge variant={memberStatus === "member" ? "default" : "secondary"}>
            {memberStatus === "member" ? "FRSC Member" : "Non-Member"}
          </Badge>
      </div>

			{memberStatus === "non-member" ? (
				<Card className="flex gap-3 border-amber-200 bg-amber-50 p-4">
					<Info className="mt-0.5 h-5 w-5 text-amber-600" />
					<div className="text-sm text-amber-800">
						<p className="font-medium">Non-member interest rates apply</p>
						<p>
							Non-members pay higher interest rates and have limited loan options. Become a member to unlock
							discounted rates and exclusive plans.
            </p>
          </div>
				</Card>
			) : null}

			<LoanProducts products={products} isLoading={isLoading} error={error} />

			<Card className="space-y-4 p-6">
				<h2 className="text-xl font-semibold">General Requirements</h2>
      <div className="grid gap-6 md:grid-cols-2">
          <div>
						<h3 className="mb-2 font-medium">For Members</h3>
						<ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
							<li>Active membership for at least 6 months</li>
              <li>Regular contribution history</li>
              <li>Valid FRSC identification</li>
							<li>Proof of steady income (recent pay slip)</li>
							<li>Guarantor(s) as required by the loan type</li>
							<li>No existing loan defaults</li>
            </ul>
          </div>
          <div>
						<h3 className="mb-2 font-medium">For Non-Members</h3>
						<ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
							<li>Valid government-issued identification</li>
              <li>Proof of income or employment</li>
							<li>Six months bank statements</li>
							<li>At least two guarantors</li>
              <li>Higher interest rates apply</li>
							<li>Access to a limited set of loan products</li>
            </ul>
          </div>
        </div>
			</Card>

			{memberStatus === "non-member" ? (
				<Card className="border-primary bg-primary/5 p-6">
					<h2 className="text-xl font-semibold">Upgrade to Member</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Enjoy lower interest rates, exclusive loan options, and priority processing when you become a member.
          </p>
					<Link href="/dashboard/subscriptions" className="mt-4 inline-block">
						<Button>Become a Member</Button>
          </Link>
				</Card>
			) : null}
    </div>
  )
}
