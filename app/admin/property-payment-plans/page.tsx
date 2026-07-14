"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
	getPendingPropertyPaymentInterests,
	getPropertyPaymentPlans,
	type PendingPlanInterest,
	type PropertyPaymentPlan,
} from "@/lib/api/client"
import { MapPin, Calendar, User, ChevronsRight, ClipboardList, Search } from "lucide-react"

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

const skeletonArray = Array.from({ length: 3 })

async function fetchAllPendingInterests(search?: string) {
	const all: PendingPlanInterest[] = []
	let page = 1
	let lastPage = 1

	do {
		const response = await getPendingPropertyPaymentInterests({
			per_page: 100,
			page,
			search: search || undefined,
		})
		if (!response.success) {
			throw new Error("Unable to load pending interests")
		}
		all.push(...(response.data ?? []))
		lastPage = response.pagination?.last_page ?? 1
		page += 1
	} while (page <= lastPage)

	return {
		items: all,
		total: all.length,
	}
}

async function fetchAllPaymentPlans(search?: string) {
	const all: PropertyPaymentPlan[] = []
	let page = 1
	let lastPage = 1
	let total = 0

	do {
		const response = await getPropertyPaymentPlans({
			per_page: 100,
			page,
			search: search || undefined,
		})
		if (!response.success) {
			throw new Error("Unable to load payment plans")
		}
		all.push(...(response.data ?? []))
		total = response.pagination?.total ?? all.length
		lastPage = response.pagination?.last_page ?? 1
		page += 1
	} while (page <= lastPage)

	return {
		items: all,
		total: total || all.length,
	}
}

