"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MyProperties } from "@/components/properties/my-properties"
import { PropertiesSummary } from "@/components/properties/investment-summary"
import {
	getMemberProperties,
	getMemberLandPortfolio,
	type MemberHouse,
	type MemberPropertiesSummary,
	type MemberLandSubscriptionRow,
} from "@/lib/api/client"

function MyLandAccounts({ rows, loading }: { rows: MemberLandSubscriptionRow[]; loading: boolean }) {
	if (loading) {
		return <p className="text-sm text-muted-foreground">Loading your land accounts…</p>
	}
	if (!rows.length) {
		return (
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground">
					You have no subscribed land parcels yet. When you are assigned land, it will appear here with balance and
					payments.
				</CardContent>
			</Card>
		)
	}
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{rows.map((row) => (
				<Card key={row.subscription_id}>
					<CardContent className="space-y-3 p-6">
						<div className="flex flex-wrap items-start justify-between gap-2">
							<div>
								<Badge variant="outline" className="mb-2">
									🌍 Land
								</Badge>
								<h3 className="text-lg font-semibold">{row.land_title ?? "Land parcel"}</h3>
								<p className="font-mono text-sm text-muted-foreground">{row.land_code}</p>
								{row.slot_label && (
									<p className="mt-1 text-sm font-medium">
										Slot: {row.slot_label}
										{row.slot_number != null ? ` (#${row.slot_number})` : ""}
									</p>
								)}
							</div>
							<Link href={`/dashboard/my-lands/${row.subscription_id}`}>
								<Button size="sm" variant="secondary">
									View account
								</Button>
							</Link>
						</div>
						<p className="text-sm text-muted-foreground">Allocated size: {row.land_size ?? "—"}</p>
						{row.tenure_status && (
							<Badge variant="secondary" className="capitalize">
								Tenure: {String(row.tenure_status).replace(/_/g, " ")}
							</Badge>
						)}
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<p className="text-muted-foreground">Sale price</p>
								<p className="font-medium">
									₦{Number(row.sale_price ?? row.total_cost).toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Paid</p>
								<p className="font-medium">₦{Number(row.amount_paid).toLocaleString()}</p>
							</div>
							<div className="col-span-2">
								<p className="text-muted-foreground">Outstanding</p>
								<p className="text-lg font-semibold text-primary">
									₦{Number(row.outstanding_balance).toLocaleString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default function MyPropertyPortfolioPage() {
	const { toast } = useToast()
	const searchParams = useSearchParams()
	const initialTab = searchParams?.get("tab") === "land" ? "land" : "houses"

	const [activeTab, setActiveTab] = useState(initialTab)
	const [memberProperties, setMemberProperties] = useState<MemberHouse[]>([])
	const [landProperties, setLandProperties] = useState<MemberHouse[]>([])
	const [landRows, setLandRows] = useState<MemberLandSubscriptionRow[]>([])
	const [summary, setSummary] = useState<MemberPropertiesSummary | null>(null)
	const [landSummary, setLandSummary] = useState<MemberPropertiesSummary | null>(null)
	const [loadingHouses, setLoadingHouses] = useState(true)
	const [loadingLand, setLoadingLand] = useState(true)

	const loadMemberHouses = useCallback(async () => {
		try {
			setLoadingHouses(true)
			const response = await getMemberProperties("house")
			if (response.success) {
				const formatted = (response.properties ?? []).map((property) => ({
					...property,
					price: Number(property.price ?? 0),
					total_paid: Number(property.total_paid ?? 0),
					current_value: Number(property.current_value ?? 0),
					predictive_value: Number(property.predictive_value ?? 0),
					progress: Number(property.progress ?? 0),
					images: (property.images ?? []).map((image) => ({
						...image,
						url: image.url ?? (image as unknown as { image_url?: string }).image_url ?? "",
					})),
				}))
				setMemberProperties(formatted)
				setSummary(response.summary)
			} else {
				setMemberProperties([])
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unable to load your properties"
			toast({ title: "Could not load houses", description: message, variant: "destructive" })
		} finally {
			setLoadingHouses(false)
		}
	}, [toast])

	const loadLandHoldings = useCallback(async () => {
		try {
			setLoadingLand(true)
			const [memberRes, portfolioRes] = await Promise.all([
				getMemberProperties("land"),
				getMemberLandPortfolio(),
			])
			if (memberRes.success) {
				setLandProperties(memberRes.properties ?? [])
				setLandSummary(memberRes.summary ?? null)
			} else {
				setLandProperties([])
				setLandSummary(null)
			}
			if (portfolioRes.success && Array.isArray(portfolioRes.data)) {
				setLandRows(portfolioRes.data)
			} else {
				setLandRows([])
			}
		} catch {
			setLandProperties([])
			setLandRows([])
			setLandSummary(null)
		} finally {
			setLoadingLand(false)
		}
	}, [])

	useEffect(() => {
		void loadMemberHouses()
		void loadLandHoldings()
	}, [loadMemberHouses, loadLandHoldings])

	useEffect(() => {
		setActiveTab(searchParams?.get("tab") === "land" ? "land" : "houses")
	}, [searchParams])

	const displayLandSummary = useMemo(() => {
		const interestCount = landProperties.length
		const subscriptionCount = landRows.length
		const base = landSummary ?? {
			total_properties: 0,
			houses_owned: 0,
			lands_owned: 0,
			total_paid: 0,
			current_value: 0,
			predictive_value: 0,
		}

		if (subscriptionCount === 0) {
			return base
		}

		const subscriptionPaid = landRows.reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0)
		const subscriptionValue = landRows.reduce((sum, row) => sum + Number(row.total_cost ?? 0), 0)

		return {
			...base,
			total_properties: Math.max(base.total_properties, interestCount + subscriptionCount),
			lands_owned: Math.max(base.lands_owned ?? 0, interestCount + subscriptionCount),
			total_paid: base.total_paid + subscriptionPaid,
			current_value: base.current_value + subscriptionValue,
			predictive_value: base.predictive_value + subscriptionValue * 1.12,
		}
	}, [landSummary, landProperties.length, landRows])

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold">My Property</h1>
					<p className="mt-1 text-muted-foreground">
						Only properties and land you own or are subscribed to appear here.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/properties/manage">Manage property</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/properties/sell">Sell property</Link>
					</Button>
					<Button asChild size="sm">
						<Link href="/dashboard/browse-properties">Browse listings</Link>
					</Button>
				</div>
			</div>

			<PropertiesSummary
				summary={activeTab === "land" ? displayLandSummary : summary}
				loading={activeTab === "land" ? loadingLand : loadingHouses}
				propertyType={activeTab === "land" ? "land" : "house"}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="houses">My houses</TabsTrigger>
					<TabsTrigger value="land">My land</TabsTrigger>
				</TabsList>

				<TabsContent value="houses" className="space-y-4">
					<MyProperties properties={memberProperties} loading={loadingHouses} propertyType="house" />
				</TabsContent>

				<TabsContent value="land" className="space-y-8">
					<section className="space-y-3">
						<h2 className="text-xl font-semibold">Assigned land parcels</h2>
						<MyProperties properties={landProperties} loading={loadingLand} propertyType="land" />
					</section>
					<section className="space-y-3">
						<h3 className="text-sm font-medium text-muted-foreground">Subscribed parcels (payments &amp; balance)</h3>
						<MyLandAccounts rows={landRows} loading={loadingLand} />
					</section>
				</TabsContent>
			</Tabs>
		</div>
	)
}
