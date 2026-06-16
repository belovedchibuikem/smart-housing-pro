"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { PropertyListings } from "@/components/properties/property-listings"
import { getAvailableProperties, type AvailableProperty } from "@/lib/api/client"

export default function BrowsePropertiesPage() {
	const { toast } = useToast()
	const searchParams = useSearchParams()

	const listing = useMemo(() => {
		const raw = searchParams?.get("listing")?.toLowerCase()
		if (raw === "all" || raw === "land" || raw === "house") {
			return raw
		}
		const legacy = searchParams?.get("type")?.toLowerCase()
		if (legacy === "land") return "land"
		return "all"
	}, [searchParams])

	const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([])
	const [loading, setLoading] = useState(true)

	const loadAvailableProperties = useCallback(
		async (mode: "house" | "land" | "all") => {
			try {
				setLoading(true)
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
				setLoading(false)
			}
		},
		[toast],
	)

	useEffect(() => {
		void loadAvailableProperties(listing === "house" ? "house" : listing === "land" ? "land" : "all")
	}, [listing, loadAvailableProperties])

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Browse properties &amp; land</h1>
				<p className="mt-1 text-muted-foreground">
					Explore available houses and land parcels. Express interest in listings that match your goals.
				</p>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
				<span className="text-sm font-medium text-muted-foreground">Show listings:</span>
				<div className="flex flex-wrap gap-2">
					<Button asChild size="sm" variant={listing === "all" ? "default" : "outline"}>
						<Link href="/dashboard/browse-properties?listing=all">All</Link>
					</Button>
					<Button asChild size="sm" variant={listing === "house" ? "default" : "outline"}>
						<Link href="/dashboard/browse-properties?listing=house">Houses</Link>
					</Button>
					<Button asChild size="sm" variant={listing === "land" ? "default" : "outline"}>
						<Link href="/dashboard/browse-properties?listing=land">Land</Link>
					</Button>
				</div>
			</div>

			<PropertyListings properties={availableProperties} loading={loading} />
		</div>
	)
}