export default function PropertyPaymentPlansPage() {
	const { toast } = useToast()
	const [pending, setPending] = useState<PendingPlanInterest[]>([])
	const [plans, setPlans] = useState<PropertyPaymentPlan[]>([])
	const [pendingTotal, setPendingTotal] = useState(0)
	const [plansTotal, setPlansTotal] = useState(0)
	const [searchQuery, setSearchQuery] = useState("")
	const [loadingPending, setLoadingPending] = useState(true)
	const [loadingPlans, setLoadingPlans] = useState(true)

	const loadPending = useCallback(async (search?: string) => {
		try {
			setLoadingPending(true)
			const result = await fetchAllPendingInterests(search)
			setPending(result.items)
			setPendingTotal(result.total)
		} catch (error: any) {
			toast({
				title: "Unable to load pending interests",
				description: error?.message ?? "Please try again later.",
				variant: "destructive",
			})
		} finally {
			setLoadingPending(false)
		}
	}, [toast])

	const loadPlans = useCallback(async (search?: string) => {
		try {
			setLoadingPlans(true)
			const result = await fetchAllPaymentPlans(search)
			setPlans(result.items)
			setPlansTotal(result.total)
		} catch (error: any) {
			toast({
				title: "Unable to load payment plans",
				description: error?.message ?? "Please try again later.",
				variant: "destructive",
			})
		} finally {
			setLoadingPlans(false)
		}
	}, [toast])

	useEffect(() => {
		const timer = setTimeout(() => {
			void loadPending(searchQuery.trim() || undefined)
			void loadPlans(searchQuery.trim() || undefined)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchQuery, loadPending, loadPlans])

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold">Property Payment Plans</h1>
					<p className="text-muted-foreground">
						Configure funding schedules for approved expressions of interest and review existing plans.
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/eoi-forms">
						<ClipboardList className="mr-2 h-4 w-4" />
						View EOI Forms
					</Link>
				</Button>
			</div>

			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by member name, ID, or property..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			<Tabs defaultValue="pending" className="space-y-6">
				<TabsList>
					<TabsTrigger value="pending" className="flex items-center gap-2">
						Pending Setup
						<Badge variant="secondary">{pendingTotal}</Badge>
					</TabsTrigger>
					<TabsTrigger value="plans" className="flex items-center gap-2">
						Existing Plans
						<Badge variant="secondary">{plansTotal}</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="pending" className="space-y-4">
					{loadingPending ? (
						<div className="space-y-3">
							{skeletonArray.map((_, index) => (
								<Card key={`pending-skeleton-${index}`}>
									<CardContent className="p-6">
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											<div className="space-y-3">
												<Skeleton className="h-5 w-48" />
												<Skeleton className="h-4 w-64" />
												<Skeleton className="h-4 w-72" />
											</div>
											<Skeleton className="h-10 w-32" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : pending.length === 0 ? (
						<Card>
							<CardContent className="py-12 text-center text-muted-foreground">
								All approved interests already have payment plans. Great job!
							</CardContent>
						</Card>
					) : (
						pending.map((item) => (
							<Card key={`pending-${item.id}`} className="overflow-hidden">
								<CardHeader className="border-b bg-muted/40">
									<CardTitle className="flex items-center gap-3 text-lg font-semibold">
										<MapPin className="h-4 w-4 text-primary" />
										<span>{item.property?.title ?? "Property"}</span>
									</CardTitle>
									<CardDescription className="flex flex-wrap items-center gap-4 text-sm">
										<span className="flex items-center gap-2">
											<User className="h-4 w-4" />
											{`${item.member?.user?.first_name ?? "Member"} ${item.member?.user?.last_name ?? ""}`}
										</span>
										{item.property?.location && (
											<span className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												{item.property.location}
											</span>
										)}
										{item.property?.price !== undefined && (
											<span>{formatCurrency(Number(item.property.price ?? 0))}</span>
										)}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4 p-6">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant="outline" className="capitalize">
											Interest {item.status}
										</Badge>
										{item.funding_option && (
											<Badge className="capitalize">Funding: {item.funding_option.replace(/_/g, " ")}</Badge>
										)}
										{item.preferred_payment_methods && item.preferred_payment_methods.length > 0 && (
											<Badge variant="secondary" className="capitalize">
												Preferred: {item.preferred_payment_methods.map((method) => method.replace(/_/g, " ")).join(", ")}
											</Badge>
										)}
									</div>
									<div className="flex items-center justify-between">
										<div className="text-sm text-muted-foreground">
											Configure how payments should be collected for this property based on the member&apos;s chosen methods.
										</div>
										<Button asChild>
											<Link href={`/admin/property-payment-plans/setup/${item.id}`}>
												Configure Plan
												<ChevronsRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						))
					)}
				</TabsContent>

				<TabsContent value="plans">
					{loadingPlans ? (
						<div className="space-y-3">
							{skeletonArray.map((_, index) => (
								<Card key={`plans-skeleton-${index}`}>
									<CardContent className="p-6">
										<Skeleton className="h-5 w-48" />
										<div className="mt-4 grid gap-3 md:grid-cols-3">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-full" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : plans.length === 0 ? (
						<Card>
							<CardContent className="py-12 text-center text-muted-foreground">
								No property payment plans have been set up yet.
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{plans.map((plan) => {
								const configuredByLabel = (() => {
									if (typeof plan.configured_by === "object" && plan.configured_by !== null) {
										const user = plan.configured_by as { first_name?: string | null; last_name?: string | null; name?: string }
										const combined = [user.first_name, user.last_name].filter(Boolean).join(" ")
										return combined || user.name || "Admin"
									}
									if (typeof plan.configured_by === "string") {
										return plan.configured_by || "Admin"
									}
									return "Admin"
								})()

								const mixAllocations = plan.funding_option === "mix" ? plan.configuration?.mix_allocations : undefined
								const mixSummary = mixAllocations
									? Object.entries((mixAllocations.percentages ?? {}) as Record<string, number>)
									: []

								const memberName = plan.member?.user
									? `${plan.member.user.first_name ?? ""} ${plan.member.user.last_name ?? ""}`.trim()
									: "Member"

								return (
									<Card key={`plan-${plan.id}`} className="overflow-hidden">
										<CardHeader className="border-b bg-muted/40">
											<CardTitle className="flex items-center gap-3">
												<MapPin className="h-4 w-4 text-primary" />
												<span>{plan.property?.title ?? "Property"}</span>
											</CardTitle>
											<CardDescription className="flex flex-wrap items-center gap-3 text-sm">
												<span className="flex items-center gap-2">
													<User className="h-4 w-4" />
													{memberName}
												</span>
												{plan.property?.location && (
													<span className="flex items-center gap-2">
														<MapPin className="h-4 w-4" />
														{plan.property.location}
													</span>
												)}
												{plan.total_amount !== null && (
													<span>Total: {formatCurrency(Number(plan.total_amount ?? 0))}</span>
												)}
												{plan.remaining_balance !== null && (
													<span>Balance: {formatCurrency(Number(plan.remaining_balance ?? 0))}</span>
												)}
												{plan.starts_on && (
													<span className="flex items-center gap-2">
														<Calendar className="h-4 w-4" />
														Starts {new Date(plan.starts_on).toLocaleDateString()}
													</span>
												)}
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4 p-6">
											<div className="flex flex-wrap items-center gap-2">
												<Badge variant="outline" className="capitalize">
													Status: {plan.status}
												</Badge>
												{plan.funding_option && (
													<Badge variant="secondary" className="capitalize">
														Funding: {plan.funding_option.replace(/_/g, " ")}
													</Badge>
												)}
												{plan.selected_methods && plan.selected_methods.length > 0 && (
													<Badge className="capitalize">
														Methods: {plan.selected_methods.map((method) => method.replace(/_/g, " ")).join(", ")}
													</Badge>
												)}
											</div>
											{plan.funding_option === "mix" && mixSummary.length > 0 && (
												<div className="text-xs text-muted-foreground">
													Mix split:
													{mixSummary.map(([method, percentage], index) => {
														const amountsRecord = (mixAllocations?.amounts ?? {}) as Record<string, number>
														const amount = amountsRecord[method] ?? ((percentage ?? 0) / 100) * (Number(plan.total_amount ?? 0))
														return (
															<span key={`${plan.id}-${method}`}>
																{index > 0 ? ", " : " "}
																{method.replace(/_/g, " ")} ({Number(percentage ?? 0).toFixed(1)}%, {formatCurrency(amount)})
															</span>
														)
													})}
												</div>
											)}
											<div className="flex items-center justify-between text-sm text-muted-foreground">
												<span>Configured by {configuredByLabel}</span>
												<Button variant="outline" size="sm" asChild>
													<Link href={`/admin/property-payment-plans/${plan.id}`}>
														View Plan
														<ChevronsRight className="ml-2 h-4 w-4" />
													</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
