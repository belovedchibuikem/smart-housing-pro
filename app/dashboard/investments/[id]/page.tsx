"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Download, Loader2, TrendingUp } from "lucide-react"
import { getUserInvestment, UserInvestment } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

function formatDate(dateString?: string | null) {
	if (!dateString) return "—"
	try {
		return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
	} catch {
		return dateString
	}
}

function statusVariant(status: string) {
	switch (status?.toLowerCase()) {
		case "active":
			return "default" as const
		case "pending":
			return "secondary" as const
		case "rejected":
			return "destructive" as const
		default:
			return "outline" as const
	}
}

export default function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [investment, setInvestment] = useState<UserInvestment | null>(null)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await getUserInvestment(id)
				if (!cancelled) setInvestment(res.investment)
			} catch (e: unknown) {
				if (!cancelled) {
					toast({
						title: "Failed to load investment",
						description: e instanceof Error ? e.message : "Please try again.",
						variant: "destructive",
					})
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [id, toast])

	if (loading) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!investment) {
		return (
			<div className="space-y-4 text-center py-12">
				<p className="text-muted-foreground">Investment not found.</p>
				<Button asChild variant="outline">
					<Link href="/dashboard/investments">Back to investments</Link>
				</Button>
			</div>
		)
	}

	const totalReturns = (investment.returns || []).reduce((sum, r) => sum + (r.amount || 0), 0)
	const currentValue = investment.amount + totalReturns

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/investments">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">{investment.plan?.name || "Investment"}</h1>
					<p className="text-muted-foreground">Investment #{investment.id.slice(0, 8)}</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				<Badge variant={statusVariant(investment.status)}>{investment.status}</Badge>
				{investment.plan?.risk_level && <Badge variant="outline">{investment.plan.risk_level} risk</Badge>}
				{investment.plan?.return_type && <Badge variant="outline">{investment.plan.return_type} returns</Badge>}
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Principal</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{currencyFormatter.format(investment.amount)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Returns received</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-green-600">+{currencyFormatter.format(totalReturns)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Current value</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{currencyFormatter.format(currentValue)}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Details</CardTitle>
					<CardDescription>Terms and timeline for this investment</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<div>
						<p className="text-sm text-muted-foreground">Start date</p>
						<p className="font-medium flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							{formatDate(investment.investment_date)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Maturity date</p>
						<p className="font-medium">{formatDate(investment.maturity_date)}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Duration</p>
						<p className="font-medium">{investment.duration_months} months</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Expected return rate</p>
						<p className="font-medium flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							{investment.expected_return_rate}% p.a.
						</p>
					</div>
					{investment.plan?.description && (
						<div className="sm:col-span-2">
							<p className="text-sm text-muted-foreground">Plan description</p>
							<p className="text-sm">{investment.plan.description}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{investment.returns && investment.returns.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Returns history</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{investment.returns.map((ret) => (
							<div key={ret.id} className="flex items-center justify-between border-b pb-2 last:border-0">
								<span className="text-sm text-muted-foreground">{formatDate(ret.return_date)}</span>
								<span className="font-medium text-green-600">+{currencyFormatter.format(ret.amount)}</span>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			<div className="flex flex-wrap gap-2">
				{investment.status === "active" && (
					<Button asChild>
						<Link href={`/dashboard/investments/withdraw?investment=${investment.id}`}>
							<Download className="h-4 w-4 mr-2" />
							Request withdrawal
						</Link>
					</Button>
				)}
				<Button asChild variant="outline">
					<Link href="/dashboard/investment-plans">Browse more plans</Link>
				</Button>
			</div>
		</div>
	)
}
