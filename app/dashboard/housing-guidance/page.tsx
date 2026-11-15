"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getHousingGuidance, type HousingGuidance } from "@/lib/api/client"

function money(value: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

export default function HousingGuidancePage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [data, setData] = useState<HousingGuidance | null>(null)

	useEffect(() => {
		getHousingGuidance()
			.then((response) => setData(response.data))
			.catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load housing guidance"))
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		)
	}

	if (error || !data) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{error || "Unable to load housing guidance"}</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Housing finance guide</h1>
				<p className="mt-1 text-muted-foreground">{data.summary}</p>
			</div>

			<Alert>
				<AlertDescription>
					This is a guide for your next step. It does not approve a loan, mortgage, or property plan.
				</AlertDescription>
			</Alert>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>What you can carry</CardTitle>
						<CardDescription>Based on your contribution, savings, and open loans.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>Monthly contribution: {money(data.affordability.monthly_contribution)}</p>
						<p>Available savings: {money(data.affordability.available_savings)}</p>
						<p>Wallet: {money(data.affordability.wallet_balance)}</p>
						<p>Open loan balance: {money(data.affordability.open_loan_balance)}</p>
						<p className="font-medium">Suggested new repayment: {money(data.affordability.suggested_monthly_repayment)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Before you apply</CardTitle>
						<CardDescription>{data.completeness.ready ? "Your profile has the basics in place." : "A few items are still open."}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						{data.completeness.gaps.length === 0 ? <p>No missing profile items were found.</p> : null}
						{data.completeness.gaps.map((gap) => (
							<p key={gap}>{gap}</p>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Next steps</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{data.next_steps.map((step) => (
						<p key={step}>{step}</p>
					))}
					<div className="mt-3 flex flex-wrap gap-2">
						<Button asChild>
							<Link href="/dashboard/housing-roundup">Open yearly payment roundup</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/dashboard/mortgage-calculator">Open mortgage calculator</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			{data.payment_plans.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>Property payment plans</CardTitle>
						<CardDescription>Compared with your monthly contribution.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						{data.payment_plans.map((plan) => (
							<p key={plan.id}>
								Remaining {money(plan.remaining_balance)} · about {money(plan.suggested_monthly)} a month · {plan.fit.replace("_", " ")}
							</p>
						))}
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
