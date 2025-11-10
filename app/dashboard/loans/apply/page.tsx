"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { LoanApplicationForm } from "@/components/loans/loan-application-form"
import { Button } from "@/components/ui/button"
import { useLoanProducts } from "@/lib/hooks/use-loan-products"

export default function LoanApplicationPage() {
	const searchParams = useSearchParams()
	const initialProductId = searchParams.get("product") ?? undefined
	const { products, isLoading, error } = useLoanProducts()

  return (
		<div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard/loans">
          <Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loans
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Apply for a Loan</h1>
				<p className="mt-1 text-muted-foreground">
					Complete the form below to submit your loan application. You can monitor the status from the loan
					dashboard.
				</p>
				{error ? <p className="mt-3 text-sm text-red-600">Unable to load loan products: {error}</p> : null}
      </div>

			<LoanApplicationForm
				products={products}
				isLoadingProducts={isLoading}
				initialProductId={initialProductId}
				redirectOnSuccess
			/>
    </div>
  )
}
