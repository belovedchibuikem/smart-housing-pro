export type MarketplaceListing = {
  id: string
  marketplace_id?: string
  tenant_id: string
  tenant_slug: string
  tenant_name: string
  tenant_logo_url?: string | null
  vendor_type?: string
  listing_kind: "house" | "land_parcel" | "land_legacy" | string
  listing_type?: string
  listing_category?: string | null
  listing_purpose?: string | null
  name: string
  title?: string
  description?: string | null
  location?: string | null
  city?: string | null
  lga?: string | null
  state?: string | null
  lat?: number | null
  lng?: number | null
  price: number
  member_price?: number | null
  non_member_price?: number | null
  old_price?: number | null
  is_negotiable?: boolean
  rent_deposit?: number | null
  lease_term_months?: number | null
  rental_units_available?: number | null
  is_rental?: boolean
  agent_profile_id?: string | null
  agent_name?: string | null
  size?: number | null
  size_sqm?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking_spaces?: number | null
  property_type?: string | null
  image?: string | null
  video_url?: string | null
  virtual_tour_url?: string | null
  images?: Array<{ url: string; is_primary?: boolean }>
  amenities?: string[]
  detail_meta?: Record<string, unknown>
  verification_history?: Array<{
    id: string
    action?: string | null
    notes?: string | null
    created_at?: string | null
    actor?: string | null
  }>
  total_slots?: number | null
  slots_available?: number | null
  status?: string
  verification_status?: string
  is_verified?: boolean
  government_verified?: boolean
  is_featured?: boolean
  is_premium?: boolean
  trust_score?: number | null
  verification_score?: number | null
  verification_code?: string | null
  verify_url?: string | null
  detail_url?: string | null
  published_at?: string | null
  marketplace_requested?: boolean
  rejection_reason?: string | null
  rental_units?: {
    min_rent?: number | null
    available_count?: number
    units?: Array<{
      id: string
      unit_number?: string | null
      unit_label?: string | null
      rent_amount?: number
      status?: string
    }>
  } | null
}

export type MarketplaceReview = {
  id: string
  author_name?: string | null
  rating: number
  body?: string | null
  created_at?: string
}

export type MarketplaceVendor = {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  vendor_type: string
  marketplace_featured?: boolean
  marketplace_tagline?: string | null
  primary_color?: string
  secondary_color?: string
  listing_count: number
  cac_number?: string | null
  cac_verified?: boolean
  vendor_cover_url?: string | null
  vendor_about?: string | null
  years_in_business?: number | null
  completed_projects_count?: number | null
}

export type MarketplaceFilters = {
  q?: string
  listing_kind?: string
  listing_type?: string
  listing_category?: string
  listing_purpose?: string
  property_type?: string
  state?: string
  city?: string
  lga?: string
  min_price?: string | number
  max_price?: string | number
  min_size?: string | number
  max_size?: string | number
  bedrooms?: string | number
  bathrooms?: string | number
  parking?: string | number
  vendor_slug?: string
  vendor_type?: string
  agent_profile_id?: string
  verified?: boolean | string
  featured?: boolean | string
  min_trust_score?: string | number
  lat?: string | number
  lng?: string | number
  radius_km?: string | number
  sort?: string
  page?: number
  per_page?: number
}

function toQuery(filters: MarketplaceFilters = {}): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return
    params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function fetchMarketplaceListings(filters: MarketplaceFilters = {}) {
  const res = await fetch(`/api/marketplace/listings${toQuery(filters)}`, { cache: "no-store" })
  if (!res.ok) {
    return { data: [] as MarketplaceListing[], pagination: { current_page: 1, last_page: 1, per_page: 24, total: 0 } }
  }
  const json = await res.json()
  return {
    data: (json.data || []) as MarketplaceListing[],
    pagination: json.pagination || { current_page: 1, last_page: 1, per_page: 24, total: 0 },
  }
}

