"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { PropertyListings } from "@/components/properties/property-listings"
import {
	BrowsePropertyFilters,
	browseFilterDefaults,
	type BrowseFilterValues,
} from "@/components/properties/browse-property-filters"
import { Pagination } from "@/components/ui/pagination"
import {
	getAvailableProperties,
	type AvailableProperty,
	type BrowsePropertiesPagination,
} from "@/lib/api/client"

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
	const [pagination, setPagination] = useState<BrowsePropertiesPagination | null>(null)
	const [filters, setFilters] = useState<BrowseFilterValues>(() => browseFilterDefaults())
	const [appliedFilters, setAppliedFilters] = useState<BrowseFilterValues>(() => browseFilterDefaults())
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(true)

	const loadAvailableProperties = useCallback(
		async (
			mode: "house" | "land" | "all",
			activeFilters: BrowseFilterValues,
			activePage: number,
		) => {
			try {
				setLoading(true)
				const response = await getAvailableProperties({
					type: mode,
					page: activePage,
					...activeFilters,
				})
				const formatted = (response.properties ?? []).map((property) => ({
					...property,
					property_type: property.property_type ?? null,
					type_label: property.type_label ?? null,
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
				setPagination(response.pagination ?? null)
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
		const mode = listing === "house" ? "house" : listing === "land" ? "land" : "all"
		void loadAvailableProperties(mode, appliedFilters, page)
	}, [listing, appliedFilters, page, loadAvailableProperties])

	useEffect(() => {
		setPage(1)
	}, [listing])

	const handleApplyFilters = () => {
		setAppliedFilters({ ...filters })
		setPage(1)
	}

	const handleResetFilters = () => {
		const defaults = browseFilterDefaults()
		setFilters(defaults)
		setAppliedFilters(defaults)
		setPage(1)
	}

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

			<BrowsePropertyFilters
				listing={listing}
				values={filters}
				onChange={setFilters}
				onApply={handleApplyFilters}
				onReset={handleResetFilters}
				loading={loading}
			/>

			{pagination ? (
				<p className="text-sm text-muted-foreground">
					Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} listing
					{pagination.total === 1 ? "" : "s"})
				</p>
			) : null}

			<PropertyListings properties={availableProperties} loading={loading} />

			{pagination && pagination.last_page > 1 ? (
				<Pagination
					currentPage={pagination.current_page}
					totalPages={pagination.last_page}
					onPageChange={setPage}
				/>
			) : null}
		</div>
	)
}
