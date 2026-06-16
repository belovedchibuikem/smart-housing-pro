"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import type { BrowsePropertiesParams } from "@/lib/api/client"

export type BrowseFilterValues = Omit<BrowsePropertiesParams, "type" | "page">

type BrowsePropertyFiltersProps = {
	listing: "house" | "land" | "all"
	values: BrowseFilterValues
	onChange: (values: BrowseFilterValues) => void
	onApply: () => void
	onReset: () => void
	loading?: boolean
}

const defaultValues: BrowseFilterValues = {
	per_page: 12,
	sort: "newest",
}

export function browseFilterDefaults(): BrowseFilterValues {
	return { ...defaultValues }
}

export function BrowsePropertyFilters({
	listing,
	values,
	onChange,
	onApply,
	onReset,
	loading,
}: BrowsePropertyFiltersProps) {
	const [expanded, setExpanded] = useState(false)
	const showBedrooms = listing === "house" || listing === "all"

	const update = (patch: Partial<BrowseFilterValues>) => {
		onChange({ ...values, ...patch })
	}

	const hasActiveFilters = Boolean(
		values.search ||
			values.location ||
			values.min_price != null ||
			values.max_price != null ||
			values.min_size != null ||
			values.max_size != null ||
			values.min_bedrooms != null ||
			values.max_bedrooms != null ||
			(values.sort && values.sort !== "newest"),
	)

	return (
		<div className="space-y-3 rounded-lg border bg-card p-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end">
				<div className="flex-1 space-y-2">
					<Label htmlFor="browse-search">Search</Label>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="browse-search"
							placeholder="Title, location, land code…"
							className="pl-9"
							value={values.search ?? ""}
							onChange={(e) => update({ search: e.target.value || undefined })}
							onKeyDown={(e) => {
								if (e.key === "Enter") onApply()
							}}
						/>
					</div>
				</div>

				<div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[420px] lg:grid-cols-3">
					<div className="space-y-2">
						<Label>Sort</Label>
						<Select
							value={values.sort ?? "newest"}
							onValueChange={(sort) =>
								update({ sort: sort as BrowseFilterValues["sort"] })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Newest first</SelectItem>
								<SelectItem value="price_asc">Price: low to high</SelectItem>
								<SelectItem value="price_desc">Price: high to low</SelectItem>
								<SelectItem value="title_asc">Title: A–Z</SelectItem>
								<SelectItem value="title_desc">Title: Z–A</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Per page</Label>
						<Select
							value={String(values.per_page ?? 12)}
							onValueChange={(perPage) => update({ per_page: Number(perPage) })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="6">6</SelectItem>
								<SelectItem value="12">12</SelectItem>
								<SelectItem value="24">24</SelectItem>
								<SelectItem value="48">48</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
						<Button type="button" className="flex-1" onClick={onApply} disabled={loading}>
							Apply
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => setExpanded((v) => !v)}
							aria-expanded={expanded}
						>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{expanded ? (
				<div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-2">
						<Label htmlFor="browse-location">Location</Label>
						<Input
							id="browse-location"
							placeholder="City, state, area…"
							value={values.location ?? ""}
							onChange={(e) => update({ location: e.target.value || undefined })}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="browse-min-price">Min amount (₦)</Label>
						<Input
							id="browse-min-price"
							type="number"
							min={0}
							placeholder="0"
							value={values.min_price ?? ""}
							onChange={(e) =>
								update({
									min_price: e.target.value ? Number(e.target.value) : undefined,
								})
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="browse-max-price">Max amount (₦)</Label>
						<Input
							id="browse-max-price"
							type="number"
							min={0}
							placeholder="Any"
							value={values.max_price ?? ""}
							onChange={(e) =>
								update({
									max_price: e.target.value ? Number(e.target.value) : undefined,
								})
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="browse-min-size">{listing === "land" ? "Min size" : "Min size (sqm)"}</Label>
						<Input
							id="browse-min-size"
							type={listing === "land" ? "text" : "number"}
							min={listing === "land" ? undefined : 0}
							placeholder={listing === "land" ? "e.g. 500" : "0"}
							value={values.min_size ?? ""}
							onChange={(e) =>
								update({
									min_size: e.target.value
										? listing === "land"
											? e.target.value
											: Number(e.target.value)
										: undefined,
								})
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="browse-max-size">{listing === "land" ? "Max size" : "Max size (sqm)"}</Label>
						<Input
							id="browse-max-size"
							type={listing === "land" ? "text" : "number"}
							min={listing === "land" ? undefined : 0}
							placeholder="Any"
							value={values.max_size ?? ""}
							onChange={(e) =>
								update({
									max_size: e.target.value
										? listing === "land"
											? e.target.value
											: Number(e.target.value)
										: undefined,
								})
							}
						/>
					</div>
					{showBedrooms ? (
						<>
							<div className="space-y-2">
								<Label htmlFor="browse-min-bedrooms">Min bedrooms</Label>
								<Input
									id="browse-min-bedrooms"
									type="number"
									min={0}
									value={values.min_bedrooms ?? ""}
									onChange={(e) =>
										update({
											min_bedrooms: e.target.value ? Number(e.target.value) : undefined,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="browse-max-bedrooms">Max bedrooms</Label>
								<Input
									id="browse-max-bedrooms"
									type="number"
									min={0}
									value={values.max_bedrooms ?? ""}
									onChange={(e) =>
										update({
											max_bedrooms: e.target.value ? Number(e.target.value) : undefined,
										})
									}
								/>
							</div>
						</>
					) : null}
				</div>
			) : null}

			{hasActiveFilters ? (
				<div className="flex flex-wrap items-center gap-2 border-t pt-3">
					<span className="text-xs text-muted-foreground">Active filters applied</span>
					<Button type="button" variant="ghost" size="sm" onClick={onReset} className="h-7 gap-1 px-2">
						<X className="h-3 w-3" />
						Clear all
					</Button>
				</div>
			) : null}
		</div>
	)
}
