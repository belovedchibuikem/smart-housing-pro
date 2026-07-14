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
  name: string
  title?: string
  description?: string | null
  location?: string | null
  city?: string | null
  state?: string | null
  price: number
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
  property_type?: string | null
  image?: string | null
  images?: Array<{ url: string; is_primary?: boolean }>
  total_slots?: number | null
  slots_available?: number | null
  status?: string
  verification_status?: string
  is_verified?: boolean
  verification_code?: string | null
  verify_url?: string | null
  detail_url?: string | null
  published_at?: string | null
  marketplace_requested?: boolean
  rejection_reason?: string | null
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
}

export type MarketplaceFilters = {
  q?: string
  listing_kind?: string
  listing_type?: string
  state?: string
  city?: string
  min_price?: string | number
  max_price?: string | number
  min_size?: string | number
  max_size?: string | number
  bedrooms?: string | number
  vendor_slug?: string
  vendor_type?: string
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

export function formatMarketplacePrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price)
}
