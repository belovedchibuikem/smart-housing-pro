"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getHousingYearlyRoundup, type HousingYearlyRoundup } from "@/lib/api/client"

function money(value: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

function ratingLabel(rating?: string) {
	if (rating === "excellent") return "Excellent"
	if (rating === "steady") return "Steady"
	if (rating === "behind") return "Needs a catch-up"
	return "No plan this year"
}

export default function HousingRoundupPage() {
	const currentYear = new Date().getFullYear()
	const [year, setYear] = useState(currentYear)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [data, setData] = useState<HousingYearlyRoundup | null>(null)

	useEffect(() => {
		setLoading(true)
		setError(null)
		getHousingYearlyRoundup(year)
			.then((response) => setData(response.data))
			.catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to prepare the yearly roundup"))
			.finally(() => setLoading(false))
	}, [year])

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Yearly payment roundup</h1>
				<p className="text-muted-foreground">How the year went on loans, mortgages, and house repayments. This is separate from the statement of account.</p>
			</div>

			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" onClick={() => setYear((value) => value - 1)}>Previous year</Button>
				<p className="min-w-16 text-center font-medium">{year}</p>
				<Button type="button" variant="outline" onClick={() => setYear((value) => value + 1)} disabled={year >= currentYear + 1}>Next year</Button>
			</div>

			{loading ? (
				<div className="flex min-h-[160px] items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			) : null}
			{error ? (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			{data && !loading ? (
				<>
					<Card className="border-primary/40">
						<CardHeader>
							<div className="flex items-center justify-between gap-3">
								<div>
									<CardTitle>{data.year} roundup</CardTitle>
									<CardDescription>{ratingLabel(data.rating)}</CardDescription>
								</div>
								<Badge variant="secondary">{data.source === "openai" ? "AI wrote this from your records" : "Read from your records"}</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<p>{data.summary}</p>
							<p>Expected {money(data.expected)} · Recorded {money(data.paid)} · Gap {money(data.shortfall)}</p>
							<p>
								<Link href="/dashboard/financial" className="text-primary underline">Statement of account</Link>
								{" · "}
								<Link href="/dashboard/housing-ai" className="text-primary underline">Ask Housing AI</Link>
							</p>
						</CardContent>
					</Card>

					{data.items.length === 0 ? (
						<Alert>
							<AlertDescription>No loan, mortgage, or house plan was active in {data.year}.</AlertDescription>
						</Alert>
					) : null}

					{data.items.map((item) => (
						<Card key={`${item.kind}-${item.title}`}>
							<CardHeader>
								<div className="flex items-center justify-between gap-3">
									<CardTitle className="text-base">{item.title}</CardTitle>
									<Badge variant="secondary">{ratingLabel(item.rating)}</Badge>
								</div>
								<CardDescription>Year {item.year_number} of {item.plan_years}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<p>Expected this year: {money(item.expected)}</p>
								<p>Recorded this year: {money(item.paid)}</p>
								<p>Gap: {money(item.shortfall)}</p>
								<p>Next year, with the gap added back: {money(item.next_year_target)}</p>
								<p>{item.encouragement}</p>
							</CardContent>
						</Card>
					))}
				</>
			) : null}
		</div>
	)
}
