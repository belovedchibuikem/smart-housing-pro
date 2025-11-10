"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ActiveLoans } from "@/components/loans/active-loans"
import { LoanHistory } from "@/components/loans/loan-history"
import { LoanProducts } from "@/components/loans/loan-products"
import { LoanApplicationForm } from "@/components/loans/loan-application-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemberLoans } from "@/lib/hooks/use-member-loans"
import { useLoanProducts } from "@/lib/hooks/use-loan-products"
import type { LoanProduct } from "@/lib/api/loans"

type LoanTabs = "view" | "request" | "plans"

export default function LoansPage() {
	const [activeTab, setActiveTab] = useState<LoanTabs>("view")
	const [prefilledProductId, setPrefilledProductId] = useState<string | undefined>(undefined)

	const {
		loans,
		isLoading: isLoadingLoans,
		isRefreshing: isRefreshingLoans,
		error: loansError,
		refresh: refreshLoans,
	} = useMemberLoans()

	const {
		products,
		isLoading: isLoadingProducts,
		error: productsError,
	} = useLoanProducts()

	const handleSelectProduct = (product: LoanProduct) => {
		setPrefilledProductId(product.id)
		setActiveTab("request")
	}

	const handleApplicationSubmitted = () => {
		refreshLoans()
		setActiveTab("view")
		setPrefilledProductId(undefined)
	}

  return (
		<div className="mx-auto max-w-7xl space-y-6">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Loan Management</h1>
					<p className="mt-1 text-muted-foreground">
						View your loans, explore available plans, and submit new applications.
					</p>
        </div>
        <Link href="/dashboard/loans/apply">
          <Button>
						<Plus className="mr-2 h-4 w-4" />
						Apply via full page
          </Button>
        </Link>
      </div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as LoanTabs)}
				className="space-y-6"
			>
        <TabsList>
					<TabsTrigger value="view">View Loans</TabsTrigger>
					<TabsTrigger value="request">Request Loan</TabsTrigger>
					<TabsTrigger value="plans">Loan Plans</TabsTrigger>
        </TabsList>

				<TabsContent value="view" className="space-y-6">
					<ActiveLoans
						loans={loans}
						isLoading={isLoadingLoans}
						isRefreshing={isRefreshingLoans}
						error={loansError}
						onRefresh={refreshLoans}
					/>
					<LoanHistory loans={loans} isLoading={isLoadingLoans} error={loansError} />
        </TabsContent>

				<TabsContent value="request">
					<LoanApplicationForm
						products={products}
						isLoadingProducts={isLoadingProducts}
						onSubmitted={handleApplicationSubmitted}
						redirectOnSuccess={false}
						initialProductId={prefilledProductId}
					/>
        </TabsContent>

				<TabsContent value="plans">
					<LoanProducts
						products={products}
						isLoading={isLoadingProducts}
						error={productsError}
						onSelectProduct={handleSelectProduct}
					/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