export async function fetchMarketplaceListing(tenantSlug: string, kind: string, id: string) {
  const res = await fetch(`/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json.data || null) as MarketplaceListing | null
}

export async function fetchMarketplaceVendors(params?: { q?: string; vendor_type?: string; limit?: number }) {
  const res = await fetch(`/api/marketplace/vendors${toQuery(params || {})}`, { cache: "no-store" })
  if (!res.ok) return [] as MarketplaceVendor[]
  const json = await res.json()
  return (json.data || []) as MarketplaceVendor[]
}

export async function fetchMarketplaceStats() {
  const res = await fetch("/api/marketplace/stats", { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as {
    verified_listings: number
    pending_listings: number
    vendors: number
    houses: number
    lands: number
    rentals?: number
    agents?: number
  } | null
}

export async function fetchMarketplaceFeatured(limit = 12) {
  const res = await fetch(`/api/marketplace/featured?limit=${limit}`, { cache: "no-store" })
  if (!res.ok) return [] as MarketplaceListing[]
  const json = await res.json()
  return (json.data || []) as MarketplaceListing[]
}

export async function fetchTrendingLocations(limit = 12) {
  const res = await fetch(`/api/marketplace/trending-locations?limit=${limit}`, { cache: "no-store" })
  if (!res.ok) return [] as Array<{ state?: string; city?: string; count: number }>
  const json = await res.json()
  return (json.data || []) as Array<{ state?: string; city?: string; count: number }>
}

export async function fetchSimilarListings(tenantSlug: string, kind: string, id: string) {
  const res = await fetch(
    `/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/similar`,
    { cache: "no-store" }
  )
  if (!res.ok) return [] as MarketplaceListing[]
  const json = await res.json()
  return (json.data || []) as MarketplaceListing[]
}

export async function fetchHousingOsFlags() {
  const res = await fetch("/api/marketplace/flags", { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as Record<string, boolean> | null
}

export type MarketplaceAgent = {
  id: string
  tenant_slug: string
  display_name: string
  email?: string | null
  phone?: string | null
  bio?: string | null
  service_areas?: string[]
  rea_license_number?: string | null
  profile_photo_url?: string | null
  is_verified?: boolean
  closed_deals_count?: number
  active_listings?: number
}

export async function fetchMarketplaceAgents(params?: { q?: string; state?: string; limit?: number }) {
  const res = await fetch(`/api/marketplace/agents${toQuery(params || {})}`, { cache: "no-store" })
  if (!res.ok) return [] as MarketplaceAgent[]
  const json = await res.json()
  return (json.data || []) as MarketplaceAgent[]
}

export async function fetchMarketplaceAgent(id: string) {
  const res = await fetch(`/api/marketplace/agents/${encodeURIComponent(id)}`, { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return (json.data || null) as MarketplaceAgent | null
}

export async function submitMarketplaceInquiry(
  tenantSlug: string,
  kind: string,
  id: string,
  body: { name: string; email: string; phone?: string; message?: string; lead_type?: string; rental_unit_id?: string }
) {
  const res = await fetch(
    `/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/inquiry`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
  const json = await res.json()
  return { ok: res.ok, message: json.message as string, data: json.data }
}

export async function submitMarketplaceViewing(
  tenantSlug: string,
  kind: string,
  id: string,
  body: { name: string; email: string; phone?: string; preferred_at?: string; notes?: string }
) {
  const res = await fetch(
    `/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/viewing`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
  const json = await res.json()
  return { ok: res.ok, message: json.message as string, data: json.data }
}

export function formatRentalPrice(price: number): string {
  return `${formatMarketplacePrice(price)}/mo`
}

export async function verifyMarketplaceCode(code: string) {
  const res = await fetch(`/api/marketplace/verify/${encodeURIComponent(code)}`, { cache: "no-store" })
  const json = await res.json()
  return {
    ok: res.ok,
    valid: Boolean(json.valid),
    message: json.message as string,
    data: json.data as {
      verification_status: string
      verified_at?: string
      listing: MarketplaceListing
      vendor: { name: string; slug: string; logo_url?: string; vendor_type?: string }
    } | null,
  }
}

export function marketplaceListingPath(listing: Pick<MarketplaceListing, "tenant_slug" | "listing_kind" | "id">) {
  return `/saas/marketplace/${listing.tenant_slug}/${listing.listing_kind}/${listing.id}`
}

export function marketplaceQrUrl(listing: Pick<MarketplaceListing, "tenant_slug" | "listing_kind" | "id">) {
  return `/api/marketplace/listings/${encodeURIComponent(listing.tenant_slug)}/${encodeURIComponent(listing.listing_kind)}/${encodeURIComponent(listing.id)}/qr`
}

import { guestHeaders } from "@/lib/marketplace/guest-key"

export async function fetchFavoriteListings(): Promise<MarketplaceListing[]> {
  const res = await fetch("/api/marketplace/favorites", {
    cache: "no-store",
    headers: guestHeaders(),
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data || []) as MarketplaceListing[]
}

export async function addFavorite(marketplaceListingId: string): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch("/api/marketplace/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...guestHeaders() },
    body: JSON.stringify({ marketplace_listing_id: marketplaceListingId }),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, message: json.message }
}

export async function removeFavorite(marketplaceListingId: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/marketplace/favorites/${encodeURIComponent(marketplaceListingId)}`, {
    method: "DELETE",
    headers: guestHeaders(),
  })
  return { ok: res.ok }
}

export async function fetchListingReviews(
  tenantSlug: string,
  kind: string,
  id: string
): Promise<MarketplaceReview[]> {
  const res = await fetch(
    `/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/reviews`,
    { cache: "no-store" }
  )
  if (!res.ok) return []
  const json = await res.json()
  return (json.data || []) as MarketplaceReview[]
}

export async function submitListingReview(
  tenantSlug: string,
  kind: string,
  id: string,
  body: { rating: number; body?: string; author_name?: string }
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(
    `/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...guestHeaders() },
      body: JSON.stringify(body),
    }
  )
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, message: json.message }
}

export async function submitFraudReport(
  tenantSlug: string,
  kind: string,
  id: string,
  body: { reason: string; details?: string; reporter_email?: string }
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(
    `/api/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/report`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, message: json.message }
}

export function formatMarketplacePrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price)
}
