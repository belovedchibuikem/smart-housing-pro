export type PricingSource = {
  price?: number | string | null
  cost?: number | string | null
  total_slots?: number | null
  price_per_slot?: number | null
  total_listing_cost?: number | null
}

export function effectiveSlotCount(totalSlots?: number | null): number {
  const slots = Number(totalSlots ?? 0)
  return slots > 0 ? slots : 1
}

export function perSlotAmount(source: PricingSource): number {
  if (source.price_per_slot != null) return Number(source.price_per_slot) || 0
  return Number(source.price ?? source.cost ?? 0) || 0
}

export function totalListingCost(source: PricingSource): number {
  if (source.total_listing_cost != null) return Number(source.total_listing_cost) || 0
  return perSlotAmount(source) * effectiveSlotCount(source.total_slots)
}

export function subscriptionCost(source: PricingSource, slotsAssigned?: number | null): number {
  const slots = effectiveSlotCount(slotsAssigned)
  return perSlotAmount(source) * slots
}

export function formatNaira(amount: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits,
  }).format(amount)
}

export function formatPerSlotWithTotal(source: PricingSource): string {
  const perSlot = perSlotAmount(source)
  const slots = effectiveSlotCount(source.total_slots)
  const total = totalListingCost(source)
  return `${formatNaira(perSlot)}/slot × ${slots} = ${formatNaira(total)}`
}

export function formatPropertyTypeAndPriceWithSlots(
  typeLabel: string,
  source: PricingSource,
): string {
  const perSlot = perSlotAmount(source)
  return `${typeLabel} @ ${formatNaira(perSlot)}/slot`
}
