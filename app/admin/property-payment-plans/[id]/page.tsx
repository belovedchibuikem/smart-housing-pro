"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getPropertyPaymentPlan, type PropertyPaymentPlan } from "@/lib/api/client"
import { ArrowLeft, MapPin, Calendar, User, CheckCircle2, Pencil } from "lucide-react"

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

export default function PropertyPaymentPlanDetailPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { toast } = useToast()
	const [plan, setPlan] = useState<PropertyPaymentPlan | null>(null)
	const [loading, setLoading] = useState(true)

	const mixAllocations = plan?.funding_option === "mix" ? plan.configuration?.mix_allocations : undefined
	const mixAllocationSummary = mixAllocations
		? Object.entries((mixAllocations.percentages ?? {}) as Record<string, number>).map(([method, percentage]) => {
			const amountsRecord = (mixAllocations.amounts ?? {}) as Record<string, number>
			const amount = amountsRecord[method] ?? ((percentage ?? 0) / 100) * (Number(plan?.total_amount ?? 0))
			return {
				method,
				label: method.replace(/_/g, " "),
				percentage: Number(percentage ?? 0),
				amount,
			}
		})
		: []

	const metadataEntries = plan?.metadata
		? Object.entries(plan.metadata).map(([key, value]) => ({
				key,
				value: typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value ?? ""),
		  }))
		: []

	const hasNonMixConfiguration =
		plan?.configuration && plan.funding_option !== "mix" && Object.keys(plan.configuration).length > 0

	useEffect(() => {
		const fetchPlan = async () => {
			if (!params?.id) return
			try {
				setLoading(true)
				const response = await getPropertyPaymentPlan(params.id)
				if (response.success) {
					setPlan(response.data)
				}
			} catch (error: any) {
				toast({
					title: "Unable to load payment plan",
					description: error?.message ?? "Please try again later.",
					variant: "destructive",
				})
				router.push("/admin/property-payment-plans")
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
				<CardContent className="py-12 text-center text-muted-foreground">Payment plan not found.</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/admin/property-payment-plans">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Payment Plan</h1>
					<p className="text-muted-foreground">Detailed configuration for this property&apos;s payment schedule.</p>
				</div>
			</div>

			<Card>
				<CardHeader className="space-y-3">
					<CardTitle className="flex flex-wrap items-center gap-3 text-xl">
						<MapPin className="h-4 w-4 text-primary" />
						{plan.property?.title ?? "Property"}
						<Badge variant="outline" className="capitalize">
							Status: {plan.status}
						</Badge>
					</CardTitle>
					<CardDescription className="space-y-2 text-sm">
						{plan.property?.location && (
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								{plan.property.location}
							</div>
						)}
						<div className="flex flex-wrap items-center gap-3">
							<span>Total Amount: {formatCurrency(plan.total_amount)}</span>
							<span>Initial Balance: {formatCurrency(plan.initial_balance)}</span>
							<span>Remaining Balance: {formatCurrency(plan.remaining_balance)}</span>
						</div>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Member</h4>
							<div className="flex items-center gap-2 text-sm">
								<User className="h-4 w-4" />
								{`${plan.member?.user?.first_name ?? ""} ${plan.member?.user?.last_name ?? ""}`.trim() || "—"}
							</div>
						</div>
						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Configured By</h4>
							<div className="flex items-center gap-2 text-sm">
								<User className="h-4 w-4" />
								{(() => {
									if (typeof plan.configured_by === "object" && plan.configured_by !== null) {
										const user = plan.configured_by as { first_name?: string | null; last_name?: string | null; name?: string }
										const combined = [user.first_name, user.last_name].filter(Boolean).join(" ")
										return combined || user.name || "Administrator"
									}
									if (typeof plan.configured_by === "string") {
										return plan.configured_by || "Administrator"
									}
									return "Administrator"
								})()}
							</div>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Funding Option</h4>
							<p className="capitalize">
								{plan.funding_option ? plan.funding_option.replace(/_/g, " ") : "Not specified"}
							</p>
						</div>
						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Payment Methods</h4>
							<p className="capitalize">
								{plan.selected_methods && plan.selected_methods.length > 0
									? plan.selected_methods.map((method) => method.replace(/_/g, " ")).join(", ")
									: "Not specified"}
							</p>
						</div>
					</div>

					{plan.funding_option === "mix" && mixAllocationSummary.length > 0 && (
						<div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
							<h4 className="text-sm font-semibold text-primary">Mix Funding Allocation</h4>
							<div className="grid gap-3 md:grid-cols-2">
								{mixAllocationSummary.map((item) => (
									<div key={item.method} className="rounded-lg border border-dashed border-primary/40 bg-background p-3">
										<div className="text-sm font-semibold capitalize">{item.label}</div>
										<div className="text-xs text-muted-foreground">
											{item.percentage.toFixed(2)}% • {formatCurrency(item.amount)}
										</div>
									</div>
								))}
							</div>
							<div className="text-xs text-muted-foreground">
								Members must complete payments using only these configured methods and amounts. Reconfigure the plan if
								adjustments are required.
							</div>
						</div>
					)}

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Start Date</h4>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4" />
								{plan.starts_on ? new Date(plan.starts_on).toLocaleDateString() : "Not set"}
							</div>
						</div>
						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">End Date</h4>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4" />
								{plan.ends_on ? new Date(plan.ends_on).toLocaleDateString() : "Not set"}
							</div>
						</div>
					</div>

					{hasNonMixConfiguration && plan.configuration && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Configuration</h4>
							<pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
								{JSON.stringify(plan.configuration, null, 2)}
							</pre>
						</div>
					)}

					{plan.schedule && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Schedule</h4>
							<pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
								{JSON.stringify(plan.schedule, null, 2)}
							</pre>
						</div>
					)}

					{metadataEntries.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Metadata</h4>
							<div className="grid gap-3 md:grid-cols-2">
								{metadataEntries.map((item) => (
									<div key={item.key} className="rounded-lg border bg-muted/40 p-3 text-sm">
										<div className="text-xs uppercase text-muted-foreground">{item.key.replace(/_/g, " ")}</div>
										<div className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.value}</div>
									</div>
								))}
							</div>
						</div>
					)}

					{plan.status === "completed" && (
						<div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
							<CheckCircle2 className="mt-0.5 h-4 w-4" />
							<span>This payment plan has been completed. All obligations have been fulfilled.</span>
						</div>
					)}

					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={() => router.back()}>
							Back
						</Button>
						<Button asChild>
							<Link href={`/admin/property-payment-plans/${plan.id}/edit`}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Plan
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}



