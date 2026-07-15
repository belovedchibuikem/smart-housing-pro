"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { MarketplaceFilters } from "@/lib/api/marketplace"

type Props = {
  filters: MarketplaceFilters
  onChange: (next: MarketplaceFilters) => void
  onReset?: () => void
  vendors?: Array<{ slug: string; name: string }>
}

export function MarketplaceFiltersPanel({ filters, onChange, onReset, vendors = [] }: Props) {
  const set = (key: keyof MarketplaceFilters, value: string) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div>
        <h3 className="font-semibold mb-1">Filters</h3>
        <p className="text-xs text-muted-foreground">Results update as you refine your search.</p>
      </div>

      <div className="space-y-2">
        <Label>Search</Label>
        <Input
          placeholder="Title, city, vendor…"
          value={filters.q || ""}
          onChange={(e) => set("q", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Offer type</Label>
        <Select value={filters.listing_type || "all"} onValueChange={(v) => set("listing_type", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sale or rent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sale & rent</SelectItem>
            <SelectItem value="purchase">For sale</SelectItem>
            <SelectItem value="rental">For rent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={filters.listing_kind || "all"} onValueChange={(v) => set("listing_kind", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="house">Houses</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Min price</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={filters.min_price ?? ""}
            onChange={(e) => set("min_price", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max price</Label>
          <Input
            type="number"
            min={0}
            placeholder="Any"
            value={filters.max_price ?? ""}
            onChange={(e) => set("max_price", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Min size (m²)</Label>
          <Input
            type="number"
            min={0}
            value={filters.min_size ?? ""}
            onChange={(e) => set("min_size", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max size (m²)</Label>
          <Input
            type="number"
            min={0}
            value={filters.max_size ?? ""}
            onChange={(e) => set("max_size", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={filters.listing_category || "all"} onValueChange={(v) => set("listing_category", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="duplex">Duplex</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="short-let">Short let</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Purpose</Label>
        <Select value={filters.listing_purpose || "all"} onValueChange={(v) => set("listing_purpose", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Any purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="sale">Buy / Sale</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="lease">Lease</SelectItem>
            <SelectItem value="auction">Auction</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>LGA</Label>
        <Input
          placeholder="e.g. Eti-Osa"
          value={filters.lga || ""}
          onChange={(e) => set("lga", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>State</Label>
        <Input
          placeholder="e.g. Lagos"
          value={filters.state || ""}
          onChange={(e) => set("state", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>City</Label>
        <Input
          placeholder="e.g. Ikeja"
          value={filters.city || ""}
          onChange={(e) => set("city", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Bedrooms (min)</Label>
          <Select
            value={filters.bedrooms ? String(filters.bedrooms) : "all"}
            onValueChange={(v) => set("bedrooms", v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bathrooms (min)</Label>
          <Select
            value={filters.bathrooms ? String(filters.bathrooms) : "all"}
            onValueChange={(v) => set("bathrooms", v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Parking (min)</Label>
        <Select
          value={filters.parking ? String(filters.parking) : "all"}
          onValueChange={(v) => set("parking", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {vendors.length > 0 && (
        <div className="space-y-2">
          <Label>Vendor</Label>
          <Select value={filters.vendor_slug || "all"} onValueChange={(v) => set("vendor_slug", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.slug} value={v.slug}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select value={filters.sort || "newest"} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="trust_desc">Highest trust</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="size_desc">Largest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onReset && (
        <Button type="button" variant="outline" className="w-full" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </div>
  )
}
