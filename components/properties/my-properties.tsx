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
import {
	MapPin,
	Calendar,
	Home,
	Clock,
	CheckCircle2,
	MapPinned,
	ArrowRight,
	ImageIcon,
} from "lucide-react"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"
import { resolveStorageUrl } from "@/lib/api/config"
import type { MemberHouse } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type MyPropertiesProps = {
	properties: MemberHouse[]
	loading?: boolean
	propertyType?: "house" | "land"
}

function formatCurrency(amount: number | null | undefined) {
	const value = Number(amount)
	if (!Number.isFinite(value)) {
		return "₦0"
	}
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
	}).format(value)
}

function allocationIdOf(property: MemberHouse): string | null {
	const id =
		property.allocation_id ??
		(property.property_id && property.id !== property.property_id ? property.id : null)
	return id || null
}

function paymentTone(status?: string | null, progress = 0) {
	const normalized = (status ?? "").toLowerCase().replace(/\s+/g, "_")
	if (progress >= 100 || ["paid", "completed", "fully_paid"].includes(normalized)) {
		return "success" as const
	}
	if (["partial", "partially_paid", "in_progress"].includes(normalized) || progress > 0) {
		return "warning" as const
	}
	return "danger" as const
}

function inventoryTone(status?: string | null) {
	const normalized = (status ?? "").toLowerCase()
	if (["sold", "held", "allocated", "completed"].includes(normalized)) return "default" as const
	if (["available", "open"].includes(normalized)) return "secondary" as const
	return "outline" as const
}

