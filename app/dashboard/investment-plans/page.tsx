"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Clock, ArrowRight, MapPin, Home, DollarSign, ImageIcon, FileText, Loader2, TrendingUp } from "lucide-react"
import { getUserInvestmentPlans } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

export default function InvestmentPlansPage() {
	const { isLoading, loadData } = usePageLoading()
	const { toast } = useToast()
	const [plans, setPlans] = useState<Array<{
		id: string
		name: string
		description: string | null
		min_amount: number
		max_amount: number
		expected_return_rate: number
		min_duration_months: number
		max_duration_months: number
		return_type: string
		risk_level: string
		risk_color: string
		features: any[]
		terms_and_conditions: any[]
		is_active: boolean
		created_at: string
		updated_at: string
	}>>([])

	useEffect(() => {
		let active = true
		;(async () => {
			try {
				const response = await loadData(() => getUserInvestmentPlans())
				if (!active) return
				if (response.plans) {
					setPlans(response.plans)
				}
			} catch (error: any) {
				if (!active) return
				toast({
					title: "Failed to load investment plans",
					description: error?.message || "Please try again later.",
					variant: "destructive",
				})
			}
		})()

		return () => {
			active = false
		}
	}, [loadData, toast])

	const getRiskBadgeVariant = (riskLevel: string) => {
		switch (riskLevel?.toLowerCase()) {
			case "low":
				return "default"
			case "medium":
				return "secondary"
			case "high":
				return "destructive"
			default:
				return "outline"
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Investment Plans</h1>
					<p className="text-muted-foreground mt-1">Browse and subscribe to available investment opportunities</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="p-6">
							<Skeleton className="h-6 w-3/4 mb-2" />
							<Skeleton className="h-4 w-full mb-4" />
							<Skeleton className="h-32 w-full" />
						</Card>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Investment Plans</h1>
				<p className="text-muted-foreground mt-1">Browse and subscribe to available investment opportunities</p>
			</div>

			{plans.length === 0 ? (
				<Card className="p-12 text-center">
					<TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
					<h3 className="text-lg font-semibold mb-2">No Investment Plans Available</h3>
					<p className="text-muted-foreground">There are currently no active investment plans. Please check back later.</p>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{plans.map((plan) => (
						<InvestmentPlanCard key={plan.id} plan={plan} getRiskBadgeVariant={getRiskBadgeVariant} />
					))}
				</div>
			)}
		</div>
	)
}

function InvestmentPlanCard({
	plan,
	getRiskBadgeVariant,
}: {
	plan: {
		id: string
		name: string
		description: string | null
		min_amount: number
		max_amount: number
		expected_return_rate: number
		min_duration_months: number
		max_duration_months: number
		return_type: string
		risk_level: string
		risk_color: string
		features: any[]
		terms_and_conditions: any[]
		is_active: boolean
		created_at: string
		updated_at: string
	}
	getRiskBadgeVariant: (riskLevel: string) => "default" | "secondary" | "destructive" | "outline"
}) {
	return (
		<Card className="overflow-hidden hover:shadow-lg transition-shadow">
			<div className="p-6 space-y-4">
				<div className="space-y-2">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<DollarSign className="h-4 w-4 text-primary" />
								<Badge variant={getRiskBadgeVariant(plan.risk_level)}>{plan.risk_level} Risk</Badge>
							</div>
							<h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
							{plan.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{plan.description}</p>}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4 pt-2">
					<div>
						<p className="text-xs text-muted-foreground">Expected ROI</p>
						<p className="font-semibold text-green-600">{plan.expected_return_rate}% p.a.</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Return Type</p>
						<p className="font-semibold text-sm">{plan.return_type || "N/A"}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Min. Investment</p>
						<p className="font-semibold text-sm">{currencyFormatter.format(plan.min_amount)}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Max. Investment</p>
						<p className="font-semibold text-sm">{currencyFormatter.format(plan.max_amount)}</p>
					</div>
				</div>

				<div className="flex items-center gap-2 pt-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="text-xs text-muted-foreground">
						Duration: {plan.min_duration_months}-{plan.max_duration_months} months
					</span>
				</div>

				{plan.features && plan.features.length > 0 && (
					<div className="pt-2">
						<p className="text-xs font-medium mb-1">Features:</p>
						<ul className="text-xs text-muted-foreground space-y-1">
							{plan.features.slice(0, 3).map((feature: string, idx: number) => (
								<li key={idx} className="flex items-start gap-1">
									<span>•</span>
									<span>{feature}</span>
								</li>
							))}
							{plan.features.length > 3 && <li className="text-xs text-muted-foreground">+{plan.features.length - 3} more</li>}
						</ul>
					</div>
				)}

				<Link href={`/dashboard/investment-plans/${plan.id}`} className="block">
					<Button className="w-full">
						View Details & Invest
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</Link>
			</div>
		</Card>
	)
}
