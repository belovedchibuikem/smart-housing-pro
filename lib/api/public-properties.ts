export interface PublicPropertyListing {
  id: string
  name: string
  type: string
  property_type?: string | null
  type_label?: string | null
  listing_kind: "house" | "land_parcel" | "land_legacy"
  location: string
  price: number
  member_price?: number | null
  non_member_price?: number | null
  size?: string | number | null
  bedrooms?: number | null
  bathrooms?: number | null
  image?: string | null
  description?: string | null
  images?: Array<{ url: string; is_primary?: boolean; alt_text?: string | null }>
  features?: string[]
  status?: string | null
  total_slots?: number | null
  slots_used?: number | null
  slots_available?: number | null
  accepting_interest?: boolean
  created_at?: string | null
  land_size?: string | null
  land_code?: string | null
  suitable_for?: string | null
  cost_includes_infrastructure?: boolean
  infrastructure_plan?: unknown
  land_features?: string[]
  title_documents?: unknown[]
}

export function propertyDetailPath(listing: Pick<PublicPropertyListing, "id" | "listing_kind">): string {
  const kind = listing.listing_kind === "house" ? "house" : "land"
  return `/properties/${listing.id}?kind=${kind}`
}

export async function fetchPublicProperties(params?: {
  search?: string
  type?: string
}): Promise<PublicPropertyListing[]> {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.type) query.set("type", params.type)

  const res = await fetch(`/api/public/properties?${query.toString()}`, { cache: "no-store" })
  if (!res.ok) return []

  const data = await res.json()
  return data.properties || []
}

export async function fetchPublicProperty(id: string, kind: string): Promise<PublicPropertyListing | null> {
  const res = await fetch(`/api/public/properties/${id}?kind=${encodeURIComponent(kind)}`, { cache: "no-store" })
  if (!res.ok) return null

  const data = await res.json()
  return data.property || null
}

export interface TenantLandingStats {
  hero: Array<{ label: string; value: string }>
  impact: Array<{ label: string; value: string; icon: string }>
}

export async function fetchTenantStats(): Promise<TenantLandingStats | null> {
  const res = await fetch("/api/public/tenant-stats", { cache: "no-store" })
  if (!res.ok) return null

  const data = await res.json()
  return data.stats || null
}

export function formatPropertyPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price)
}

export function isLandListing(listing: Pick<PublicPropertyListing, "listing_kind" | "type">): boolean {
  return listing.listing_kind === "land_parcel" || listing.listing_kind === "land_legacy" || listing.type === "land"
}
