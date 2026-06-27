export type PropertyLocationFilterValues = {
  estateId: string
  location: string
  city: string
  state: string
  status: string
}

export const EMPTY_LOCATION_FILTERS: PropertyLocationFilterValues = {
  estateId: "",
  location: "",
  city: "",
  state: "",
  status: "all",
}

export type LocationFilterOptions = {
  locations: string[]
  cities: string[]
  states: string[]
  estates: Array<{
    id: string
    name: string
    city: string
    state: string
    label: string
  }>
}

export type LocationOverviewAssetBreakdown = {
  portfolio_value: number
  expected_revenue: number
  amount_collected: number
  outstanding: number
  subscriptions?: number
}

export type LocationOverviewRow = {
  id: string
  name: string
  city: string
  state: string
  location_label: string
  total_properties: number
  land_parcels: number
  allocated_properties: number
  available_properties: number
  occupancy_rate: number
  total_subscriptions: number
  active_subscriptions: number
  pending_subscriptions: number
  portfolio_value: number
  land_value: number
  total_value: number
  expected_subscription_revenue: number
  land_expected_revenue: number
  amount_collected: number
  land_amount_collected: number
  outstanding_balance: number
  house_outstanding: number
  land_outstanding: number
  collection_rate: number
  land_subscriptions: number
  maintenance_open: number
  maintenance_total: number
  houses: LocationOverviewAssetBreakdown
  land: LocationOverviewAssetBreakdown
}

export type LocationOverviewSummary = {
  total_locations: number
  total_properties: number
  total_land_parcels: number
  total_subscriptions: number
  total_value: number
  amount_collected: number
  outstanding_balance: number
  open_maintenance: number
  houses: LocationOverviewAssetBreakdown
  land: LocationOverviewAssetBreakdown
}

export function locationFiltersFromSearchParams(params: URLSearchParams): PropertyLocationFilterValues {
  return {
    estateId: params.get("estate_id") ?? "",
    location: params.get("location") ?? "",
    city: params.get("city") ?? "",
    state: params.get("state") ?? "",
    status: params.get("status") ?? "all",
  }
}

export function locationFiltersToQuery(filters: PropertyLocationFilterValues): Record<string, string> {
  const query: Record<string, string> = {}
  if (filters.estateId) query.estate_id = filters.estateId
  if (filters.location) query.location = filters.location
  if (filters.city) query.city = filters.city
  if (filters.state) query.state = filters.state
  if (filters.status && filters.status !== "all") query.status = filters.status
  return query
}

export function appendLocationFilters(params: URLSearchParams, filters: PropertyLocationFilterValues) {
  if (filters.estateId) params.set("estate_id", filters.estateId)
  if (filters.location) params.set("location", filters.location)
  if (filters.city) params.set("city", filters.city)
  if (filters.state) params.set("state", filters.state)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
}

import { formatCompactNaira, formatNairaAmount } from "@/lib/utils/currency"

export function formatNaira(value: number | undefined | null, compact = false) {
  return formatNairaAmount(value, { compact })
}

export function buildPropertiesFilterHref(filters: PropertyLocationFilterValues, segment: "houses" | "land" = "houses") {
  const params = new URLSearchParams()
  appendLocationFilters(params, filters)
  if (segment === "land") params.set("segment", "land")
  const qs = params.toString()
  return qs ? `/admin/properties?${qs}` : "/admin/properties"
}