export function MyProperties({ properties, loading, propertyType = "house" }: MyPropertiesProps) {
	const hasData = properties.length > 0
	const router = useRouter()
	const { toast } = useToast()

	const isLand = propertyType === "land"
	const propertyLabel = isLand ? "land" : "house"
	const PropertyIcon = isLand ? MapPinned : Home

	const handleContinuePayment = useCallback(
		(property: MemberHouse) => {
			const isApproved = property.interest_status === "approved"
			const progressValue = property.payment_progress_percent ?? property.progress ?? 0
			const allocationId = allocationIdOf(property)
			const propertyId = property.property_id ?? property.id

			if (!isApproved) {
				toast({
					title: "Interest not approved yet",
					description:
						"You will be able to continue payment once your expression of interest is approved.",
				})
				return
			}

			if (progressValue >= 100) {
				toast({
					title: "Payment already completed",
					description: `This ${propertyLabel} has been paid in full. No further payments are required.`,
				})
				return
			}

			if (!isLand && allocationId) {
				router.push(`/dashboard/my-houses/${allocationId}`)
				return
			}

			router.push(`/dashboard/properties/${propertyId}?tab=payments`)
		},
		[router, toast, propertyLabel, isLand],
	)

	const content = useMemo(() => {
		if (loading) {
			return (
				<div className="space-y-5">
					{Array.from({ length: 2 }).map((_, index) => (
						<Card key={index} className="overflow-hidden border-border/70 shadow-sm">
							<div className="flex flex-col gap-0 lg:flex-row">
								<Skeleton className="h-52 w-full rounded-none lg:h-auto lg:w-72" />
								<div className="flex-1 space-y-4 p-6">
									<Skeleton className="h-7 w-2/3" />
									<Skeleton className="h-4 w-1/3" />
									<div className="grid gap-3 sm:grid-cols-3">
										<Skeleton className="h-16 w-full" />
										<Skeleton className="h-16 w-full" />
										<Skeleton className="h-16 w-full" />
									</div>
									<Skeleton className="h-3 w-full rounded-full" />
									<div className="flex gap-2 pt-2">
										<Skeleton className="h-9 w-36" />
										<Skeleton className="h-9 w-28" />
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			)
		}

		if (!hasData) {
			return (
				<Card className="border-dashed">
					<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<PropertyIcon className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="text-base font-semibold text-foreground">No {propertyLabel} yet</p>
							<p className="max-w-md text-sm text-muted-foreground">
								You have not started any {propertyLabel} acquisition. Browse listings and express
								interest to get started.
							</p>
						</div>
						<Button asChild size="sm">
							<Link href="/dashboard/browse-properties">Browse listings</Link>
						</Button>
					</div>
				</Card>
			)
		}

		return (
			<div className="space-y-5">
				{properties.map((property) => {
					const propertyId = property.property_id ?? property.id
					const allocationId = allocationIdOf(property)
					const rowKey = allocationId ?? property.interest_id ?? property.id
					const raw =
						property.images?.find((image) => image.is_primary)?.url || property.images?.[0]?.url
					const primaryImage = (raw && resolveStorageUrl(raw)) || null

					const progress = Math.min(
						100,
						Math.max(0, property.payment_progress_percent ?? property.progress ?? 0),
					)
					const isApproved = property.interest_status === "approved"
					const isPaidInFull = progress >= 100
					const slotLabel = property.slot_label || property.unit_address
					const locationLine = property.location || property.unit_address
					const typeLabel = getPropertyTypeLabel(property, isLand ? "Land" : "House")
					const salePrice = Number(property.sale_price ?? property.price ?? 0)
					const amountPaid = Number(property.amount_paid ?? property.total_paid ?? 0)
					const outstanding =
						property.outstanding != null
							? Number(property.outstanding)
							: Math.max(0, salePrice - amountPaid)
					const payTone = paymentTone(property.payment_status, progress)
					const accountHref =
						!isLand && allocationId
							? `/dashboard/my-houses/${allocationId}`
							: `/dashboard/properties/${propertyId}`

					const statusChips: Array<{ key: string; label: string; className?: string }> = []
					if (property.interest_status) {
						statusChips.push({
							key: "interest",
							label: isApproved ? "Interest approved" : `Interest ${property.interest_status}`,
							className: isApproved
								? "border-transparent bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground",
						})
					}
					if (property.funding_option) {
						statusChips.push({
							key: "funding",
							label: property.funding_option.replace(/_/g, " "),
							className: "capitalize",
						})
					}
					if (property.mortgage_flagged) {
						statusChips.push({
							key: "mortgage",
							label: "Mortgage review",
							className: "border-destructive/30 bg-destructive/10 text-destructive",
						})
					}

					return (
						<Card
							key={rowKey}
							className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="flex flex-col lg:flex-row">
								{/* Visual */}
								<div className="relative aspect-[16/10] w-full shrink-0 bg-muted lg:aspect-auto lg:w-72 lg:self-stretch">
									{primaryImage ? (
										<Image
											src={primaryImage}
											alt={property.title}
											fill
											sizes="(max-width: 1024px) 100vw, 288px"
											className="object-cover"
										/>
									) : (
										<div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-2 text-muted-foreground">
											<ImageIcon className="h-8 w-8 opacity-40" />
											<span className="text-xs">No photo</span>
										</div>
									)}
									<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-10 lg:hidden">
										<p className="line-clamp-1 text-sm font-semibold text-white">{property.title}</p>
									</div>
									{property.status ? (
										<Badge
											variant={inventoryTone(property.status)}
											className="absolute left-3 top-3 capitalize shadow-sm"
										>
											{property.status.replace(/_/g, " ")}
										</Badge>
									) : null}
								</div>

								{/* Content */}
								<div className="flex min-w-0 flex-1 flex-col">
									<div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
										{/* Header */}
										<div className="space-y-3">
											<div className="space-y-1.5">
												<h3 className="hidden text-xl font-semibold tracking-tight text-foreground lg:block sm:text-2xl">
													{property.title}
												</h3>
												<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
													{locationLine ? (
														<span className="inline-flex items-center gap-1.5">
															<MapPin className="h-3.5 w-3.5 shrink-0" />
															<span className="line-clamp-1">{locationLine}</span>
														</span>
													) : null}
													{slotLabel ? (
														<span className="inline-flex items-center gap-1.5 font-medium text-foreground">
															<PropertyIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
															{slotLabel}
															{property.slot_number != null ? (
																<span className="font-normal text-muted-foreground">
																	#{property.slot_number}
																</span>
															) : null}
														</span>
													) : null}
												</div>
												<p className="text-sm text-muted-foreground">{typeLabel}</p>
											</div>

											{statusChips.length > 0 ? (
												<div className="flex flex-wrap gap-1.5">
													{statusChips.map((chip) => (
														<Badge
															key={chip.key}
															variant="outline"
															className={cn("font-normal", chip.className)}
														>
															{chip.label}
														</Badge>
													))}
												</div>
											) : null}
										</div>

										{/* Financials */}
										<div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border/60">
											<div className="bg-background px-3 py-3 sm:px-4 sm:py-3.5">
												<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
													Sale price
												</p>
												<p className="mt-1 text-sm font-semibold tabular-nums sm:text-base">
													{formatCurrency(salePrice)}
												</p>
											</div>
											<div className="bg-background px-3 py-3 sm:px-4 sm:py-3.5">
												<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
													Paid
												</p>
												<p className="mt-1 text-sm font-semibold tabular-nums text-emerald-700 sm:text-base dark:text-emerald-400">
													{formatCurrency(amountPaid)}
												</p>
											</div>
											<div className="bg-background px-3 py-3 sm:px-4 sm:py-3.5">
												<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
													Outstanding
												</p>
												<p className="mt-1 text-sm font-semibold tabular-nums text-primary sm:text-base">
													{formatCurrency(outstanding)}
												</p>
											</div>
										</div>

										{/* Progress */}
										<div className="space-y-2.5">
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-foreground">Payment progress</span>
													<span
														className={cn(
															"rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
															payTone === "success" &&
																"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
															payTone === "warning" &&
																"bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
															payTone === "danger" &&
																"bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
														)}
													>
														{isPaidInFull
															? "Paid in full"
															: (property.payment_status || "unpaid").replace(/_/g, " ")}
													</span>
												</div>
												<span className="text-sm font-semibold tabular-nums text-foreground">
													{progress.toFixed(0)}%
												</span>
											</div>
											<Progress value={progress} className="h-2.5" />
											<p className="text-xs leading-relaxed text-muted-foreground">
												{isApproved
													? isPaidInFull
														? `Ownership payment for this ${propertyLabel} is complete.`
														: `Continue payments to complete your ${propertyLabel} ownership.`
													: "Interest pending approval. You’ll be notified once approved."}
												{property.preferred_payment_methods &&
												property.preferred_payment_methods.length > 0 ? (
													<>
														{" "}
														<span className="text-muted-foreground/90">
															Methods:{" "}
															{property.preferred_payment_methods
																.map((method) => method.replace(/_/g, " "))
																.join(", ")}
														</span>
													</>
												) : null}
											</p>
										</div>

										{/* Meta */}
										{(property.interest_created_at || property.allocation_date) && (
											<div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
												{property.interest_created_at ? (
													<span className="inline-flex items-center gap-1.5">
														<Calendar className="h-3.5 w-3.5" />
														Interest{" "}
														{new Date(property.interest_created_at).toLocaleDateString()}
													</span>
												) : null}
												{property.allocation_date ? (
													<span className="inline-flex items-center gap-1.5">
														<PropertyIcon className="h-3.5 w-3.5" />
														Allocated {property.allocation_date}
													</span>
												) : null}
												{property.tenure_status ? (
													<span className="capitalize">
														Tenure · {property.tenure_status.replace(/_/g, " ")}
													</span>
												) : null}
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="flex flex-col gap-2 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
										<div className="flex flex-wrap gap-2">
											<Button asChild size="sm" className="min-w-[9.5rem]">
												<Link href={accountHref}>
													{!isLand && allocationId ? "View house account" : "View details"}
													<ArrowRight className="ml-1.5 h-3.5 w-3.5" />
												</Link>
											</Button>
											{!isLand && allocationId ? (
												<Button asChild size="sm" variant="ghost">
													<Link href={`/dashboard/properties/${propertyId}`}>Property details</Link>
												</Button>
											) : null}
										</div>
										<Button
											size="sm"
											variant={isPaidInFull ? "secondary" : "outline"}
											disabled={!isApproved || isPaidInFull}
											onClick={() => handleContinuePayment(property)}
											className="sm:min-w-[10rem]"
										>
											{isPaidInFull ? (
												<span className="inline-flex items-center gap-1.5">
													<CheckCircle2 className="h-4 w-4" />
													Paid in full
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5">
													<Clock className="h-4 w-4" />
													Continue payment
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
