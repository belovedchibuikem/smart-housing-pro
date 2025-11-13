"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getInternalMortgagePlans, type InternalMortgagePlan } from "@/lib/api/client"
import { MapPin, Calendar, Calculator, PlusCircle } from "lucide-react"

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

export default function InternalMortgagePlansPage() {
	const { toast } = useToast()
	const [plans, setPlans] = useState<InternalMortgagePlan[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchPlans = async () => {
			try {
				setLoading(true)
				const response = await getInternalMortgagePlans({ per_page: 20 })
				if (response.success) {
					setPlans(response.data ?? [])
				}
			} catch (error: any) {
				toast({
					title: "Unable to load internal mortgage plans",
					description: error?.message ?? "Please try again later.",
					variant: "destructive",
				})
			} finally {
				setLoading(false)
			}
		}

		void fetchPlans()
	}, [toast])

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold">Internal Mortgage Plans</h1>
					<p className="text-muted-foreground">
						Manage cooperative-configured mortgage schedules for properties and members.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link href="/admin/tools/mortgage-calculators">
							<Calculator className="mr-2 h-4 w-4" />
							Open Calculators
						</Link>
					</Button>
					<Button asChild>
						<Link href="/admin/internal-mortgages/new">
							<PlusCircle className="mr-2 h-4 w-4" />
							New Plan
						</Link>
					</Button>
				</div>
			</div>

			{loading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<Card key={`plan-skeleton-${index}`}>
							<CardHeader>
								<Skeleton className="h-6 w-64" />
								<Skeleton className="h-4 w-48" />
							</CardHeader>
							<CardContent className="grid gap-3 md:grid-cols-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : plans.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						No internal mortgage plans yet. Use the button above to create one.
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{plans.map((plan) => (
						<Card key={plan.id} className="overflow-hidden">
							<CardHeader className="border-b bg-muted/40">
								<CardTitle className="flex flex-wrap items-center gap-3">
									{plan.title}
									<Badge variant="outline" className="capitalize">
										Status: {plan.status}
									</Badge>
									<Badge variant="secondary" className="capitalize">
										Frequency: {plan.frequency}
									</Badge>
								</CardTitle>
								<CardDescription className="flex flex-wrap items-center gap-3 text-sm">
									<span>Principal: {formatCurrency(plan.principal)}</span>
									<span>Interest: {Number(plan.interest_rate).toFixed(2)}%</span>
									<span>Tenure: {plan.tenure_months} months</span>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 p-6">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-1 text-sm text-muted-foreground">
										<h4 className="text-xs font-semibold uppercase">Property</h4>
										{plan.property ? (
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												<span>
													{plan.property.title}
													{plan.property.location ? ` • ${plan.property.location}` : ""}
												</span>
											</div>
										) : (
											<span>Not tied to a specific property yet.</span>
										)}
									</div>

									<div className="space-y-1 text-sm text-muted-foreground">
										<h4 className="text-xs font-semibold uppercase">Member</h4>
										{plan.member?.user ? (
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												<span>
													{plan.member.user.first_name} {plan.member.user.last_name}
												</span>
											</div>
										) : (
											<span>Plan is not yet assigned to a member.</span>
										)}
									</div>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-1 text-sm text-muted-foreground">
										<h4 className="text-xs font-semibold uppercase">Monthly Payment</h4>
										<p>{plan.monthly_payment ? formatCurrency(plan.monthly_payment) : "Calculated on activation"}</p>
									</div>
									<div className="space-y-1 text-sm text-muted-foreground">
										<h4 className="text-xs font-semibold uppercase">Schedule</h4>
										<p>
											Starts {plan.starts_on ? new Date(plan.starts_on).toLocaleDateString() : "TBD"} • Ends{" "}
											{plan.ends_on ? new Date(plan.ends_on).toLocaleDateString() : "TBD"}
										</p>
									</div>
								</div>

								<div className="flex justify-end">
									<Button variant="outline" asChild>
										<Link href={`/admin/internal-mortgages/${plan.id}`}>View Plan</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}



