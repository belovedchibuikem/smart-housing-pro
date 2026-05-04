"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { PropertyListings } from "@/components/properties/property-listings"
import { MyProperties } from "@/components/properties/my-properties"
import { PropertiesSummary } from "@/components/properties/investment-summary"
import {
	getAvailableProperties,
	getMemberProperties,
	getMemberLandPortfolio,
	type AvailableProperty,
	type MemberHouse,
	type MemberPropertiesSummary,
	type MemberLandSubscriptionRow,
} from "@/lib/api/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
							</div>
							<Link href={`/dashboard/my-lands/${row.subscription_id}`}>
								<Button size="sm" variant="secondary">
									View account
								</Button>
							</Link>
						</div>
						<p className="text-sm text-muted-foreground">Allocated size: {row.land_size ?? "—"}</p>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<p className="text-muted-foreground">Total cost</p>
								<p className="font-medium">₦{Number(row.total_cost).toLocaleString()}</p>
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

export default function PropertiesPage() {
	const { toast } = useToast()
	const searchParams = useSearchParams()

	const listing = useMemo(() => {
		const raw = searchParams?.get("listing")?.toLowerCase()
		if (raw === "all" || raw === "land" || raw === "house") {
			return raw
		}
		const legacy = searchParams?.get("type")?.toLowerCase()
		if (legacy === "land") {
			return "land"
		}
		return "house"
	}, [searchParams])

	const [activeTab, setActiveTab] = useState<string>("browse")
	const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([])
	const [memberProperties, setMemberProperties] = useState<MemberHouse[]>([])
	const [landRows, setLandRows] = useState<MemberLandSubscriptionRow[]>([])
	const [summary, setSummary] = useState<MemberPropertiesSummary | null>(null)
	const [loadingAvailable, setLoadingAvailable] = useState<boolean>(true)
	const [loadingMember, setLoadingMember] = useState<boolean>(true)
	const [loadingLand, setLoadingLand] = useState<boolean>(true)

	const loadAvailableProperties = useCallback(
		async (mode: "house" | "land" | "all") => {
			try {
				setLoadingAvailable(true)
				const response = await getAvailableProperties(mode)
				const formatted = (response.properties ?? []).map((property) => ({
					...property,
					price: Number(property.price ?? 0),
					size: property.size !== undefined && property.size !== null ? Number(property.size) : undefined,
					bedrooms: property.bedrooms ?? undefined,
					bathrooms: property.bathrooms ?? undefined,
					images: (property.images ?? []).map((image) => ({
						...image,
						url: image.url ?? (image as unknown as { image_url?: string }).image_url ?? "",
					})),
				}))
				setAvailableProperties(formatted)
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : "Unable to load listings"
				toast({
					title: "Listings unavailable",
					description: message,
					variant: "destructive",
				})
			} finally {
				setLoadingAvailable(false)
			}
		},
		[toast],
	)

	const loadMemberProperties = useCallback(
		async (type: "house" | "land") => {
			try {
				setLoadingMember(true)
				const response = await getMemberProperties(type)
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
				toast({
					title: "Could not load houses",
					description: message,
					variant: "destructive",
				})
			} finally {
				setLoadingMember(false)
			}
		},
		[toast],
	)

	const loadLandAccounts = useCallback(async () => {
		try {
			setLoadingLand(true)
			const res = await getMemberLandPortfolio()
			if (res.success && Array.isArray(res.data)) {
				setLandRows(res.data)
			} else {
				setLandRows([])
			}
		} catch {
			setLandRows([])
		} finally {
			setLoadingLand(false)
		}
	}, [])

	useEffect(() => {
		void loadAvailableProperties(listing === "house" ? "house" : listing === "land" ? "land" : "all")
	}, [listing, loadAvailableProperties])

	useEffect(() => {
		if (listing === "house") {
			void loadMemberProperties("house")
			setLandRows([])
			setLoadingLand(false)
			return
		}
		if (listing === "land") {
			void loadMemberProperties("land")
			void loadLandAccounts()
			return
		}
		void loadMemberProperties("house")
		void loadLandAccounts()
	}, [listing, loadMemberProperties, loadLandAccounts])

	const filterLinks = (
		<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
			<span className="text-sm font-medium text-muted-foreground">Show listings:</span>
			<div className="flex flex-wrap gap-2">
				<Button asChild size="sm" variant={listing === "all" ? "default" : "outline"}>
					<Link href="/dashboard/properties?listing=all">All</Link>
				</Button>
				<Button asChild size="sm" variant={listing === "house" ? "default" : "outline"}>
					<Link href="/dashboard/properties?listing=house">Houses</Link>
				</Button>
				<Button asChild size="sm" variant={listing === "land" ? "default" : "outline"}>
					<Link href="/dashboard/properties?listing=land">Land</Link>
				</Button>
			</div>
		</div>
	)

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Properties &amp; land</h1>
				<p className="mt-1 text-muted-foreground">Browse listings and manage your holdings.</p>
			</div>

			{filterLinks}

			<PropertiesSummary
				summary={summary}
				loading={loadingAvailable || loadingMember}
				propertyType={listing === "land" ? "land" : "house"}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="browse">Browse</TabsTrigger>
					<TabsTrigger value="mine">My portfolio</TabsTrigger>
				</TabsList>

				<TabsContent value="browse" className="space-y-4">
					<PropertyListings properties={availableProperties} loading={loadingAvailable} />
				</TabsContent>

				<TabsContent value="mine" className="space-y-8">
					{listing !== "land" ? (
						<section className="space-y-3">
							<h2 className="text-xl font-semibold">My houses / buildings</h2>
							<MyProperties properties={memberProperties} loading={loadingMember} propertyType="house" />
						</section>
					) : null}

					{listing !== "house" ? (
						<section className="space-y-3">
							<h2 className="text-xl font-semibold">My land</h2>
							{listing === "land" ? (
								<MyProperties properties={memberProperties} loading={loadingMember} propertyType="land" />
							) : null}
							<h3 className="text-sm font-medium text-muted-foreground">Subscribed parcels (payments &amp; balance)</h3>
							<MyLandAccounts rows={landRows} loading={loadingLand} />
						</section>
					) : null}
				</TabsContent>
			</Tabs>
		</div>
	)
}
