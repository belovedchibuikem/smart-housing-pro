"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  EMPTY_LOCATION_FILTERS,
  type LocationFilterOptions,
  type PropertyLocationFilterValues,
} from "@/lib/properties/location-filters"
import { MapPin, RotateCcw } from "lucide-react"

type PropertyLocationFiltersProps = {
  filters: PropertyLocationFilterValues
  options: LocationFilterOptions | null
  loading?: boolean
  onChange: (filters: PropertyLocationFilterValues) => void
  showStatus?: boolean
}

export function PropertyLocationFilters({
  filters,
  options,
  loading = false,
  onChange,
  showStatus = true,
}: PropertyLocationFiltersProps) {
  const update = (patch: Partial<PropertyLocationFilterValues>) => {
    onChange({ ...filters, ...patch })
  }

  const handleEstateChange = (estateId: string) => {
    if (estateId === "all") {
      update({ estateId: "", location: "", city: "", state: "" })
      return
    }
    const estate = options?.estates.find((e) => e.id === estateId)
    if (!estate) {
      update({ estateId })
      return
    }
    update({
      estateId,
      location: estate.name,
      city: estate.city,
      state: estate.state,
    })
  }

  const hasActiveFilters =
    Boolean(filters.estateId || filters.location || filters.city || filters.state) ||
    (showStatus && filters.status !== "all")

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Filter by location / estate
        </div>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => onChange({ ...EMPTY_LOCATION_FILTERS })}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Select value={filters.estateId || "all"} onValueChange={handleEstateChange} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="All estates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All estates</SelectItem>
            {(options?.estates ?? []).map((estate) => (
              <SelectItem key={estate.id} value={estate.id}>
                {estate.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.location || "all"}
          onValueChange={(value) => update({ location: value === "all" ? "" : value, estateId: "" })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estate / area name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All area names</SelectItem>
            {(options?.locations ?? []).map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city || "all"}
          onValueChange={(value) => update({ city: value === "all" ? "" : value, estateId: "" })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {(options?.cities ?? []).map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.state || "all"}
          onValueChange={(value) => update({ state: value === "all" ? "" : value, estateId: "" })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {(options?.states ?? []).map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showStatus ? (
          <Select
            value={filters.status}
            onValueChange={(value) => update({ status: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="under_development">Under development</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </div>
    </div>
  )
}
