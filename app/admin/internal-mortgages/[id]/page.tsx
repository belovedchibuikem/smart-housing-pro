"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getInternalMortgagePlan, type InternalMortgagePlan } from "@/lib/api/client"
import { ArrowLeft, MapPin, Calendar, User, TrendingUp, Info } from "lucide-react"

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

export default function InternalMortgagePlanDetailPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { toast } = useToast()
	const [plan, setPlan] = useState<InternalMortgagePlan | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchPlan = async () => {
			if (!params?.id) return
			try {
				setLoading(true)
				const response = await getInternalMortgagePlan(params.id)
				if (response.success) {
					setPlan(response.data)
				}
			} catch (error: any) {
				toast({
					title: "Unable to load mortgage plan",
					description: error?.message ?? "Please try again later.",
					variant: "destructive",
				})
				router.back()
			} finally {
				setLoading(false)
			}
		}

		void fetchPlan()
	}, [params?.id, router, toast])

	if (loading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-64" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-72" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-1/2" />
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!plan) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">Internal mortgage plan not found.</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/admin/internal-mortgages">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Internal Mortgage Plan</h1>
					<p className="text-muted-foreground">Review the cooperative-managed mortgage configuration and schedule.</p>
				</div>
			</div>

			<Card>
				<CardHeader className="space-y-3 border-b bg-muted/40">
					<CardTitle className="flex flex-wrap items-center gap-3 text-xl">
						{plan.title}
						<Badge variant="outline" className="capitalize">
							Status: {plan.status}
						</Badge>
						<Badge variant="secondary" className="capitalize">
							Frequency: {plan.frequency}
						</Badge>
					</CardTitle>
					<CardDescription className="space-y-2 text-sm text-muted-foreground">
						<p>Principal: {formatCurrency(plan.principal)}</p>
						<p>Interest: {Number(plan.interest_rate).toFixed(2)}% • Tenure: {plan.tenure_months} months</p>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Property</h4>
							{plan.property ? (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin className="h-4 w-4" />
									<span>
										{plan.property.title}
										{plan.property.location ? ` • ${plan.property.location}` : ""}
									</span>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">Not linked to a specific property yet.</p>
							)}
						</div>
						<div className="space-y-1">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Member</h4>
							{plan.member?.user ? (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<User className="h-4 w-4" />
									<span>
										{plan.member.user.first_name} {plan.member.user.last_name}
									</span>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">This plan is not yet assigned to a member.</p>
							)}
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1 text-sm text-muted-foreground">
							<h4 className="text-xs font-semibold uppercase">Schedule</h4>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>
									Starts {plan.starts_on ? new Date(plan.starts_on).toLocaleDateString() : "TBD"} • Ends{" "}
									{plan.ends_on ? new Date(plan.ends_on).toLocaleDateString() : "TBD"}
								</span>
							</div>
						</div>
						<div className="space-y-1 text-sm text-muted-foreground">
							<h4 className="text-xs font-semibold uppercase">Estimated Payment</h4>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								<span>
									{plan.monthly_payment
										? `${formatCurrency(plan.monthly_payment)} per ${plan.frequency.replace("biannually", "half-year")}`
										: "Calculated upon activation"}
								</span>
							</div>
						</div>
					</div>

					{plan.description && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Description</h4>
							<p className="text-sm text-muted-foreground">{plan.description}</p>
						</div>
					)}

					{plan.metadata && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Metadata</h4>
							<pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(plan.metadata, null, 2)}</pre>
						</div>
					)}

					{plan.schedule && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Schedule Preview</h4>
							<pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(plan.schedule, null, 2)}</pre>
						</div>
					)}

					<div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
						<Info className="mt-0.5 h-4 w-4" />
						<span>
							This mortgage plan can be linked to a property payment plan to automate deductions. Use amortization or mortgage
							calculators to adjust the structure as necessary.
						</span>
					</div>

					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={() => router.back()}>
							Back
						</Button>
						<Button variant="secondary" disabled>
							Edit Plan (coming soon)
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}


