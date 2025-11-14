"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Calendar, Home, Clock, CheckCircle2, TrendingUp, MapPinned } from "lucide-react"
import type { MemberHouse } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

type MyPropertiesProps = {
	properties: MemberHouse[]
	loading?: boolean
	propertyType?: "house" | "land"
}

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export function MyProperties({ properties, loading, propertyType = "house" }: MyPropertiesProps) {
	const hasData = properties.length > 0
	const router = useRouter()
	const { toast } = useToast()

	const isLand = propertyType === "land"
	const propertyLabel = isLand ? "land" : "house"
	const propertyLabelPlural = isLand ? "lands" : "houses"
	const PropertyIcon = isLand ? MapPinned : Home

	const handleContinuePayment = useCallback(
		(property: MemberHouse) => {
			const isApproved = property.interest_status === "approved"
			const progressValue = property.progress ?? 0

			if (!isApproved) {
				toast({
					title: `Interest not approved yet`,
					description: `You will be able to continue payment once your expression of interest is approved.`,
				})
				return
			}

			if (progressValue >= 100) {
				toast({
					title: `Payment already completed`,
					description: `This ${propertyLabel} has been paid in full. No further payments are required.`,
				})
				return
			}

			router.push(`/dashboard/properties/${property.id}?tab=payments`)
		},
		[router, toast, propertyLabel],
	)

	const content = useMemo(() => {
		if (loading) {
			return (
				<div className="space-y-4">
					{Array.from({ length: 2 }).map((_, index) => (
						<Card key={index} className="overflow-hidden">
							<div className="flex flex-col gap-4 p-6 md:flex-row">
								<Skeleton className="h-40 w-full md:w-64" />
								<div className="flex-1 space-y-4">
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<div className="grid gap-3 md:grid-cols-2">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
									</div>
									<Skeleton className="h-3 w-full rounded-full" />
								</div>
							</div>
						</Card>
					))}
				</div>
			)
		}

		if (!hasData) {
			return (
				<Card>
					<div className="py-12 text-center text-muted-foreground">
						You have not started any {propertyLabel} acquisition yet. Browse properties and express your interest to begin.
					</div>
				</Card>
			)
		}

		return (
			<div className="space-y-6">
				{properties.map((property) => {
					const primaryImage =
						property.images?.find((image) => image.is_primary)?.url || property.images?.[0]?.url || "/placeholder.svg"

					const progress = Math.min(100, Math.max(0, property.progress ?? 0))
					const progressLabel = `${progress.toFixed(0)}% paid`
					const isApproved = property.interest_status === "approved"
					const isPaidInFull = progress >= 100

					return (
						<Card key={property.id} className="overflow-hidden">
							<div className="flex flex-col md:flex-row">
								<div className="relative md:w-64">
									<Image
										src={primaryImage || "/placeholder.svg"}
										alt={property.title}
										width={640}
										height={360}
										className="h-48 w-full object-cover md:h-full"
									/>
									<Badge className="absolute left-4 top-4 capitalize">{property.status.replace("_", " ")}</Badge>
								</div>

								<div className="flex-1 space-y-5 p-6">
									<div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
										<div>
											<h3 className="text-2xl font-semibold">{property.title}</h3>
											<div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
												<MapPin className="h-4 w-4" />
												{property.location}
											</div>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											{property.interest_status && (
												<Badge variant={isApproved ? "default" : "secondary"} className="capitalize">
													Interest {property.interest_status}
												</Badge>
											)}
											{property.funding_option && (
												<Badge variant="outline" className="capitalize">
													Funding: {property.funding_option.replace(/_/g, " ")}
												</Badge>
											)}
											{property.mortgage_flagged && (
												<Badge variant="destructive" className="capitalize">
													Mortgage Review Required
												</Badge>
											)}
											{property.allocation_status && (
												<Badge variant="outline" className="capitalize">
													Allocation {property.allocation_status}
												</Badge>
											)}
										</div>
									</div>

									<div className="grid gap-4 lg:grid-cols-4">
										<div>
											<p className="text-xs uppercase tracking-wide text-muted-foreground">{isLand ? "Land Value" : "House Value"}</p>
											<p className="text-lg font-semibold">{formatCurrency(property.price)}</p>
										</div>
										<div>
											<p className="text-xs uppercase tracking-wide text-muted-foreground">Total Paid</p>
											<p className="text-lg font-semibold text-green-600">{formatCurrency(property.total_paid)}</p>
										</div>
										<div>
											<p className="text-xs uppercase tracking-wide text-muted-foreground">Current Value</p>
											<p className="text-lg font-semibold text-primary">{formatCurrency(property.current_value)}</p>
										</div>
										<div>
											<p className="text-xs uppercase tracking-wide text-muted-foreground">Predictive Value</p>
											<p className="text-lg font-semibold text-primary/80 flex items-center gap-2">
												<TrendingUp className="h-4 w-4" />
												{formatCurrency(property.predictive_value)}
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Payment Progress</span>
											<span className="font-medium">{progressLabel}</span>
										</div>
										<Progress value={progress} className="h-2" />
										<p className="text-xs text-muted-foreground">
											{isApproved
												? `Keep up with your payments to complete your ${propertyLabel} ownership.`
												: "Interest pending approval. You will be notified once approved."}
										</p>
										{property.preferred_payment_methods && property.preferred_payment_methods.length > 0 && (
											<p className="text-xs text-muted-foreground">
												Allowed payments:{" "}
												<span className="font-medium">
													{property.preferred_payment_methods.map((method) => method.replace(/_/g, " ")).join(", ")}
												</span>
											</p>
										)}
									</div>

									<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
										{property.interest_created_at && (
											<span className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												Interest submitted: {new Date(property.interest_created_at).toLocaleDateString()}
											</span>
										)}
										{property.allocation_date && (
											<span className="flex items-center gap-2">
												<PropertyIcon className="h-4 w-4" />
												Allocation date: {property.allocation_date}
											</span>
										)}
									</div>

									<div className="flex flex-wrap gap-2 border-t pt-4">
										<Link href={`/dashboard/properties/${property.id}`}>
											<Button size="sm" variant="outline">
												View Details
											</Button>
										</Link>
										<Button
											size="sm"
											variant="outline"
											disabled={!isApproved || isPaidInFull}
											onClick={() => handleContinuePayment(property)}
										>
											{isPaidInFull ? (
												<span className="flex items-center gap-1">
													<CheckCircle2 className="h-4 w-4" />
													Paid in Full
												</span>
											) : (
												<span className="flex items-center gap-1">
													<Clock className="h-4 w-4" />
													Continue Payment
												</span>
											)}
										</Button>
									</div>
								</div>
							</div>
						</Card>
					)
				})}
			</div>
		)
	}, [handleContinuePayment, hasData, properties, loading, isLand, propertyLabel, PropertyIcon])

	return content
}

